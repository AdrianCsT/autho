import { XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountSuspendedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Account Suspended</CardTitle>
          <CardDescription>
            Your account has been suspended and you cannot access the application at this time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="mb-2 font-medium">Why was my account suspended?</p>
            <p className="text-muted-foreground">
              Accounts may be suspended for violating our terms of service, suspicious activity, 
              or security concerns.
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              If you believe this is a mistake or would like to appeal this decision, 
              please contact our support team.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild>
              <a href="mailto:support@example.com">Contact Support</a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth">Back to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
