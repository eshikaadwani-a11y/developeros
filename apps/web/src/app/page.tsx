import Link from "next/link";
import {
  Bot,
  BookOpen,
  BrainCircuit,
  GitPullRequestArrow,
  LineChart,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn, Stagger, FadeInItem } from "@/components/ui/motion";

const features = [
  {
    icon: Bot,
    title: "Autonomous agents",
    body: "Architect, Coder, Reviewer, Debugger, Research, and Documentation agents collaborate to ship work.",
  },
  {
    icon: BookOpen,
    title: "RAG knowledge base",
    body: "Upload docs and code, then retrieve with semantic, keyword, and hybrid search — with citations.",
  },
  {
    icon: BrainCircuit,
    title: "ML workspace",
    body: "Regression, classification, clustering, forecasting, and anomaly detection in one place.",
  },
  {
    icon: GitPullRequestArrow,
    title: "Orchestrated pipeline",
    body: "A shared orchestration layer passes context between agents from plan to final output.",
  },
  {
    icon: LineChart,
    title: "Explainability",
    body: "SHAP values, feature importance, and per-prediction explanations on a model insights dashboard.",
  },
  {
    icon: Sparkles,
    title: "Multi-provider AI",
    body: "Switch between OpenAI and Anthropic models dynamically behind a single provider abstraction.",
  },
];

const pipeline = ["Architect", "Coder", "Reviewer", "Debugger", "Output"];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Ambient gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-10rem] -z-10 mx-auto h-[40rem] w-[60rem] rounded-full bg-primary/20 blur-[120px]"
      />

      {/* Nav */}
      <header className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-bold tracking-tight">DeveloperOS</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container flex flex-col items-center py-24 text-center">
        <FadeIn>
          <Badge variant="outline" className="mb-6 px-4 py-1.5">
            AI Operating System for developers
          </Badge>
        </FadeIn>
        <FadeIn delay={0.08}>
          <h1 className="max-w-4xl bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-7xl">
            Build, review, and ship with a team of AI agents.
          </h1>
        </FadeIn>
        <FadeIn delay={0.16}>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            DeveloperOS unifies autonomous coding agents, a retrieval-augmented
            knowledge base, an ML workspace, and explainability into one platform.
          </p>
        </FadeIn>
        <FadeIn delay={0.24}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg">Start free</Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                View dashboard
              </Button>
            </Link>
          </div>
        </FadeIn>

        {/* Pipeline visual */}
        <FadeIn delay={0.32}>
          <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
            {pipeline.map((stage, i) => (
              <div key={stage} className="flex items-center gap-3">
                <span className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium">
                  {stage}
                </span>
                {i < pipeline.length - 1 ? (
                  <span className="text-primary">→</span>
                ) : null}
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* Features */}
      <section className="container pb-24">
        <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <FadeInItem key={f.title}>
                <div className="h-full rounded-2xl border border-border bg-card/50 p-6 transition-colors hover:border-primary/50">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
                </div>
              </FadeInItem>
            );
          })}
        </Stagger>
      </section>

      {/* CTA */}
      <section className="container pb-32">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-12 text-center">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 to-transparent"
            />
            <h2 className="text-3xl font-bold tracking-tight">
              Your AI development team, ready when you are.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Sign in with GitHub or Google and spin up your first agent run in seconds.
            </p>
            <Link href="/signup" className="mt-8 inline-block">
              <Button size="lg">Get started</Button>
            </Link>
          </div>
        </FadeIn>
      </section>

      <footer className="container border-t border-border py-8 text-center text-sm text-muted-foreground">
        DeveloperOS — AI Operating System for developers.
      </footer>
    </div>
  );
}
