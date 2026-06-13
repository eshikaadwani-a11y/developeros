import Link from "next/link";

/**
 * Placeholder landing page. The full animated marketing landing page is built
 * in Milestone 3 (Dashboard UI). This establishes the route and styling base.
 */
export default function HomePage() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center gap-8 text-center">
      <span className="rounded-full border border-border bg-secondary px-4 py-1 text-sm text-muted-foreground">
        AI Operating System for developers
      </span>
      <h1 className="max-w-3xl bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
        DeveloperOS
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        Autonomous coding agents, a retrieval-augmented knowledge base, an ML
        workspace, and explainability — unified in one platform.
      </p>
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90"
        >
          Open Dashboard
        </Link>
        <Link
          href="/agents"
          className="rounded-lg border border-border px-6 py-3 font-medium transition hover:bg-secondary"
        >
          Explore Agents
        </Link>
      </div>
    </main>
  );
}
