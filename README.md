<p align="center">
  <img src="docs/banner.png" alt="AI Ops Banner" width="100%" />
</p>

<h1 align="center">AI Ops</h1>

<p align="center">
  <strong>Intelligent Operations Platform</strong><br/>
  AI-powered document analysis, natural-language SQL, RAG knowledge base, and executive reporting — built for enterprise ops teams.
</p>

<p align="center">
  <a href="#-features">Features</a> &nbsp;·&nbsp;
  <a href="#-architecture">Architecture</a> &nbsp;·&nbsp;
  <a href="#-tech-stack">Tech Stack</a> &nbsp;·&nbsp;
  <a href="#-local-setup">Local Setup</a> &nbsp;·&nbsp;
  <a href="#-vercel-deployment">Deployment</a> &nbsp;·&nbsp;
  <a href="#-environment-variables">Env Vars</a>
</p>

---

## Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Real-time KPIs, upload flow, activity feed — the command center for your ops workspace. |
| **Knowledge Base** | Upload PDFs/DOCXs, auto-chunk and embed into FAISS, then ask questions powered by RAG + Ollama phi3:mini. |
| **SQL Analyst** | Natural-language → SQL translation with inline results, sortable tables, and Recharts visualizations. |
| **AI Reports** | Prompt-driven executive, vendor, AP, and risk reports with AI-generated summaries, KPI cards, charts, tables, and one-click PDF export. |
| **Settings** | Theme, language, and notification preferences — persist locally via localStorage. |

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                   Next.js Frontend                   │
│   React 19 · Tailwind v4 · shadcn · Recharts · framer-motion   │
│                    Port 3000                         │
└──────────────────┬───────────────────────────────────┘
                   │ REST (fetch)
┌──────────────────▼───────────────────────────────────┐
│                  FastAPI Backend                     │
│   Python 3.9+ · SQLite · FAISS · Ollama phi3:mini   │
│                    Port 8000                         │
└──────────────────────────────────────────────────────┘
```

- **Frontend** calls the backend via `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`).
- **Backend** stores documents/chunks in SQLite, vectors in FAISS indexes, and delegates LLM work to Ollama.
- **Ollama** (optional) provides local inference for RAG answers and AI report summaries. Without it, rule-based fallbacks keep the app functional.

---

## Tech Stack

### Frontend
- **Next.js 15** (App Router, React Server Components)
- **React 19** + TypeScript
- **Tailwind CSS v4** + shadcn/ui
- **Recharts** for data visualization
- **Framer Motion** for page transitions
- **@react-pdf/renderer** for PDF export
- **Sonner** for toast notifications
- **next-themes** for dark/light mode

### Backend
- **FastAPI** + Uvicorn
- **SQLite** (zero-config, file-based)
- **FAISS** vector similarity search
- **sentence-transformers** (`all-MiniLM-L6-v2`) for embeddings
- **PyMuPDF** + **python-docx** for document parsing
- **Ollama** with `phi3:mini` for local AI inference

---

## Screenshots

| Dashboard | SQL Analyst | AI Reports |
|-----------|-------------|------------|
| ![Dashboard](docs/screenshot-dashboard.png) | ![SQL Analyst](docs/screenshot-sql.png) | ![AI Reports](docs/screenshot-reports.png) |

| Knowledge Base | Report PDF | Dark Mode |
|----------------|------------|-----------|
| ![Knowledge Base](docs/screenshot-knowledge.png) | ![Report PDF](docs/screenshot-pdf.png) | ![Dark Mode](docs/screenshot-dark.png) |

---

## Local Setup

### Prerequisites
- **Node.js 18+** and **npm 9+**
- **Python 3.9+** and **pip**
- **Ollama** (optional, for AI features)

### 1. Clone & Install

```bash
git clone https://github.com/ishaan-bits/aiops.git
cd aiops

# Frontend
npm install

