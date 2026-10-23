"use client";

import { useSession } from "next-auth/react";
import { Shield, Key, User, Bell, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/layout/app-shell";

export default function SettingsPage() {
  const { data: session } = useSession();

  const groqConfigured = typeof process !== "undefined" && process.env.GROQ_API_KEY ? true : false;

  return (
    <AppShell>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Application configuration and status</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name</span>
                <p className="font-medium">{session?.user?.name || "N/A"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Email</span>
                <p className="font-medium">{session?.user?.email || "N/A"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Role</span>
                <p className="font-medium">{session?.user?.role || "Consultant"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Key className="h-4 w-4" /> AI Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Groq API</p>
                <p className="text-xs text-muted-foreground">LLM provider for business analysis</p>
              </div>
              <Badge variant={groqConfigured ? "default" : "destructive"}>
                {groqConfigured ? "Configured" : "Not Configured"}
              </Badge>
            </div>
            {!groqConfigured && (
              <div className="mt-3 p-3 rounded-lg bg-muted text-sm">
                <p className="font-medium">Setup Required</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Add GROQ_API_KEY to your environment variables to enable AI analysis.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" /> Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">SQLite</p>
                <p className="text-xs text-muted-foreground">Local development database</p>
              </div>
              <Badge>Active</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" /> Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Authentication</span>
              <Badge variant="outline">NextAuth</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Password Hashing</span>
              <Badge variant="outline">bcryptjs</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Session Strategy</span>
              <Badge variant="outline">JWT</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
