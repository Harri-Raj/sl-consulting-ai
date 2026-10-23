# SL Consulting AI

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?style=flat&logo=prisma)](https://prisma.io/)
[![NextAuth](https://img.shields.io/badge/NextAuth-v5-green?style=flat)](https://next-auth.js.org/)
[![Groq](https://img.shields.io/badge/Groq-AI-orange?style=flat)](https://groq.com/)

&gt; AI-powered business diagnostic and decision intelligence platform for management consultants.

Transform fragmented business information — documents, surveys, financials, interviews — into **evidence-backed findings, risks, opportunities, and action plans** with a human consultant always in control.

**Core Principle:** AI accelerates analysis. Human expertise makes the decision.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **Business Health Dashboard** | Real-time KPIs, domain health scores, and data quality metrics |
| 👤 **Client Management** | Create, search, and manage consulting engagements per client |
| 📁 **Data Room** | Upload and analyze PDF, DOCX, CSV, TXT, XLSX files with AI text extraction |
| 🤖 **AI Business Analysis** | 8-stage diagnostic engine powered by Groq LLM |
| 🔍 **Evidence Explorer** | Every finding traceable to source documents with confidence scores |
| ⚠️ **Risk Radar** | Probability × impact matrix with human intervention flags |
| ✅ **Recommendation Engine** | Approve, reject, or modify AI suggestions with full audit trail |
| 📅 **30/60/90 Action Plans** | Structured implementation roadmaps with owners and deadlines |
| 💬 **AI Business Advisor** | Evidence-backed Q&A with source references and confidence scoring |
| 📄 **Executive Reports** | One-click board-ready report generation |
| 🔐 **Human Intervention Engine** | Explicit flags when AI defers to human judgment |

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Database:** [Prisma ORM](https://prisma.io/) + SQLite (PostgreSQL-ready for production)
- **Auth:** [NextAuth.js](https://next-auth.js.org/) (Credentials + JWT sessions)
- **AI:** [Groq API](https://groq.com/) (LLM inference with zero data retention)
- **Animation:** [Framer Motion](https://www.framer.com/motion/)
- **Validation:** [Zod](https://zod.dev/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- A [Groq API key](https://console.groq.com/keys) (optional for demo mode)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Harri-Raj/sl-consulting-ai.git
cd sl-consulting-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your GROQ_API_KEY (optional for demo)

# 4. Set up the database
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

# 5. Start the development server
npm run dev