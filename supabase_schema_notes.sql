-- NOTES
create table notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  course_code text not null,
  department text not null,
  semester text not null,
  file_url text not null, -- Can be a Supabase Storage URL or a Google Drive link
  file_type text not null check (file_type in ('pdf', 'link', 'doc')),
  upvotes integer default 0,
  downloads integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- NOTE UPVOTES (To prevent multiple upvotes from same user)
create table note_upvotes (
  id uuid default uuid_generate_v4() primary key,
  note_id uuid references notes(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(note_id, user_id)
);

-- RLS
alter table notes enable row level security;
alter table note_upvotes enable row level security;

-- Policies
create policy "Notes are viewable by everyone." on notes for select using (true);
create policy "Users can insert own notes." on notes for insert with check (auth.uid() = user_id);
create policy "Users can update own notes." on notes for update using (auth.uid() = user_id);
create policy "Users can delete own notes." on notes for delete using (auth.uid() = user_id);
-- Allow anyone to update upvotes/downloads (simplified for MVP)
create policy "Anyone can update note metrics." on notes for update using (true);

create policy "Upvotes viewable by everyone." on note_upvotes for select using (true);
create policy "Users can upvote." on note_upvotes for insert with check (auth.uid() = user_id);
create policy "Users can remove upvote." on note_upvotes for delete using (auth.uid() = user_id);
