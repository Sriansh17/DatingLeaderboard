# Database Migrations via Terminal

> Run SQL migrations directly from your terminal without opening the Supabase dashboard.

---

## Setup (One-Time)

### Step 1: Create the `pg_query` function in Supabase

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
CREATE OR REPLACE FUNCTION pg_query(query text)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
  RETURN jsonb_build_object('success', true);
END;
$$;
```

This creates a function that lets the migration script execute raw SQL over HTTP.

### Step 2: Ensure `.env.local` has the service role key

Check that this line exists in `loveboard/.env.local`:

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

(It already does — this was set during project setup.)

---

## Usage

### Run a single SQL statement

```bash
cd loveboard
node scripts/migrate.mjs "ALTER TABLE public.circles ADD COLUMN IF NOT EXISTS passcode TEXT;"
```

### Run multiple statements at once

```bash
node scripts/migrate.mjs "
  ALTER TABLE public.circles ADD COLUMN IF NOT EXISTS invite_expires_at TIMESTAMPTZ;
  ALTER TABLE public.circles ADD COLUMN IF NOT EXISTS passcode TEXT;
"
```

### Run from a `.sql` file

```bash
node scripts/migrate.mjs < migrations/add-passcode.sql
```

---

## Notes

- The script reads `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_URL` from `.env.local` automatically.
- Any collaborator with the repo cloned and `.env.local` in place can run migrations.
- The `SUPABASE_SERVICE_ROLE_KEY` is the **master key** — it bypasses all Row Level Security. Only share `.env.local` with trusted collaborators.
- The `pg_query` function is secured with `SECURITY DEFINER`, meaning it runs with the privileges of the user who created it (the Supabase superuser), so it can alter schemas.
