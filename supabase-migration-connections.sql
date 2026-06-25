-- Migration: Connection Requests, Connections, and Notifications
-- For the "Bond" social feature on Fond

-- ─── Connection Requests ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.connection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent duplicate pending requests between same users
CREATE UNIQUE INDEX IF NOT EXISTS idx_connection_requests_pending
  ON public.connection_requests(sender_id, receiver_id) WHERE status = 'pending';

-- Index for looking up requests by user
CREATE INDEX IF NOT EXISTS idx_connection_requests_sender
  ON public.connection_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_receiver
  ON public.connection_requests(receiver_id);

-- Updated_at trigger
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_connection_request_updated') THEN
    CREATE TRIGGER on_connection_request_updated
      BEFORE UPDATE ON public.connection_requests
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- RLS
ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own connection requests') THEN
    CREATE POLICY "Users can view their own connection requests"
      ON public.connection_requests FOR SELECT
      USING (sender_id = auth.uid() OR receiver_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can send connection requests') THEN
    CREATE POLICY "Users can send connection requests"
      ON public.connection_requests FOR INSERT
      WITH CHECK (sender_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update requests they received') THEN
    CREATE POLICY "Users can update requests they received"
      ON public.connection_requests FOR UPDATE
      USING (receiver_id = auth.uid());
  END IF;
END $$;


-- ─── Connections (bidirectional friendship) ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  connected_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id)
);

-- Prevent self-connections
ALTER TABLE public.connections ADD CONSTRAINT check_not_self
  CHECK (user_id <> connected_user_id);

-- Index for looking up a user's connections
CREATE INDEX IF NOT EXISTS idx_connections_user ON public.connections(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_connected ON public.connections(connected_user_id);

-- RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own connections') THEN
    CREATE POLICY "Users can view their own connections"
      ON public.connections FOR SELECT
      USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own connections') THEN
    CREATE POLICY "Users can manage their own connections"
      ON public.connections FOR INSERT OR DELETE
      USING (user_id = auth.uid());
  END IF;
END $$;


-- ─── Notifications ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'connection_request',
    'connection_accepted',
    'clique_invite',
    'clique_joined'
  )),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reference_id UUID,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fetching user's notifications (unread first, newest first)
CREATE INDEX IF NOT EXISTS idx_notifications_user
  ON public.notifications(user_id, read, created_at DESC);

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own notifications') THEN
    CREATE POLICY "Users can view their own notifications"
      ON public.notifications FOR SELECT
      USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own notifications') THEN
    CREATE POLICY "Users can update their own notifications"
      ON public.notifications FOR UPDATE
      USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'System can create notifications') THEN
    CREATE POLICY "System can create notifications"
      ON public.notifications FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;
