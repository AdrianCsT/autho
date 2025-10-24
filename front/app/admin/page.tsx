"use client";

import { useAuth } from "@/components/auth-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  AlertTriangle,
  Database,
  Settings,
  Shield,
  Users
} from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const { user } = useAuth();

  const isAdmin = () => {
    return user?.role === "admin";
  };

  // Check if user has admin role
  if (!isAdmin()) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You do not have permission to access this page. Admin role is required.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Insufficient Permissions</CardTitle>
              <CardDescription>
                This page is restricted to administrators only.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Your Roles:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {user?.role ? (
                      <Badge key={user.role} variant="secondary">
                        {user.role}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">No role assigned</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/dashboard">
                  <Button variant="outline">Return to Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Admin content - only shown to users with admin role
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
            </div>
            <p className="text-muted-foreground mt-1">
              System administration and management
            </p>
          </div>
        </div>

        {/* Admin Badge */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Administrator Access</AlertTitle>
          <AlertDescription>
            You are logged in as <strong>{user?.username}</strong> with admin privileges.
          </AlertDescription>
        </Alert>

        {/* Admin Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                User management available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Session monitoring
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Healthy</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Configuration</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ready</div>
              <p className="text-xs text-muted-foreground">
                System configured
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
            <CardDescription>
              Quick access to administrative functions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Link href="/dashboard/users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
              </Link>

              <Button variant="outline" className="w-full justify-start" disabled>
                <Settings className="mr-2 h-4 w-4" />
                System Settings
              </Button>

              <Button variant="outline" className="w-full justify-start" disabled>
                <Activity className="mr-2 h-4 w-4" />
                View Activity Logs
              </Button>

              <Button variant="outline" className="w-full justify-start" disabled>
                <Database className="mr-2 h-4 w-4" />
                Database Management
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Role-Based UI Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Your Admin Privileges</CardTitle>
            <CardDescription>
              Roles and permissions assigned to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Active Roles:</p>
                <div className="flex flex-wrap gap-2">
                  {user?.role && (
                    <Badge
                      key={user.role}
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  As an administrator, you have full access to all system features and can manage users,
                  view logs, and configure system settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
