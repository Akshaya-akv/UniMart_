-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- USERS (Extends Supabase Auth)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  avatar_url text,
  department text,
  semester text,
  college_verified boolean default false,
  role text default 'student',
  points integer default 0,
  sustainability_score numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MEETUP LOCATIONS
create table meetup_locations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  active boolean default true
);

-- CATEGORIES
create table categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  icon text
);

-- LISTINGS
create table listings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  type text not null check (type in ('sell', 'lend', 'free')),
  category_id text not null, -- Storing category name directly for simplicity in MVP, or reference categories(id)
  price numeric default 0,
  condition text,
  department text,
  semester text,
  course_code text,
  status text default 'active' check (status in ('active', 'sold', 'lent', 'hidden')),
  meetup_location_id uuid references meetup_locations(id),
  return_date timestamp with time zone,
  image_url text, -- Simplified to single image for MVP. For multiple, create listing_images table
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SAVED LISTINGS
create table saved_listings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  listing_id uuid references listings(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, listing_id)
);

-- WISHLIST REQUESTS
create table wishlist_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  category text,
  budget numeric,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security)
alter table profiles enable row level security;
alter table listings enable row level security;
alter table saved_listings enable row level security;
alter table wishlist_requests enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Policies for Listings
create policy "Listings are viewable by everyone." on listings for select using (true);
create policy "Users can insert their own listings." on listings for insert with check (auth.uid() = user_id);
create policy "Users can update own listings." on listings for update using (auth.uid() = user_id);
create policy "Users can delete own listings." on listings for delete using (auth.uid() = user_id);

-- Policies for Saved Listings
create policy "Users can view own saved listings." on saved_listings for select using (auth.uid() = user_id);
create policy "Users can save listings." on saved_listings for insert with check (auth.uid() = user_id);
create policy "Users can unsave listings." on saved_listings for delete using (auth.uid() = user_id);

-- Policies for Wishlist
create policy "Wishlists are viewable by everyone." on wishlist_requests for select using (true);
create policy "Users can insert own wishlist." on wishlist_requests for insert with check (auth.uid() = user_id);
create policy "Users can update own wishlist." on wishlist_requests for update using (auth.uid() = user_id);
create policy "Users can delete own wishlist." on wishlist_requests for delete using (auth.uid() = user_id);

-- Function to handle new user profile creation on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
