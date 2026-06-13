import Link from "next/link";
import { AuthButtons } from "@/components/auth/auth-buttons";

export default function SignupPage() {
  return (
    <main className="container flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          DeveloperOS uses OAuth — pick a provider to get started instantly.
        </p>

        <div className="mt-8">
          <AuthButtons callbackUrl="/dashboard" />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
