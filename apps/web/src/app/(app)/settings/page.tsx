import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { auth } from "@/auth";

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" description="Manage your profile and AI preferences." />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information from OAuth.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Name" value={user?.name ?? "—"} />
            <Field label="Email" value={user?.email ?? "—"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI preferences</CardTitle>
            <CardDescription>Defaults applied to new agent runs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Default model</label>
              <select className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                <option value="openai:gpt-4o">openai:gpt-4o</option>
                <option value="anthropic:claude-3-5-sonnet">anthropic:claude-3-5-sonnet</option>
                <option value="openai:gpt-4o-mini">openai:gpt-4o-mini</option>
              </select>
            </div>
            <Button>Save preferences</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
