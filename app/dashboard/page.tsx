"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity, AlertTriangle, Lightbulb, ClipboardCheck, TrendingUp, TrendingDown,
  FolderOpen, Users, FileText, BarChart3, ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/layout/app-shell";

interface DashboardData {
  clients: Array<{
    id: string;
    name: string;
    industry: string;
    businessHealth: number | null;
    dataCompleteness: number | null;
    _count: { findings: number; risks: number; recommendations: number };
  }>;
  findings: Array<{
    id: string;
    title: string;
    domain: string;
    severity: string;
    confidence: number;
    createdAt: string;
  }>;
  risks: Array<{
    id: string;
    title: string;
    category: string;
    severity: string;
    probability: string;
    impact: string;
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    priority: string;
    consultantDecision: string | null;
  }>;
  dataQuality: {
    overall: number;
    completeness: number;
    recency: number;
    consistency: number;
    sourceDiversity: number;
    reliability: number;
  } | null;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [clientsRes, findingsRes, risksRes, recsRes, dqRes] = await Promise.all([
          fetch("/api/clients"),
          fetch("/api/findings?clientId=demo-northstar"),
          fetch("/api/risks?clientId=demo-northstar"),
          fetch("/api/recommendations?clientId=demo-northstar"),
          fetch("/api/data-quality?clientId=demo-northstar"),
        ]);

        const [clients, findings, risks, recommendations, dataQuality] = await Promise.all([
          clientsRes.json(),
          findingsRes.json(),
          risksRes.json(),
          recsRes.json(),
          dqRes.json(),
        ]);

        setData({ clients, findings, risks, recommendations, dataQuality });
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const demoClient = data?.clients?.[0];
  const criticalRisks = data?.risks?.filter((r) => r.severity === "CRITICAL").length || 0;
  const highFindings = data?.findings?.filter((f) => f.severity === "HIGH" || f.severity === "CRITICAL").length || 0;
  const pendingDecisions = data?.recommendations?.filter((r) => r.consultantDecision === "PENDING").length || 0;

  const domainHealth = {
    FINANCIAL: 58,
    OPERATIONS: 45,
    PEOPLE: 38,
    CUSTOMER: 52,
    MARKETING: 67,
    STRATEGY: 55,
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {demoClient ? `Current client: ${demoClient.name}` : "No active client"}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/clients">
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" /> Clients
              </Button>
            </Link>
            <Link href="/data-room">
              <Button variant="outline" size="sm">
                <FolderOpen className="h-4 w-4 mr-2" /> Data Room
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Business Health"
            value={demoClient?.businessHealth?.toString() || "—"}
            suffix="/100"
            icon={Activity}
            trend={demoClient?.businessHealth && demoClient.businessHealth < 70 ? "down" : "up"}
            loading={loading}
          />
          <KpiCard
            title="Critical Risks"
            value={criticalRisks.toString()}
            icon={AlertTriangle}
            trend="down"
            loading={loading}
            highlight={criticalRisks > 0}
          />
          <KpiCard
            title="High Priority Findings"
            value={highFindings.toString()}
            icon={Lightbulb}
            loading={loading}
          />
          <KpiCard
            title="Pending Decisions"
            value={pendingDecisions.toString()}
            icon={ClipboardCheck}
            loading={loading}
            highlight={pendingDecisions > 0}
          />
        </div>

        {/* Domain Health & Data Quality */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Domain Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(domainHealth).map(([domain, score]) => (
                  <div key={domain} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{domain.toLowerCase()}</span>
                      <span className="font-medium">{score}/100</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className={`h-full rounded-full ${
                          score >= 70 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <Skeleton className="h-32" />
              ) : data?.dataQuality ? (
                <>
                  <div className="text-center">
                    <span className="text-3xl font-bold">{data.dataQuality.overall}</span>
                    <span className="text-muted-foreground">/100</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <QualityRow label="Completeness" value={data.dataQuality.completeness} />
                    <QualityRow label="Recency" value={data.dataQuality.recency} />
                    <QualityRow label="Consistency" value={data.dataQuality.consistency} />
                    <QualityRow label="Source Diversity" value={data.dataQuality.sourceDiversity} />
                    <QualityRow label="Reliability" value={data.dataQuality.reliability} />
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No data quality score available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Findings & Risks */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Recent Findings</CardTitle>
              <Link href="/findings">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <Skeleton className="h-24" />
              ) : data?.findings?.slice(0, 4).map((finding) => (
                <div key={finding.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <SeverityBadge severity={finding.severity} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{finding.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px]">{finding.domain}</Badge>
                      <span className="text-xs text-muted-foreground">AI confidence: {Math.round(finding.confidence * 100)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Risk Distribution</CardTitle>
              <Link href="/risks">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-32" />
              ) : (
                <div className="space-y-3">
                  {data?.risks?.slice(0, 5).map((risk) => (
                    <div key={risk.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <SeverityBadge severity={risk.severity} />
                        <div>
                          <p className="text-sm font-medium">{risk.title}</p>
                          <p className="text-xs text-muted-foreground">{risk.category}</p>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <p>P: {risk.probability}</p>
                        <p>I: {risk.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pending Recommendations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Pending Recommendations</CardTitle>
            <Link href="/recommendations">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-24" />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data?.recommendations?.filter((r) => r.consultantDecision === "PENDING").slice(0, 6).map((rec) => (
                  <div key={rec.id} className="p-3 rounded-lg border">
                    <p className="text-sm font-medium">{rec.title}</p>
                    <Badge variant="outline" className="mt-2 text-[10px]">{rec.priority}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function KpiCard({ title, value, suffix, icon: Icon, trend, loading, highlight }: {
  title: string;
  value: string;
  suffix?: string;
  icon: React.ElementType;
  trend?: "up" | "down";
  loading?: boolean;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-red-200" : ""}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{title}</span>
          <Icon className={`h-4 w-4 ${highlight ? "text-red-500" : "text-muted-foreground"}`} />
        </div>
        {loading ? (
          <Skeleton className="h-8 w-16 mt-2" />
        ) : (
          <div className="flex items-baseline gap-1 mt-2">
            <span className={`text-2xl font-bold ${highlight ? "text-red-600" : ""}`}>{value}</span>
            {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
            {trend === "up" && <TrendingUp className="h-4 w-4 text-emerald-500 ml-auto" />}
            {trend === "down" && <TrendingDown className="h-4 w-4 text-red-500 ml-auto" />}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QualityRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-foreground" style={{ width: `${value}%` }} />
        </div>
        <span className="w-8 text-right">{value}</span>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    CRITICAL: "bg-red-100 text-red-700 border-red-200",
    HIGH: "bg-amber-100 text-amber-700 border-amber-200",
    MEDIUM: "bg-blue-100 text-blue-700 border-blue-200",
    LOW: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return (
    <Badge variant="outline" className={`text-[10px] shrink-0 ${colors[severity] || colors.LOW}`}>
      {severity}
    </Badge>
  );
}
