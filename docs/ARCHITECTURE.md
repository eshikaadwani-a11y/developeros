# DeveloperOS — Architecture

DeveloperOS is an **AI Operating System for developers**: a full-stack platform
that combines autonomous coding agents, retrieval-augmented knowledge, an ML
workspace, and explainability into a single SaaS product. It draws inspiration
from Devin, Manus, Cursor, GitHub Copilot Workspace, and OpenHands.

This document is the source of truth for the system design. It is intentionally
written before implementation so that every milestone has a clear target.

---

## 1. High-level overview

```
                          ┌─────────────────────────────────────────┐
                          │                Browser                   │
                          │   Next.js 15 (App Router) + shadcn/ui     │
                          │   Tailwind + Framer Motion, dark mode     │
                          └───────────────┬──────────────────────────┘
                                          │  HTTPS (RSC + Route Handlers)
                          ┌───────────────▼──────────────────────────┐
                          │            apps/web (Next.js)             │
                          │  - Pages (landing, dashboard, agents…)    │
                          │  - Route Handlers (/api/*)                │
                          │  - NextAuth (GitHub + Google OAuth)       │
                          │  - Server Actions                         │
                          └───┬───────────┬───────────┬───────────┬───┘
                              │           │           │           │
          ┌───────────────────▼─┐  ┌──────▼──────┐ ┌──▼────────┐ ┌▼─────────────┐
          │   packages/agents    │  │ packages/ai │ │ packages/ │ │ packages/rag │
          │  orchestration layer │  │  LLM layer  │ │ database  │ │  ingest +    │
          │  Architect→Coder→... │  │ OpenAI /    │ │ Mongoose  │ │  retrieval   │
          └──────────┬───────────┘  │ Anthropic   │ │ models    │ └──────┬───────┘
                     │              └──────┬──────┘ └─────┬─────┘        │
                     └─────────────────────┴──────────────┴──────────────┘
                                          │
                          ┌───────────────▼──────────────────────────┐
                          │  MongoDB Atlas (data + Atlas Vector Search)│
                          │  Collections: Users, Projects, Tasks,      │
                          │  Documents, Knowledge, Agents,             │
                          │  Conversations, Analytics                  │
                          └────────────────────────────────────────────┘

   External services: OpenAI API, Anthropic API, GitHub/Google OAuth, Vercel
   Optional ML microservice (Python): scikit-learn / XGBoost / LightGBM + SHAP
```

---

## 2. Monorepo layout

We use a **pnpm + Turborepo** monorepo. TypeScript everywhere on the JS side;
an isolated Python service for the ML/explainability workloads.

