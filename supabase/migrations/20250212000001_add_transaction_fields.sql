
-- Add support for transaction status, due dates and recurrence
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'overdue')),
ADD COLUMN IF NOT EXISTS due_date timestamptz DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS recurrence text DEFAULT 'none' CHECK (recurrence IN ('none', 'monthly', 'weekly', 'yearly'));

-- Backfill existing data
UPDATE public.transactions SET status = 'paid' WHERE status IS NULL;
UPDATE public.transactions SET due_date = date WHERE due_date IS NULL;
