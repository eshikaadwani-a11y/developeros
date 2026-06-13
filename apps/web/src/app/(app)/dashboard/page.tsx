import { Bot, FolderGit2, ListChecks, Coins } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn, Stagger, FadeInItem } from "@/components/ui/motion";

const stats = [
  { label: "Active Projects", value: "8", icon: FolderGit2 },
  { label: "Agent Runs (7d)", value: "142", icon: Bot },
  { label: "Open Tasks", value: "23", icon: ListChecks },
  { label: "Token Spend (7d)", value: "$18.40", icon: Coins },
];

const pipeline = [
  { agent: "Architect", status: "done" as const },
  { agent: "Coder", status: "done" as const },
  { agent: "Reviewer", status: "running" as const },
  { agent: "Debugger", status: "queued" as const },
];

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your AI development command center at a glance."
      />

      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <FadeInItem key={s.label}>
              <Card>
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="mt-1 text-2xl font-bold">{s.value}</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                </CardContent>
              </Card>
            </FadeInItem>
          );
        })}
      </Stagger>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <FadeIn className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Active agent pipeline</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              {pipeline.map((stage, i) => (
                <div key={stage.agent} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                    <span className="text-sm font-medium">{stage.agent}</span>
                    <Badge
                      variant={
                        stage.status === "done"
                          ? "success"
                          : stage.status === "running"
                            ? "warning"
                            : "secondary"
                      }
                    >
                      {stage.status}
                    </Badge>
                  </div>
                  {i < pipeline.length - 1 ? (
                    <span className="text-muted-foreground">→</span>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                "Coder agent generated 4 files",
                "Knowledge base indexed api-spec.pdf",
                "Reviewer flagged 2 issues",
                "New project: payments-service",
              ].map((line) => (
                <div key={line} className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {line}
                </div>
              ))}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
