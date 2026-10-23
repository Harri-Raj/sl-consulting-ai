"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Building2, Users, FileText, Activity, AlertTriangle,
  Lightbulb, ClipboardCheck, CalendarDays, TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/layout/app-shell";

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clients/${clientId}`)
      .then((r) => r.json())
      .then((data) => { setClient(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [clientId]);

  if (loading) {
    return (
      <AppShell>
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </AppShell>
    );
  }

  if (!client) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold">Client not found</h2>
          <Link href="/clients">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Clients
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/clients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
            <p className="text-sm text-muted-foreground">{client.industry} · {client.companySize}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FileText} label="Documents" value={client.documents?.length || 0} />
          <StatCard icon={Activity} label="Findings" value={client.findings?.length || 0} />
          <StatCard icon={AlertTriangle} label="Risks" value={client.risks?.length || 0} />
          <StatCard icon={Lightbulb} label="Recommendations" value={client.recommendations?.length || 0} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Company Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Revenue Range</span>
                  <p className="font-medium">{client.revenueRange}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Employees</span>
                  <p className="font-medium">{client.employeeCount || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Assessment Period</span>
                  <p className="font-medium">{client.assessmentPeriod || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline">{client.status}</Badge>
                </div>
              </div>
              {client.engagementObjective && (
                <div>
                  <span className="text-muted-foreground text-sm">Engagement Objective</span>
                  <p className="text-sm mt-1">{client.engagementObjective}</p>
                </div>
              )}
              {client.primaryChallenge && (
                <div>
                  <span className="text-muted-foreground text-sm">Primary Challenge</span>
                  <p className="text-sm mt-1">{client.primaryChallenge}</p>
                </div>
              )}
              {client.consultantNotes && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground text-sm">Consultant Notes</span>
                  <p className="text-sm mt-1">{client.consultantNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/data-room">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" /> Open Data Room
                  </Button>
                </Link>
                <Link href="/analysis">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" /> Run AI Diagnostic
                  </Button>
                </Link>
                <Link href="/findings">
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="h-4 w-4 mr-2" /> View Findings
                  </Button>
                </Link>
                <Link href="/reports">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" /> Generate Report
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Assessment Status</CardTitle>
              </CardHeader>
              <CardContent>
                {client.assessments?.[0] ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge>{client.assessments[0].status}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Step</span>
                      <span>{client.assessments[0].step} of 6</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No assessment started</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-2xl font-bold">{value}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{label}</p>
      </CardContent>
    </Card>
  );
}
