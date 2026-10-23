"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity, AlertTriangle, Search, Filter, ArrowRight, ShieldAlert,
  TrendingDown, TrendingUp, Minus, MessageSquareWarning,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/layout/app-shell";

interface Finding {
  id: string;
  title: string;
  domain: string;
  severity: string;
  confidence: number;
  summary: string;
  status: string;
  challenged: boolean;
  evidence: Array<{ type: string; source: string; excerpt: string; relevance: number }>;
}

export default function FindingsPage() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId") || "demo-northstar";
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  useEffect(() => {
    fetch(`/api/findings?clientId=${clientId}`)
      .then((r) => r.json())
      .then((data) => { setFindings(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [clientId]);

  const filtered = findings.filter((f) => {
    const matchesSearch = f.title.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === "ALL" || f.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const domains = [...new Set(findings.map((f) => f.domain))];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Findings</h1>
            <p className="text-sm text-muted-foreground">Evidence-backed business findings</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search findings..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button variant={severityFilter === "ALL" ? "default" : "outline"} size="sm" onClick={() => setSeverityFilter("ALL")}>All</Button>
            {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((s) => (
              <Button key={s} variant={severityFilter === s ? "default" : "outline"} size="sm" onClick={() => setSeverityFilter(s)}>
                {s}
              </Button>
            ))}
          </div>
        </div>

        {/* Domain summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {domains.map((domain) => {
            const count = findings.filter((f) => f.domain === domain).length;
            const avgConfidence = findings.filter((f) => f.domain === domain).reduce((a, f) => a + f.confidence, 0) / count;
            return (
              <Card key={domain}>
                <CardContent className="p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{domain}</p>
                  <p className="text-lg font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{Math.round((avgConfidence || 0) * 100)}% avg confidence</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold">No findings</h3>
            <p className="text-sm text-muted-foreground mt-1">Run AI analysis to generate findings</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((finding, i) => (
              <motion.div
                key={finding.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="hover:border-foreground transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <SeverityIcon severity={finding.severity} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <SeverityBadge severity={finding.severity} />
                          <Badge variant="outline" className="text-[10px]">{finding.domain}</Badge>
                          {finding.challenged && (
                            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                              Challenged
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold mt-2">{finding.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{finding.summary}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span>AI confidence: {Math.round(finding.confidence * 100)}%</span>
                          <span>{finding.evidence?.length || 0} evidence items</span>
                          <Link href={`/findings/${finding.id}`}>
                            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs gap-1">
                              View Details <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function SeverityIcon({ severity }: { severity: string }) {
  const icons: Record<string, React.ElementType> = {
    CRITICAL: TrendingDown,
    HIGH: AlertTriangle,
    MEDIUM: Minus,
    LOW: TrendingUp,
  };
  const colors: Record<string, string> = {
    CRITICAL: "text-red-500",
    HIGH: "text-amber-500",
    MEDIUM: "text-blue-500",
    LOW: "text-emerald-500",
  };
  const Icon = icons[severity] || Minus;
  return <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${colors[severity] || ""}`} />;
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    CRITICAL: "bg-red-100 text-red-700 border-red-200",
    HIGH: "bg-amber-100 text-amber-700 border-amber-200",
    MEDIUM: "bg-blue-100 text-blue-700 border-blue-200",
    LOW: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  return (
    <Badge variant="outline" className={`text-[10px] ${colors[severity] || colors.LOW}`}>
      {severity}
    </Badge>
  );
}
