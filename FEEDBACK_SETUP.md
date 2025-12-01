# Feedback Feature Setup

To enable the feedback feature, you need to create a `feedback` table in your Supabase database.

Run the following SQL in your Supabase SQL Editor:

```sql
-- 1. Create Feedback Table
create table feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  message text not null,
  created_at timestamp with time zone default now()
);

-- 2. Enable RLS
alter table feedback enable row level security;

-- 3. Create Policy (Allow users to submit feedback)
create policy "Users can insert own feedback"
on feedback for insert to authenticated
with check (auth.uid() = user_id);

-- Optional: Allow users to view their own feedback (if needed in future)
create policy "Users can view own feedback"
on feedback for select to authenticated
using (auth.uid() = user_id);
```
