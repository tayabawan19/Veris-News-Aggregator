# 📰 VERIS — AI-Powered Regional Newsroom

> **"Your City. This Week. No Noise."**

**VERIS** is a real-time, editorial regional news aggregator and intelligence platform. It allows users to filter verified news dispatches by country and specific city keywords, cache stories efficiently to optimize API consumption, and generate on-demand AI summaries and instant multi-language translations powered by **Google Gemini 2.5 Flash**.

---

## ✨ Features

- **🌍 Live Regional & City Refinement**: Filter breaking news across countries (*Pakistan, India, United States, United Kingdom, United Arab Emirates*) and refine down to specific metropolitan cities (*Lahore, Karachi, New York, London, Dubai*).
- **⚡ Smart 45-Minute Multi-Tier Caching**: Dual-layered caching strategy (**Supabase Postgres** + **45-min In-Memory Cache**) to minimize external API consumption and provide fallback resilience against rate limits.
- **🤖 On-Demand AI Summarization**: Integrated with **Google Gemini 2.5 Flash** (`@google/genai`) to generate concise 2-3 sentence executive summaries in inline expandable card sections.
- **🌐 Instant Multi-Language Translation**: Translates headlines and descriptions on the fly into **Urdu**, **English**, **Spanish**, **French**, **Arabic**, **Hindi**, and **Chinese** while preserving context and tone.
- **🗞️ Modern Newsroom Bento UI**: Custom editorial interface built with Next.js 16, Tailwind CSS, Framer Motion, and GSAP animations featuring an auto-scrolling Bloomberg-style wire ticker terminal and interactive marquee strip.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, Framer Motion, GSAP (`@gsap/react`), Lucide Icons
- **Backend**: Node.js, Express, Axios
- **AI Model**: Google Gemini API (`gemini-2.5-flash`)
- **Database & Cache**: Supabase Postgres + In-Memory Caching
- **External API**: NewsData.io REST API

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Environment Configuration
Create a `.env` file in the root directory:

```env
PORT=5000
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
NEWSDATA_API_KEY=your_newsdata_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Database Setup (Supabase)
Run the SQL queries in `schema.sql` in your Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS cached_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_api_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    source_name TEXT,
    url TEXT,
    image_url TEXT,
    country TEXT NOT NULL,
    city_keyword TEXT,
    category TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cached_articles_lookup 
ON cached_articles (country, city_keyword, category, cached_at);
```

### 4. Running Locally

**Start the Express Backend (Port 5000):**
```bash
npm install
npm start
```

**Start the Next.js Frontend (Port 3000):**
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License
MIT License © 2026 VERIS
