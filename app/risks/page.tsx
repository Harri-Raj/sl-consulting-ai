"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertTriangle, Search, Filter, ShieldAlert, TrendingDown, Minus, TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/layout/app-shell";

interface Risk {
  id: string;
  title: string;
  category: string;
  probability: string;
  impact: string;
  severity: string;
  confidence: number;
  description: string;
  mitigation: string | null;
  humanReviewRequired: boolean;
}

export default function RisksPage() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId") || "demo-northstar";
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    fetch(`/api/risks?clientId=${clientId}`)
      .then((r) => r.json())
      .then((data) => { setRisks(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [clientId]);

  const filtered = risks.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(risks.map((r) => r.category))];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Risk Radar</h1>
            <p className="text-sm text-muted-foreground">Identify and prioritize business risks</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search risks..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant={categoryFilter === "ALL" ? "default" : "outline"} size="sm" onClick={() => setCategoryFilter("ALL")}>All</Button>
            {categories.map((cat) => (
              <Button key={cat} variant={categoryFilter === cat ? "default" : "outline"} size="sm" onClick={() => setCategoryFilter(cat)}>
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Risk matrix summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => {
            const count = risks.filter((r) => r.severity === sev).length;
            return (
              <Card key={sev}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <SeverityBadge severity={sev} />
                    <span className="text-2xl font-bold">{count}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{sev.toLowerCase()} severity risks</p>
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
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold">No risks identified</h3>
            <p className="text-sm text-muted-foreground mt-1">Run AI analysis to identify risks</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((risk, i) => (
              <motion.div
                key={risk.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`hover:border-foreground transition-colors ${risk.humanReviewRequired ? "border-amber-200" : ""}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <SeverityIcon severity={risk.severity} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <SeverityBadge severity={risk.severity} />
                          <Badge variant="outline" className="text-[10px]">{risk.category}</Badge>
                          {risk.humanReviewRequired && (
                            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                              Human Review Required
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold mt-2">{risk.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span>Probability: <span className="font-medium text-foreground">{risk.probability}</span></span>
                          <span>Impact: <span className="font-medium text-foreground">{risk.impact}</span></span>
                          <span>AI confidence: {Math.round(risk.confidence * 100)}%</span>
                        </div>
                        {risk.mitigation && (
                          <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm">
                            <span className="font-medium">Mitigation:</span> {risk.mitigation}
                          </div>
                        )}
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
