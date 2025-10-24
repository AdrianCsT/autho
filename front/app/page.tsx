"use client";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import Link from "next/link";

const ThemeToggle = dynamic(() => import("@/components/ui/ThemeToggle"), {
  ssr: false,
});

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="flex items-center justify-center min-h-screen bg-background text-foreground px-4">
      <div className="flex flex-col items-center text-center space-y-8 w-full max-w-md">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Autho</h1>
          <p className="text-muted-foreground mt-1">Authentication System</p>
        </div>

        <h2 className="text-lg text-muted-foreground">
          Modern authentication with JWT and HTTP-only cookies
        </h2>
        <div className="flex gap-2 items-center mt-4 w-full justify-center">
          <Button size="lg" className="px-6 text-base font-medium" asChild>
            <Link href={isAuthenticated ? "/dashboard" : "/auth"}>
              {isAuthenticated ? "Go to Dashboard" : "Get Started"}
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </main>
  );
}
