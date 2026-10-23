"use client";

import { useSession } from "next-auth/react";
import { Sidebar } from "./sidebar";

export function AppShell({ children, currentClient }: { children: React.ReactNode; currentClient?: string }) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userName={user?.name || undefined} currentClient={currentClient} />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}