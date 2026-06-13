import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeveloperOS — AI Operating System for developers",
  description:
    "Autonomous coding agents, a retrieval-augmented knowledge base, an ML workspace, and explainability — unified in one platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
