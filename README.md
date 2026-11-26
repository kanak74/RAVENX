# VITALORA (`RAVENX`)

A guided health-information companion built with React, TypeScript, Tailwind CSS, Vite, Vercel Serverless Functions, and a Python ML symptom-pattern endpoint.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, jsPDF
- **Backend / API:** Vercel Functions (`api/auth.ts`, `api/chat.ts`, `api/history.ts`, `api/predict.py`)
- **Database / Storage:** Neon Postgres (`@neondatabase/serverless`) and Vercel Blob (`@vercel/blob`)
- **AI Guidance:** Google Gemini (`@google/genai`)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in your values (never commit `.env` or `.env.local`).
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## Environment Variables

See `.env.example` for the required and optional server-side environment variables (`GEMINI_API_KEY`, `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `AUTH_SECRET`).

## Deployment

Configured for Vercel via `vercel.json`:
- **Framework:** `vite`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Production Branch:** `main`
