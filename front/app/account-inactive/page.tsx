import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountInactivePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
          </div>
          <CardTitle className="text-2xl">Account Inactive</CardTitle>
          <CardDescription>
            Your account is currently inactive and requires activation before you can proceed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="mb-2 font-medium">Activate Your Account</p>
            <p className="text-muted-foreground">
              Please check your email for an activation link. If you haven't received it, 
              you can request a new activation email.
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              If you're having trouble activating your account, please contact our support team 
              for assistance.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button>
              Resend Activation Email
            </Button>
            <Button variant="outline" asChild>
              <a href="mailto:support@example.com">Contact Support</a>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/auth">Back to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
