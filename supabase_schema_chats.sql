-- CHATS
create table chats (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references listings(id) on delete cascade not null,
  buyer_id uuid references profiles(id) on delete cascade not null,
  seller_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(listing_id, buyer_id)
);

-- MESSAGES
create table messages (
  id uuid default uuid_generate_v4() primary key,
  chat_id uuid references chats(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table chats enable row level security;
alter table messages enable row level security;

-- Policies for Chats
create policy "Users can view their own chats." on chats for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "Users can insert chats they are part of." on chats for insert with check (auth.uid() = buyer_id or auth.uid() = seller_id);

-- Policies for Messages
create policy "Users can view messages in their chats." on messages for select using (
  exists (select 1 from chats where chats.id = messages.chat_id and (chats.buyer_id = auth.uid() or chats.seller_id = auth.uid()))
);
create policy "Users can insert messages in their chats." on messages for insert with check (auth.uid() = sender_id);
create policy "Users can update read status of received messages." on messages for update using (
  exists (select 1 from chats where chats.id = messages.chat_id and (chats.buyer_id = auth.uid() or chats.seller_id = auth.uid()))
  and sender_id != auth.uid()
);
