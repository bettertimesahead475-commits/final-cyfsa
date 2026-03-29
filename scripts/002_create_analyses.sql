-- Create document analyses table for storing analysis history
create table if not exists public.document_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  
  -- Document metadata
  document_name text,
  document_type text,
  content_preview text, -- First 500 chars for reference
  
  -- Analysis results (stored as JSONB)
  analysis_result jsonb not null,
  
  -- Summary fields for querying
  total_flags integer default 0,
  high_severity_count integer default 0,
  medium_severity_count integer default 0,
  low_severity_count integer default 0,
  risk_level text, -- 'low', 'medium', 'high', 'critical'
  lawyer_review_recommended boolean default false,
  
  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index for faster user queries
create index if not exists idx_analyses_user_id on public.document_analyses(user_id);
create index if not exists idx_analyses_created_at on public.document_analyses(created_at desc);
create index if not exists idx_analyses_risk_level on public.document_analyses(risk_level);

-- Enable RLS
alter table public.document_analyses enable row level security;

-- RLS policies - users can only access their own analyses
create policy "analyses_select_own" on public.document_analyses 
  for select using (auth.uid() = user_id);

create policy "analyses_insert_own" on public.document_analyses 
  for insert with check (auth.uid() = user_id);

create policy "analyses_update_own" on public.document_analyses 
  for update using (auth.uid() = user_id);

create policy "analyses_delete_own" on public.document_analyses 
  for delete using (auth.uid() = user_id);

-- Function to update the updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger to auto-update updated_at
drop trigger if exists update_analyses_updated_at on public.document_analyses;

create trigger update_analyses_updated_at
  before update on public.document_analyses
  for each row
  execute function public.update_updated_at_column();
