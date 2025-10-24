"use client";

import { cn } from "@/lib/utils"; // make sure your helper is here
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

export function AuthTabs() {
  return (
    <Tabs defaultValue="login" className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-2 bg-muted/40 rounded-lg p-1">
        <TabsTrigger
          value="login"
          className={cn(
            "rounded-md transition-colors py-1",
            "data-[state=active]:!bg-primary data-[state=active]:text-primary-foreground"
          )}
        >
          Login
        </TabsTrigger>

        <TabsTrigger
          value="register"
          className={cn(
            "rounded-md transition-colors py-1",
            "data-[state=active]:!bg-primary data-[state=active]:text-primary-foreground"
          )}
        >
          Register
        </TabsTrigger>
      </TabsList>

      <TabsContent value="login">
        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="register">
        <Card>
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Enter your information to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
