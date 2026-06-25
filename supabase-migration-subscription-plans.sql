-- Migration: Enhanced subscription plan tracking
-- For the Premium subscription feature on Fond

-- Add plan tracking columns to subscriptions table
ALTER TABLE IF EXISTS public.subscriptions
  ADD COLUMN IF NOT EXISTS plan_id TEXT,
  ADD COLUMN IF NOT EXISTS amount INTEGER,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Index for looking up active subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_active
  ON public.subscriptions(user_id) WHERE status = 'active';

-- Updated_at trigger for subscriptions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_subscription_updated') THEN
    CREATE TRIGGER on_subscription_updated
      BEFORE UPDATE ON public.subscriptions
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;
