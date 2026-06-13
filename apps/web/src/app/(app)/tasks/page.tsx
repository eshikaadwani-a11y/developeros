import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/motion";

const columns = [
  {
    title: "Pending",
    items: [
      { title: "Define API contract", agent: "architect" },
      { title: "Research vector store options", agent: "research" },
    ],
  },
  {
    title: "In Progress",
    items: [
      { title: "Implement auth callbacks", agent: "coder" },
      { title: "Review payment diff", agent: "reviewer" },
    ],
  },
  {
    title: "Done",
    items: [
      { title: "Scaffold monorepo", agent: "architect" },
      { title: "Write DB schemas", agent: "coder" },
      { title: "Document setup", agent: "documentation" },
    ],
  },
];

export default function TasksPage() {
  return (
    <div>
      <PageHeader title="Tasks" description="Work items flowing through the agent pipeline." />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {columns.map((col, ci) => (
          <FadeIn key={col.title} delay={ci * 0.08}>
            <div className="rounded-xl border border-border bg-card/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-medium">{col.title}</h2>
                <Badge variant="secondary">{col.items.length}</Badge>
              </div>
              <div className="space-y-3">
                {col.items.map((t) => (
                  <Card key={t.title}>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium">{t.title}</p>
                      <Badge className="mt-2" variant="outline">
                        {t.agent}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
