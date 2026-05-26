# Wedding Planner AI 💍

An AI-powered wedding planning application that generates personalized vendor budget recommendations, tracks expenses, and answers follow-up questions — all tailored to the couple's city, guest count, venue type, and priorities.

Built with **Next.js 16**, **Supabase**, **Google Gemini 1.5 Pro**, and **Tailwind CSS + shadcn/ui**.

---

## Features

| Feature | Description |
|---|---|
| **Multi-step Intake Form** | 4-step guided form collecting wedding details, venue, budget bracket, and top priorities |
| **AI Recommendations** | Gemini 1.5 Pro generates 8–10 vendor budget allocations tailored to city, guest count, and priorities |
| **Budget Tracker** | Log payments per vendor, see allocated vs. spent vs. remaining with a color-coded category breakdown |
| **Follow-up Chat** | Streaming AI chat with full conversation history — persisted to DB and restored on revisit |

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini 1.5 Pro via `@google/generative-ai`
- **UI**: Tailwind CSS v4 + shadcn/ui
- **Fonts**: Playfair Display (headings) + DM Sans (body)

---

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- A [Google AI Studio](https://aistudio.google.com) API key with Gemini 1.5 Pro access

---

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd wedding-planner
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
GEMINI_API_KEY=your-gemini-api-key-here
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → `anon public` key |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com) → Get API Key |

### 4. Run the database migrations

Go to your Supabase project → **SQL Editor** and run the contents of [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql).

This creates four tables: `wedding_intakes`, `ai_recommendations`, `payments`, and `chat_messages`.

```sql
-- Quick copy-paste version
CREATE TABLE wedding_intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_date DATE NOT NULL,
  guest_count INTEGER NOT NULL,
  city TEXT NOT NULL,
  venue_type TEXT NOT NULL CHECK (venue_type IN ('banquet_hall','farmhouse','destination','garden','hotel','other')),
  budget_bracket TEXT NOT NULL,
  priority_one TEXT NOT NULL,
  priority_two TEXT NOT NULL,
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES wedding_intakes(id) ON DELETE CASCADE,
  vendor_category TEXT NOT NULL,
  priority_rank INTEGER NOT NULL,
  suggested_budget_inr INTEGER NOT NULL,
  rationale TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES wedding_intakes(id) ON DELETE CASCADE,
  vendor_category TEXT NOT NULL,
  vendor_name TEXT NOT NULL,
  amount_paid INTEGER NOT NULL,
  payment_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES wedding_intakes(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'model')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recommendations_intake_id ON ai_recommendations(intake_id);
CREATE INDEX idx_payments_intake_id ON payments(intake_id);
CREATE INDEX idx_chat_messages_intake_id ON chat_messages(intake_id);
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects automatically to `/intake`.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                           # Redirects to /intake
│   ├── intake/page.tsx                    # Multi-step intake form
│   ├── recommendations/[id]/page.tsx      # AI results + chat panel
│   ├── budget/[id]/page.tsx               # Budget tracker
│   └── api/
│       ├── recommend/route.ts             # POST — calls Gemini, saves to DB
│       ├── recommendations/[id]/route.ts  # GET — loads saved plan (no Gemini re-call)
│       ├── payments/route.ts              # POST — log a payment
│       ├── payments/[intakeId]/route.ts   # GET — fetch payments
│       ├── chat/route.ts                  # POST — streaming chat + saves messages to DB
│       └── chat/[intakeId]/route.ts       # GET — fetch chat history
├── components/
│   ├── intake/         # StepIndicator, Step1–4 forms, IntakeForm orchestrator
│   ├── recommendations/ # RecommendationCard, RecommendationList, ChatPanel, StreamingText
│   └── budget/         # BudgetSummary, PaymentForm, PaymentLog
└── lib/
    ├── types.ts         # All shared TypeScript interfaces
    ├── constants.ts     # VENUE_TYPES, BUDGET_BRACKETS, PRIORITIES
    ├── utils.ts         # formatCurrency, parseBudgetBracket, formatDate, isFutureDate
    ├── gemini.ts        # Gemini client initialization
    └── supabase/
        ├── client.ts    # Browser Supabase client
        └── server.ts    # Server Supabase client (used in API routes)
```

---

## Design Decisions

### Gemini is called exactly once per wedding plan
Once recommendations are generated and saved to `ai_recommendations`, all subsequent page loads read from Supabase only. `GET /api/recommendations/[id]` never re-calls Gemini. This keeps API costs minimal and ensures the couple sees consistent results on every revisit.

### `responseMimeType: "application/json"` for structured output
Gemini 1.5 Pro occasionally wraps responses in markdown fences or adds prose preamble when asked for JSON. Using `generationConfig: { responseMimeType: "application/json" }` forces the model to output valid JSON directly. A secondary `indexOf("{")` / `lastIndexOf("}")` extraction acts as a fallback for any edge cases.

### Budget bracket → midpoint for calculations
The form collects a budget *bracket* (e.g. `₹10L–₹25L`) rather than an exact number — couples rarely know their exact budget upfront. `parseBudgetBracket()` in `lib/utils.ts` converts the bracket to a numeric midpoint (₹17,50,000) used for budget summary math. The AI prompt also uses this midpoint to anchor its allocation.

### All data flows through API routes — no direct Supabase calls from the frontend
Every read and write goes through a typed Next.js API route. The client never imports or calls the Supabase client directly. This centralizes validation, keeps the client bundle lean, and makes it straightforward to add authentication (Supabase RLS) in front of any route later.

### Chat history persisted and restored per intake
Each message (user and model) is saved to `chat_messages` with its `intake_id`. When `/recommendations/[id]` loads, the chat panel fetches the full history and rebuilds both the display state and the Gemini conversation context — giving the AI memory of prior turns across browser sessions.

### Server components by default
Pages are React Server Components unless they require hooks or event listeners. The `"use client"` directive is used only where necessary (form steps, chat panel, budget page). This minimises client-side JS and keeps initial page loads fast.

---

## Available Scripts

```bash
npm run dev        # Start development server (http://localhost:3000)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npx tsc --noEmit   # Type check without building
```

---

## Known Limitations & Future Work

- **No authentication** — anyone with a UUID link can view a plan. Adding Supabase Auth + Row Level Security is the natural next step.
- **Payments are append-only** — no editing or deletion UI yet.
- **Model is hardcoded** — swap `gemini-1.5-pro` for `gemini-1.5-flash` in `src/lib/gemini.ts` for faster, cheaper responses.
- **No vendor search** — recommendations are budget allocations only; connecting to a real vendor directory would be a valuable addition.
