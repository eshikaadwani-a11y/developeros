"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar({ user }: { user?: { name?: string | null; email?: string | null } }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-6">
      <div className="flex flex-col">
        <span className="text-sm text-muted-foreground">Welcome back</span>
        <span className="font-medium">{user?.name ?? user?.email ?? "Developer"}</span>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </header>
  );
}
