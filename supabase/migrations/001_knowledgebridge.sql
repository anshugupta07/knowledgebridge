create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  name text not null,
  description text not null default '',
  status text not null default 'active' check (status in ('active', 'on_hold', 'completed', 'archived')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'project_manager', 'outgoing_member', 'incoming_member', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  storage_path text not null,
  mime_type text not null,
  processing_status text not null default 'queued' check (processing_status in ('queued', 'processing', 'processed', 'failed')),
  uploaded_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.extracted_knowledge (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null,
  kind text not null,
  content jsonb not null,
  evidence text not null,
  confidence text not null check (confidence in ('high', 'medium', 'low', 'needs_verification')),
  created_at timestamptz not null default now()
);

create table if not exists public.handover_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  content jsonb not null,
  status text not null default 'draft' check (status in ('draft', 'under_review', 'approved', 'shared')),
  created_by uuid not null references auth.users(id),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.handover_acknowledgements (
  report_id uuid not null references public.handover_reports(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  acknowledged_at timestamptz not null default now(),
  primary key (report_id, user_id)
);

create index if not exists projects_created_by_idx on public.projects(created_by);
create index if not exists documents_project_id_idx on public.documents(project_id);
create index if not exists knowledge_project_id_idx on public.extracted_knowledge(project_id);
create index if not exists handovers_project_id_idx on public.handover_reports(project_id);
create index if not exists handover_acknowledgements_user_id_idx on public.handover_acknowledgements(user_id);

create or replace function public.is_project_member(
  requested_project_id uuid,
  requested_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.project_members
    where project_id = requested_project_id
      and user_id = requested_user_id
  );
$$;

create or replace function public.has_project_role(
  requested_project_id uuid,
  requested_user_id uuid,
  allowed_roles text[]
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.project_members
    where project_id = requested_project_id
      and user_id = requested_user_id
      and role = any(allowed_roles)
  );
$$;

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.documents enable row level security;
alter table public.extracted_knowledge enable row level security;
alter table public.handover_reports enable row level security;
alter table public.handover_acknowledgements enable row level security;

create policy "users can read their own profile" on public.profiles for select using (id = auth.uid());
create policy "users can create their own profile" on public.profiles for insert with check (id = auth.uid());
create policy "users can update their own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "members can read projects" on public.projects for select using (
  created_by = auth.uid() or public.is_project_member(id, auth.uid())
);
create policy "owners can create projects" on public.projects for insert with check (created_by = auth.uid());
create policy "owners can update projects" on public.projects for update using (created_by = auth.uid());
create policy "owners can delete projects" on public.projects for delete using (created_by = auth.uid());
create policy "members can read project members" on public.project_members for select using (
  user_id = auth.uid() or exists (select 1 from public.projects p where p.id = project_id and p.created_by = auth.uid())
);
create policy "project admins can add members" on public.project_members for insert with check (
  exists (
    select 1 from public.projects p
    where p.id = project_id and (
      p.created_by = auth.uid() or public.has_project_role(project_id, auth.uid(), array['admin', 'project_manager'])
    )
  )
);
create policy "project admins can update members" on public.project_members for update using (
  exists (
    select 1 from public.projects p
    where p.id = project_id and (
      p.created_by = auth.uid() or public.has_project_role(project_id, auth.uid(), array['admin', 'project_manager'])
    )
  )
) with check (
  exists (
    select 1 from public.projects p
    where p.id = project_id and (
      p.created_by = auth.uid() or public.has_project_role(project_id, auth.uid(), array['admin', 'project_manager'])
    )
  )
);
create policy "project admins can remove members" on public.project_members for delete using (
  exists (
    select 1 from public.projects p
    where p.id = project_id and (
      p.created_by = auth.uid() or public.has_project_role(project_id, auth.uid(), array['admin', 'project_manager'])
    )
  )
);
create policy "members can read documents" on public.documents for select using (
  exists (select 1 from public.projects p where p.id = project_id and (p.created_by = auth.uid() or public.is_project_member(p.id, auth.uid())))
);
create policy "project contributors can create documents" on public.documents for insert with check (
  uploaded_by = auth.uid() and exists (
    select 1 from public.projects p
    where p.id = project_id and (
      p.created_by = auth.uid() or exists (
        select 1 where public.has_project_role(project_id, auth.uid(), array['admin', 'project_manager', 'outgoing_member'])
      )
    )
  )
);
create policy "project contributors can update documents" on public.documents for update using (
  exists (
    select 1 from public.projects p
    where p.id = project_id and (
      p.created_by = auth.uid() or public.has_project_role(project_id, auth.uid(), array['admin', 'project_manager', 'outgoing_member'])
    )
  )
) with check (
  uploaded_by = auth.uid() and exists (
    select 1 from public.projects p
    where p.id = project_id and (
      p.created_by = auth.uid() or exists (
        select 1 where public.has_project_role(project_id, auth.uid(), array['admin', 'project_manager', 'outgoing_member'])
      )
    )
  )
);
create policy "project contributors can delete documents" on public.documents for delete using (
  exists (
    select 1 from public.projects p
    where p.id = project_id and (
      p.created_by = auth.uid() or public.has_project_role(project_id, auth.uid(), array['admin', 'project_manager', 'outgoing_member'])
    )
  )
);
create policy "members can read extracted knowledge" on public.extracted_knowledge for select using (
  exists (select 1 from public.projects p where p.id = project_id and (p.created_by = auth.uid() or public.is_project_member(p.id, auth.uid())))
);
create policy "project contributors can create extracted knowledge" on public.extracted_knowledge for insert with check (
  exists (
    select 1 from public.projects p
    where p.id = project_id and (
      p.created_by = auth.uid() or public.has_project_role(project_id, auth.uid(), array['admin', 'project_manager', 'outgoing_member'])
    )
  )
);
create policy "project contributors can update extracted knowledge" on public.extracted_knowledge for update using (
  exists (
    select 1 from public.projects p
    where p.id = project_id and (
      p.created_by = auth.uid() or public.has_project_role(project_id, auth.uid(), array['admin', 'project_manager', 'outgoing_member'])
    )
  )
) with check (
  exists (
    select 1 from public.projects p
    where p.id = project_id and (
      p.created_by = auth.uid() or public.has_project_role(project_id, auth.uid(), array['admin', 'project_manager', 'outgoing_member'])
    )
  )
);
create policy "project contributors can delete extracted knowledge" on public.extracted_knowledge for delete using (
  exists (
    select 1 from public.projects p
    where p.id = project_id and (
      p.created_by = auth.uid() or public.has_project_role(project_id, auth.uid(), array['admin', 'project_manager', 'outgoing_member'])
    )
  )
);
create policy "members can read handovers" on public.handover_reports for select using (
  exists (select 1 from public.projects p where p.id = project_id and (p.created_by = auth.uid() or public.is_project_member(p.id, auth.uid())))
);
create policy "project contributors can create handovers" on public.handover_reports for insert with check (
  created_by = auth.uid() and exists (
    select 1 from public.projects p
    where p.id = project_id and (
      p.created_by = auth.uid() or public.has_project_role(project_id, auth.uid(), array['admin', 'project_manager', 'outgoing_member'])
    )
  )
);
create policy "authorized members can update handovers" on public.handover_reports for update using (
  exists (
    select 1 from public.projects p
    where p.id = project_id and (
      p.created_by = auth.uid() or public.has_project_role(project_id, auth.uid(), array['admin', 'project_manager', 'outgoing_member'])
    )
  )
) with check (
  (approved_by is null or approved_by = auth.uid())
  and (status not in ('approved', 'shared') or exists (
    select 1 from public.projects p
    where p.id = project_id and (
      p.created_by = auth.uid() or public.has_project_role(project_id, auth.uid(), array['admin', 'project_manager'])
    )
  ))
  and exists (
    select 1 from public.projects p
    where p.id = project_id and (
      p.created_by = auth.uid() or public.has_project_role(project_id, auth.uid(), array['admin', 'project_manager', 'outgoing_member'])
    )
  )
);
create policy "project admins can delete handovers" on public.handover_reports for delete using (
  exists (
    select 1 from public.projects p
    where p.id = project_id and (
      p.created_by = auth.uid() or public.has_project_role(project_id, auth.uid(), array['admin', 'project_manager'])
    )
  )
);
create policy "incoming members can read acknowledgements" on public.handover_acknowledgements for select using (
  user_id = auth.uid() or exists (
    select 1 from public.handover_reports hr
    join public.projects p on p.id = hr.project_id
    where hr.id = report_id and (
      p.created_by = auth.uid() or public.has_project_role(p.id, auth.uid(), array['admin', 'project_manager', 'outgoing_member'])
    )
  )
);
create policy "incoming members can acknowledge shared handovers" on public.handover_acknowledgements for insert with check (
  user_id = auth.uid() and exists (
    select 1 from public.handover_reports hr
    join public.projects p on p.id = hr.project_id
    where hr.id = report_id and hr.status = 'shared'
    and public.has_project_role(p.id, auth.uid(), array['incoming_member'])
  )
);
