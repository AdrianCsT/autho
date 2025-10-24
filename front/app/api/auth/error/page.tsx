"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const errorMessages: Record<string, { title: string; description: string }> = {
  Default: {
    title: "Authentication Error",
    description: "An unexpected error occurred during authentication.",
  },
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";

  const errorInfo = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <ShieldAlert className="h-10 w-10 text-destructive" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">{errorInfo.title}</CardTitle>
            <CardDescription className="mt-2">{errorInfo.description}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error !== "Default" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error details</AlertTitle>
              <AlertDescription className="font-mono text-xs">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Button asChild className="w-full" size="lg">
              <Link href="/auth">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/">Go to Home</Link>
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Need help?{" "}
            <Link href="/support" className="font-medium underline underline-offset-4 hover:text-primary">
              Contact Support
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
