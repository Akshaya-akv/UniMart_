# UniMart Studio 🎓⚡

> **The Precision Campus Exchange.** Trade textbooks, scientific hardware, lab kits, and verified lecture notes directly with campus peers. Zero markups. Verified university accounts only.

Built with a dark titanium aesthetic inspired by Apple & Vercel design systems.

---

## ⚡ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Dark Luxury Design System (OLED black, titanium sheens, ambient lighting animations)
- **Backend & Auth**: Supabase (PostgreSQL, Realtime Subscriptions, Row Level Security, Storage)
- **Icons**: Lucide React
- **PWA**: `vite-plugin-pwa` for mobile app experience & offline caching

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Akshaya-akv/UniMart_.git
cd UniMart_
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_COLLEGE_EMAIL_DOMAIN=ch.students.amrita.edu
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

---

## 🌐 Deploying to Vercel

1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import the `UniMart_` repository.
4. Select **Vite** as the Framework Preset (auto-detected).
5. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_COLLEGE_EMAIL_DOMAIN`
6. Click **Deploy**. Vercel will build and host the application with custom domain and automatic HTTPS!
