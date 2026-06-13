# DeveloperOS — Implementation Roadmap

Each milestone is committed and pushed to `feat/developeros-platform`. After
every push we report commit hash, branch, files changed, and the GitHub URL.

Legend: ✅ done · 🚧 in progress · ⬜ planned

| # | Milestone | Scope | Status |
| - | --------- | ----- | ------ |
| 0 | Architecture & roadmap | This document + `ARCHITECTURE.md` | 🚧 |
| 1 | Monorepo + Next.js setup | pnpm/Turborepo workspace, `apps/web` Next.js 15 skeleton, `packages/shared`, tooling, env | ⬜ |
| 2 | Auth + MongoDB | NextAuth (GitHub/Google), Mongoose connection, all 8 collection models + indexes | ⬜ |
| 3 | Dashboard UI | Landing + Dashboard/Agents/Projects/Knowledge/Tasks/Analytics/Settings, shadcn/ui, Framer Motion, dark mode | ⬜ |
| 4 | AI provider layer | `LLMProvider`, OpenAI + Anthropic providers, registry, dynamic model switching, token/cost accounting | ⬜ |
| 5 | Agent orchestration | 6 agents + `Orchestrator` + shared `AgentContext`, pipeline wiring, API route | ⬜ |
| 6 | RAG system | Upload, parse, chunk, embed, vector store, retrieval, context injection | ⬜ |
| 7 | Knowledge base | Semantic + keyword + hybrid search, source citations, KB UI | ⬜ |
| 8 | ML workspace | Python FastAPI service: regression/classification/clustering/forecasting/anomaly | ⬜ |
| 9 | Explainability | SHAP values, feature importance, prediction explanations, insights dashboard | ⬜ |
| 10 | Analytics + deploy | Analytics dashboard, Dockerfile, docker-compose, GitHub Actions CI/CD, Vercel config | ⬜ |

## Definition of done (per milestone)

- Code authored and type-consistent with `packages/shared` contracts.
- New/changed files committed with a conventional commit message.
- Pushed to `feat/developeros-platform`.
- Verification steps documented (commands to run where deps are available).
- Milestone status updated in this file.

## How to run (once dependencies are available)

```bash
pnpm install
cp .env.example .env.local        # fill in OAuth + DB + AI keys
pnpm dev                          # run apps/web
pnpm build                        # build all packages + web
pnpm test                         # run unit/integration/API tests
docker compose up                 # full local stack (web + ml + mongo)
```

## Testing strategy (target 80%+ coverage)

- **Unit**: pure logic in `shared`, `ai` (provider registry, cost calc),
  `agents` (context handling), `rag` (chunking, RRF fusion).
- **Integration**: database repositories against an in-memory/ephemeral Mongo;
  RAG ingestion → retrieval round-trip.
- **API**: Next.js route handlers (auth guards, agent run, KB search) via
  request-level tests.

## Risks & mitigations

- **No registry access in the build sandbox** → code is authored to standard
  package APIs; verification deferred to a connected environment. Documented in
  `ARCHITECTURE.md §10`.
- **Vector search availability** → abstract behind a `VectorStore` interface so
  Atlas Vector Search or Qdrant can back it without changing callers.
- **Cost/runaway AI usage** → per-request token ceilings + analytics tracking.
