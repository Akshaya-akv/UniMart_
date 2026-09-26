-- REVIEWS
create table reviews (
  id uuid default uuid_generate_v4() primary key,
  target_user_id uuid references profiles(id) on delete cascade not null, -- User being reviewed
  reviewer_id uuid references profiles(id) on delete cascade not null, -- User writing the review
  listing_id uuid references listings(id) on delete set null, -- Optional: Which item this was for
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(target_user_id, reviewer_id, listing_id) -- Prevent spamming reviews for the same transaction
);

-- RLS
alter table reviews enable row level security;

create policy "Reviews are viewable by everyone." on reviews for select using (true);
create policy "Users can write reviews." on reviews for insert with check (auth.uid() = reviewer_id);
create policy "Users can update own reviews." on reviews for update using (auth.uid() = reviewer_id);
create policy "Users can delete own reviews." on reviews for delete using (auth.uid() = reviewer_id);

-- FUNCTION to automatically calculate Trust Score
-- We'll add a 'trust_score' column to profiles if not exists (it wasn't in MVP initially)
alter table profiles add column if not exists trust_score numeric default 5.0;

-- Trigger to recalculate trust score when a review is added
create or replace function calculate_trust_score()
returns trigger as $$
declare
  avg_rating numeric;
begin
  -- Get average rating for the target user
  select round(avg(rating)::numeric, 1) into avg_rating
  from reviews
  where target_user_id = coalesce(new.target_user_id, old.target_user_id);
  
  -- Update the profile
  update profiles
  set trust_score = coalesce(avg_rating, 5.0)
  where id = coalesce(new.target_user_id, old.target_user_id);
  
  return null;
end;
$$ language plpgsql security definer;

create trigger on_review_changed
  after insert or update or delete on reviews
  for each row execute procedure calculate_trust_score();
