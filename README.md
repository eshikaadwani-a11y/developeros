# DeveloperOS

> An AI Operating System for developers — autonomous coding agents, a
> retrieval-augmented knowledge base, an ML workspace, and explainability,
> unified in one full-stack platform.

DeveloperOS combines ideas from Devin, Manus, Cursor, GitHub Copilot Workspace,
and OpenHands into a single SaaS product.

## Status

🚧 Under active construction. See the design and plan:

- [Architecture](docs/ARCHITECTURE.md)
- [Implementation Roadmap](docs/ROADMAP.md)

## Tech stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Node.js, TypeScript, Next.js Route Handlers
- **Database:** MongoDB Atlas + Mongoose (Atlas Vector Search for embeddings)
- **Auth:** NextAuth with GitHub & Google OAuth
- **AI:** OpenAI + Anthropic behind a provider abstraction
- **ML:** Python (scikit-learn, XGBoost, LightGBM) + SHAP explainability
- **Deploy:** Vercel + MongoDB Atlas
- **DevOps:** Docker, GitHub Actions

## Monorepo layout

```
apps/web            Next.js app (UI + API + auth)
packages/shared     Types, zod schemas, env, utils
packages/database   Mongoose connection, models, repositories
packages/ai         LLMProvider abstraction (OpenAI, Anthropic)
packages/agents     Agent definitions + orchestration
packages/rag        Ingestion + retrieval (vector/keyword/hybrid)
services/ml         Python FastAPI ML + SHAP microservice
```

## Quick start (once dependencies are available)

```bash
pnpm install
cp .env.example .env.local   # configure OAuth, MongoDB, and AI keys
pnpm dev
```

> Note: this repo is being authored in an offline sandbox without npm registry
> access, so `pnpm install`/builds are run in your environment (local/Vercel),
> not in the construction sandbox. See `docs/ARCHITECTURE.md §10`.

## License

MIT
