import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stagger, FadeInItem } from "@/components/ui/motion";

const agents = [
  {
    type: "Architect",
    description: "Breaks a request into a plan and a file/task breakdown.",
    model: "anthropic:claude-3-5-sonnet",
  },
  {
    type: "Coder",
    description: "Generates and edits code from the architect's plan.",
    model: "openai:gpt-4o",
  },
  {
    type: "Reviewer",
    description: "Critiques diffs, flags issues, and requests changes.",
    model: "anthropic:claude-3-5-sonnet",
  },
  {
    type: "Debugger",
    description: "Resolves failing checks and review findings.",
    model: "openai:gpt-4o",
  },
  {
    type: "Research",
    description: "Gathers context from the knowledge base and the web.",
    model: "openai:gpt-4o-mini",
  },
  {
    type: "Documentation",
    description: "Produces docs and summaries for shipped work.",
    model: "openai:gpt-4o-mini",
  },
];

export default function AgentsPage() {
  return (
    <div>
      <PageHeader
        title="Agents"
        description="Six specialized agents collaborate through a shared orchestration layer."
      />

      <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((a) => (
          <FadeInItem key={a.type}>
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{a.type}</CardTitle>
                  <Badge variant="success">enabled</Badge>
                </div>
                <CardDescription>{a.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Default model</p>
                <p className="font-mono text-sm">{a.model}</p>
              </CardContent>
            </Card>
          </FadeInItem>
        ))}
      </Stagger>
    </div>
  );
}
