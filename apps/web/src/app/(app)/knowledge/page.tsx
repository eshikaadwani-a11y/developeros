import { Upload, FileText, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn, Stagger, FadeInItem } from "@/components/ui/motion";

const documents = [
  { name: "api-spec.pdf", chunks: 84, status: "indexed" },
  { name: "architecture.md", chunks: 31, status: "indexed" },
  { name: "onboarding.docx", chunks: 22, status: "processing" },
  { name: "schema.sql", chunks: 12, status: "indexed" },
];

export default function KnowledgePage() {
  return (
    <div>
      <PageHeader
        title="Knowledge Base"
        description="Upload documents and search them with semantic, keyword, and hybrid retrieval."
        action={
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        }
      />

      <FadeIn>
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search knowledge (hybrid: vector + keyword)…"
            className="w-full rounded-lg border border-border bg-card py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </FadeIn>

      <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {documents.map((d) => (
          <FadeInItem key={d.name}>
            <Card className="transition-colors hover:border-primary/50">
              <CardContent className="flex items-center gap-4 p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.chunks} chunks</p>
                </div>
                <Badge variant={d.status === "indexed" ? "success" : "warning"}>
                  {d.status}
                </Badge>
              </CardContent>
            </Card>
          </FadeInItem>
        ))}
      </Stagger>
    </div>
  );
}
