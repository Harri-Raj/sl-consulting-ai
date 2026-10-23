# SL Consulting AI

AI-powered business diagnostic and decision intelligence platform for management consultants.

## Features

- Client management with business health scoring
- Document upload and AI text extraction (PDF, DOCX, CSV, TXT, XLSX)
- AI Business Analysis with 8-stage progress tracking
- Evidence-backed findings with root cause exploration
- Risk Radar with probability/impact matrix
- Human Intervention Engine
- Recommendations with approve/reject/modify workflow
- 30/60/90 Day Action Plans
- AI Business Advisor with source references
- Executive Report Generator

## Tech Stack

- Next.js 15 + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma ORM + SQLite
- NextAuth.js (Credentials)
- Groq API (LLM)

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/sl-consulting-ai.git
cd sl-consulting-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your GROQ_API_KEY

# 4. Set up database
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

# 5. Run the dev server
npm run dev