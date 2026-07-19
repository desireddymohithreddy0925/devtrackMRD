create table if not exists project_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  name text not null,
  description text,
  due_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists project_tasks (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid not null references project_milestones(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index on project_milestones (user_id);
create index on project_tasks (milestone_id);

alter table project_milestones enable row level security;
alter table project_tasks enable row level security;

-- Milestones policies
create policy "project_milestones_select_own" on project_milestones for select using (user_id = auth.uid()::text);
create policy "project_milestones_insert_own" on project_milestones for insert with check (user_id = auth.uid()::text);
create policy "project_milestones_update_own" on project_milestones for update using (user_id = auth.uid()::text);
create policy "project_milestones_delete_own" on project_milestones for delete using (user_id = auth.uid()::text);

-- Tasks policies (User must own the parent milestone)
create policy "project_tasks_select_own" on project_tasks for select using (
  exists (select 1 from project_milestones where id = milestone_id and user_id = auth.uid()::text)
);
create policy "project_tasks_insert_own" on project_tasks for insert with check (
  exists (select 1 from project_milestones where id = milestone_id and user_id = auth.uid()::text)
);
create policy "project_tasks_update_own" on project_tasks for update using (
  exists (select 1 from project_milestones where id = milestone_id and user_id = auth.uid()::text)
);
create policy "project_tasks_delete_own" on project_tasks for delete using (
  exists (select 1 from project_milestones where id = milestone_id and user_id = auth.uid()::text)
);