```
developeros/
├── apps/
│   └── web/                 # Next.js 15 app (UI + API routes + NextAuth)
├── packages/
│   ├── shared/              # Cross-cutting types, zod schemas, utils, env
│   ├── database/            # Mongoose connection, models, indexes, repositories
│   ├── ai/                  # LLMProvider abstraction (OpenAI, Anthropic), embeddings
│   ├── agents/              # Agent definitions + orchestration engine
│   └── rag/                 # Ingestion (parse/chunk/embed) + retrieval (vector/keyword/hybrid)
├── services/
│   └── ml/                  # Python FastAPI microservice (sklearn/XGBoost/LightGBM + SHAP)
├── docs/                    # Architecture, roadmap, ADRs
├── .github/workflows/       # CI/CD (build, test, lint, deploy)
├── docker-compose.yml
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### Why a monorepo
- Shared TypeScript types between frontend and backend remove drift.
- Agents/AI/RAG packages are independently testable and reusable.
- Turborepo gives cached, parallel builds and a single CI pipeline.

---

## 3. Package responsibilities

### packages/shared
- Domain types (`User`, `Project`, `Task`, `Agent`, `Conversation`, …).
- `zod` schemas for runtime validation at API boundaries.
- Environment loading/validation (`env.ts`) so misconfiguration fails fast.
- Generic utilities (ids, result types, logging interface).

### packages/database
- Single pooled Mongoose connection (cached across serverless invocations).
- Mongoose models with schemas, indexes, and TTLs.
- Thin repository functions per collection (no business logic in models).
- Atlas Vector Search index definitions for `knowledge` embeddings.

### packages/ai
- `LLMProvider` interface: `chat()`, `stream()`, `embed()`.
- `OpenAIProvider`, `AnthropicProvider` implementations.
- A `ProviderRegistry` enabling **dynamic model switching** by id
  (e.g. `openai:gpt-4o`, `anthropic:claude-3-5-sonnet`).
- Token accounting + cost estimation hooks (feed Analytics).

### packages/agents
- Six agents, each a class implementing a common `Agent` contract:
  `Architect`, `Coder`, `Reviewer`, `Debugger`, `Research`, `Documentation`.
- `Orchestrator` runs the pipeline and passes a shared `AgentContext`
  (scratchpad, artifacts, message log) between stages.
- Pluggable: agents depend only on the `LLMProvider` interface.

### packages/rag
- **Ingestion**: parse PDF/DOCX/TXT/Markdown/code → normalize → chunk
  (token-aware, overlapping windows) → embed → persist.
- **Retrieval**: vector (Atlas Vector Search), keyword (text index), and
  **hybrid** (reciprocal-rank fusion). Returns chunks with source citations.
- **Context injection**: builds a budgeted prompt context from retrieved chunks.

### services/ml (Python)
- FastAPI microservice exposing train/predict/explain endpoints.
- Tasks: regression, classification, clustering, forecasting, anomaly detection.
- Explainability: SHAP values, feature importance, per-prediction explanations.
- Called from the web app over HTTP; deployable separately (or via Docker).

---

## 4. Data model (MongoDB)

| Collection      | Purpose                                  | Key indexes |
| --------------- | ---------------------------------------- | ----------- |
| `users`         | Accounts, OAuth identities, settings     | `email` (unique), `accounts.provider+providerAccountId` |
| `projects`      | Workspaces owned by a user               | `ownerId`, `ownerId+updatedAt` |
| `tasks`         | Agent/user tasks within a project        | `projectId+status`, `assignedAgent` |
| `documents`     | Uploaded raw files (metadata + storage)  | `projectId`, `ownerId` |
| `knowledge`     | Chunk + embedding + citation metadata    | Atlas Vector index on `embedding`; `documentId` |
| `agents`        | Agent configs/state per project          | `projectId`, `type` |
| `conversations` | Message history per session/agent run    | `projectId+createdAt`, `userId` |
| `analytics`     | Usage/token/cost events (time-series)    | `type+createdAt`, TTL on raw events |

Schemas live in `packages/database/src/models`. Each has timestamps and a
`zod` validator mirror in `packages/shared` for API validation.

---

## 5. AI & Agent flow

```
User Request
   │
   ▼
Architect  ──▶ produces a plan + file/task breakdown
   │
   ▼
Coder      ──▶ generates/edits code from the plan
   │
   ▼
Reviewer   ──▶ critiques diff, flags issues, requests changes
   │
   ▼
Debugger   ──▶ resolves failing checks / review findings
   │
   ▼
Final Output (artifacts + summary persisted to Conversations)
```

- `Research` and `Documentation` agents are invoked on demand by the
  orchestrator (e.g. Research before Architect; Documentation after Debugger).
- All inter-agent communication flows through `AgentContext` so each stage sees
  prior artifacts and messages — no hidden global state.
- RAG is injected into agent prompts: relevant knowledge chunks + citations.

---

## 6. Authentication & sessions

- **NextAuth** with GitHub and Google OAuth providers.
- MongoDB adapter persists users/accounts/sessions.
- JWT session strategy for serverless friendliness; session carries `userId`
  and role. Route Handlers and Server Actions guard via `auth()`.

---

## 7. Security & configuration

- All secrets via environment variables, validated by `packages/shared/env`.
- No secrets committed; `.env.example` documents required keys.
- API boundaries validate input with `zod`; rate-limit AI endpoints.
- Per-request cost ceilings; analytics records token usage for budgeting.

---

## 8. Observability & analytics

- Structured logging interface in `shared` (pluggable sink).
- `analytics` collection records: agent usage, token usage, cost, queries,
  model performance, active projects — surfaced on the Analytics dashboard.

---

## 9. Deployment topology

- **apps/web** → Vercel (Edge/Node runtimes as appropriate).
- **MongoDB Atlas** → managed cluster + Vector Search.
- **services/ml** → container (Vercel is JS-only) on any container host, or run
  locally via `docker compose`.
- CI/CD via GitHub Actions: build → lint → test → deploy on every push.

---

## 10. Environment constraints during construction

This repository is being authored in a sandboxed environment **without npm
registry access**, so dependencies cannot be installed and full builds/tests
cannot be executed here. All code is written to be installable and runnable in a
normal environment (local or Vercel). Each milestone documents how to verify it
once dependencies are available (`pnpm install`, `pnpm build`, `pnpm test`).
