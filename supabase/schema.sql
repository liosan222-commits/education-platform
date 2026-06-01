-- Education Platform Schema
create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  phone text,
  password text not null,
  role text check (role in ('super_admin', 'teacher', 'student')),
  is_approved boolean default false,
  current_session_token text,
  created_at timestamp default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  teacher_id uuid references public.users(id) on delete cascade,
  price numeric default 0,
  thumbnail text,
  is_active boolean default true,
  created_at timestamp default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  description text,
  video_url text,
  duration integer,
  lesson_order integer,
  created_at timestamp default now()
);

create table if not exists public.user_course_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  purchased_at timestamp default now(),
  expires_at timestamp,
  payment_proof text,
  unique(user_id, course_id)
);

alter table public.users enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.user_course_access enable row level security;
