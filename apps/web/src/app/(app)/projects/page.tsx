import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stagger, FadeInItem } from "@/components/ui/motion";

const projects = [
  { name: "payments-service", description: "Stripe-backed billing API", status: "active", tasks: 7 },
  { name: "web-redesign", description: "Marketing site refresh", status: "active", tasks: 3 },
  { name: "ml-churn-model", description: "Customer churn predictor", status: "active", tasks: 12 },
  { name: "legacy-migration", description: "Monolith to services", status: "archived", tasks: 0 },
];

export default function ProjectsPage() {
  return (
    <div>
      <PageHeader
        title="Projects"
        description="Workspaces where agents plan, build, and ship."
        action={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        }
      />

      <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => (
          <FadeInItem key={p.name}>
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-mono text-base">{p.name}</CardTitle>
                  <Badge variant={p.status === "active" ? "success" : "secondary"}>
                    {p.status}
                  </Badge>
                </div>
                <CardDescription>{p.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {p.tasks} open task{p.tasks === 1 ? "" : "s"}
              </CardContent>
            </Card>
          </FadeInItem>
        ))}
      </Stagger>
    </div>
  );
}
