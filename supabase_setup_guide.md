# Supabase Authentication & Setup Guide

To connect **UniMart** to a live backend, you need to configure a Supabase project and connect it to your local environment. Follow these exact steps:

### Step 1: Create a Supabase Project
1. Go to [database.new](https://database.new/) or [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project.
2. Give your project a name (e.g., `UniMart Backend`) and create a secure database password. Wait a couple of minutes for the database to finish provisioning.

### Step 2: Get Your API Keys
1. In your Supabase Dashboard, go to **Project Settings** (the gear icon at the bottom left).
2. Click on **API** in the sidebar.
3. You will see your **Project URL** and your **anon / public key**.
4. In your VS Code project, rename the file `.env.example` to `.env`.
5. Paste your URL and Anon Key into the `.env` file:
   ```env
   VITE_SUPABASE_URL=your-project-url-here
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_COLLEGE_EMAIL_DOMAIN=yourcollege.edu # (Optional: restricts logins to this domain)
   ```

### Step 3: Set Up the Database Schema
To make the application work, we need to create the database tables (Profiles, Listings, Chats, etc.).
1. Go to the **SQL Editor** in your Supabase Dashboard (the `<>` icon in the left sidebar).
2. Click **New Query**.
3. Open the `supabase_schema.sql` file in your VS Code (it's in the root folder). Select all the code (`Ctrl+A`), copy it, and paste it into the Supabase SQL Editor.
4. Click **Run** (or `Cmd/Ctrl + Enter`).
5. Next, open `supabase_schema_chats.sql`, copy its contents, paste it into a new query, and hit **Run**.

### Step 4: Configure Authentication
UniMart uses Supabase Auth. By default, email/password is enabled, but let's make sure it works smoothly with Magic Links:
1. In your Supabase Dashboard, go to **Authentication** (the lock icon).
2. Click on **Providers** under the Configuration section.
3. Select **Email**.
4. Ensure **Enable Email provider** is turned on.
5. Make sure **Confirm email** is enabled (this enables magic links / OTPs). 
6. *(Optional for local dev)* You can disable "Confirm email" temporarily if you just want to test without receiving actual emails, but this breaks the "Magic Link" flow. We recommend keeping it on and testing with your real email.

### Step 5: Test the Application!
1. Go back to your running local application (`http://localhost:5173`).
2. You should now be redirected to the Login page automatically (if you aren't already).
3. Enter your email and click "Send Magic Link".
4. Check your email inbox, click the link, and you will be fully authenticated and redirected to the Home feed!

> **Note on Email Limits:** Supabase's free tier has a limit of a few emails per hour. If you exceed this while testing, you can go to **Authentication > Users** in Supabase and manually create a user and set a password, or just wait a bit.