# Backend
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 2. Configure Environment

```bash
cp .env.example .env          # Frontend vars
cp .env.example backend/.env  # Backend vars (edit as needed)
```

### 3. Start Services

```bash
# Terminal 1 — Backend
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Ollama Setup (Optional)

Ollama powers the AI features (RAG answers, report summaries, intent classification). Without it the app still works — rule-based fallbacks activate automatically.

```bash
# Install Ollama (macOS)
brew install ollama

# Pull the model
ollama pull phi3:mini

# Start the server (if not running as a service)
ollama serve
```

The backend connects to `http://localhost:11434` by default. Override with `OLLAMA_URL` in your environment.

---

## Vercel Deployment

### Frontend (Next.js)

1. Push to GitHub and import the repo on [vercel.com/new](https://vercel.com/new).
2. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
   ```
3. Deploy — Vercel auto-detects Next.js.

### Backend (FastAPI)

Deploy the `backend/` directory to a Python-compatible host (Railway, Render, Fly.io, or a separate Vercel project with the Python runtime).

Set these environment variables on the backend:
```
CORS_ORIGINS=["https://your-frontend.vercel.app"]
OLLAMA_URL=https://your-ollama-host.com   # if using a remote Ollama instance
```

### Monorepo Vercel Config

The included `vercel.json` rewrites API routes to the deployed backend:

```json
{
  "rewrites": [
    { "source": "/health",        "destination": "https://your-backend-url/health" },
    { "source": "/upload",        "destination": "https://your-backend-url/upload" },
    { "source": "/sql/:path*",    "destination": "https://your-backend-url/sql/:path*" },
    { "source": "/rag/:path*",    "destination": "https://your-backend-url/rag/:path*" },
    { "source": "/reports/:path*","destination": "https://your-backend-url/reports/:path*" }
  ]
}
```

Update the destination URLs to match your actual backend deployment.

---

## Environment Variables

### Frontend (Next.js)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API base URL |

### Backend (FastAPI)

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_URL` | `http://localhost:11434` | Ollama server endpoint |
| `CORS_ORIGINS` | `["http://localhost:3000"]` | Allowed CORS origins (JSON array) |
| `BACKEND_PORT` | `8000` | Uvicorn listen port |

---

## Folder Structure

```
ai-ops/
├── src/
│   ├── app/
│   │   ├── dashboard/page.tsx      # Dashboard with KPIs & activity
│   │   ├── knowledge/page.tsx      # Document upload & RAG queries
│   │   ├── reports/page.tsx        # AI-driven report generation
│   │   ├── settings/page.tsx       # App preferences
│   │   ├── sql-analyst/page.tsx    # Natural-language SQL
│   │   ├── layout.tsx              # Root layout (Geist font, theme)
│   │   └── globals.css             # Tailwind v4 theme config
│   ├── components/
│   │   ├── layout/                 # App shell, sidebar, top nav
│   │   ├── reports/                # Charts, tables, PDF export
│   │   ├── sql/                    # SQL input, results, charts
│   │   ├── knowledge/              # Ask-ai component
│   │   └── ui/                     # shadcn primitives
│   └── services/
│       ├── api.ts                  # Upload API
│       ├── rag.ts                  # RAG API
│       ├── reports.ts              # Reports API
│       └── sql.ts                  # SQL API
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app + CORS
│   │   ├── routes/                 # upload, sql, rag, reports
│   │   ├── schemas/                # Pydantic models
│   │   └── services/               # Business logic
│   │       ├── llm.py              # Ollama chat wrapper
│   │       ├── rag.py              # FAISS + embeddings + RAG
│   │       ├── report_generator.py # KPI/chart/table builders + AI summaries
│   │       └── sql.py              # SQLite query executor
│   ├── requirements.txt
│   └── .env
├── .env.example
├── vercel.json
├── package.json
├── next.config.ts
└── README.md
```

---

## License

MIT
