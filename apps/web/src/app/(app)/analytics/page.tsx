import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn, Stagger, FadeInItem } from "@/components/ui/motion";

const metrics = [
  { label: "Total Tokens (30d)", value: "4.2M" },
  { label: "Total Cost (30d)", value: "$86.10" },
  { label: "Agent Runs (30d)", value: "612" },
  { label: "Avg. Latency", value: "3.1s" },
];

const usageByModel = [
  { model: "openai:gpt-4o", pct: 52 },
  { model: "anthropic:claude-3-5-sonnet", pct: 33 },
  { model: "openai:gpt-4o-mini", pct: 15 },
];

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Token usage, costs, agent activity, and model performance."
      />

      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <FadeInItem key={m.label}>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">{m.label}</p>
                <p className="mt-1 text-2xl font-bold">{m.value}</p>
              </CardContent>
            </Card>
          </FadeInItem>
        ))}
      </Stagger>

      <FadeIn className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Usage by model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {usageByModel.map((u) => (
              <div key={u.model}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-mono">{u.model}</span>
                  <span className="text-muted-foreground">{u.pct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${u.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
