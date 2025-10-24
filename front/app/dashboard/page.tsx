"use client";

import { useAuth } from "@/components/auth-provider";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "insufficient_permissions") {
      toast.error("Access Denied", {
        description: "You don't have permission to access that page.",
      });
      // Clean up URL
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.username}!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
