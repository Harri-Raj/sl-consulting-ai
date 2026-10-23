"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Lightbulb, Search, Filter, CheckCircle, XCircle, Clock, ArrowRight,
  TrendingUp, TrendingDown, Minus, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/layout/app-shell";

interface Recommendation {
  id: string;
  title: string;
  rationale: string;
  expectedImpact: string | null;
  implementationEffort: string;
  priority: string;
  confidence: number;
  risk: string | null;
  owner: string | null;
  timeHorizon: string | null;
  humanApprovalRequired: boolean;
  consultantDecision: string | null;
  status: string;
  finding: { title: string } | null;
}

export default function RecommendationsPage() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId") || "demo-northstar";
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [decisionFilter, setDecisionFilter] = useState("ALL");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/recommendations?clientId=${clientId}`)
      .then((r) => r.json())
      .then((data) => { setRecommendations(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [clientId]);

  async function updateDecision(id: string, decision: string) {
    setUpdating(id);
    await fetch(`/api/recommendations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    setRecommendations(recommendations.map((r) =>
      r.id === id ? { ...r, consultantDecision: decision, status: decision === "APPROVE" ? "APPROVED" : decision === "REJECT" ? "REJECTED" : r.status } : r
    ));
    setUpdating(null);
  }

  const filtered = recommendations.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter === "ALL" || r.priority === priorityFilter;
    const matchesDecision = decisionFilter === "ALL" || r.consultantDecision === decisionFilter;
    return matchesSearch && matchesPriority && matchesDecision;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Recommendations</h1>
            <p className="text-sm text-muted-foreground">AI-generated recommendations awaiting consultant review</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search recommendations..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant={priorityFilter === "ALL" ? "default" : "outline"} size="sm" onClick={() => setPriorityFilter("ALL")}>All</Button>
            {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((p) => (
              <Button key={p} variant={priorityFilter === p ? "default" : "outline"} size="sm" onClick={() => setPriorityFilter(p)}>
                {p}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Pending", value: recommendations.filter((r) => r.consultantDecision === "PENDING").length },
            { label: "Approved", value: recommendations.filter((r) => r.consultantDecision === "APPROVE").length },
            { label: "Rejected", value: recommendations.filter((r) => r.consultantDecision === "REJECT").length },
            { label: "Need Human Approval", value: recommendations.filter((r) => r.humanApprovalRequired && r.consultantDecision === "PENDING").length },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold">No recommendations</h3>
            <p className="text-sm text-muted-foreground mt-1">Run AI analysis to generate recommendations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((rec, i) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`hover:border-foreground transition-colors ${rec.humanApprovalRequired && rec.consultantDecision === "PENDING" ? "border-amber-200" : ""}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <span className="text-lg font-bold">{String(i + 1).padStart(2, "0")}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <PriorityBadge priority={rec.priority} />
                          <EffortBadge effort={rec.implementationEffort} />
                          <DecisionBadge decision={rec.consultantDecision} />
                          {rec.humanApprovalRequired && (
                            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                              Human Approval Required
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold mt-2">{rec.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{rec.rationale}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span>Impact: <span className="font-medium text-foreground">{rec.expectedImpact || "N/A"}</span></span>
                          <span>Confidence: {Math.round(rec.confidence * 100)}%</span>
                          <span>Owner: {rec.owner || "Unassigned"}</span>
                          <span>Timeline: {rec.timeHorizon || "N/A"}</span>
                        </div>
                        {rec.consultantDecision === "PENDING" && (
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" onClick={() => updateDecision(rec.id, "APPROVE")} disabled={updating === rec.id}>
                              {updating === rec.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => updateDecision(rec.id, "MODIFY")} disabled={updating === rec.id}>
                              Modify
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => updateDecision(rec.id, "REJECT")} disabled={updating === rec.id}>
                              <XCircle className="h-3 w-3 mr-1" /> Reject
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => updateDecision(rec.id, "REQUEST_EVIDENCE")} disabled={updating === rec.id}>
                              Request Evidence
                            </Button>
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

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    CRITICAL: "bg-red-100 text-red-700 border-red-200",
    HIGH: "bg-amber-100 text-amber-700 border-amber-200",
    MEDIUM: "bg-blue-100 text-blue-700 border-blue-200",
    LOW: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  return (
    <Badge variant="outline" className={`text-[10px] ${colors[priority] || colors.LOW}`}>
      {priority}
    </Badge>
  );
}

function EffortBadge({ effort }: { effort: string }) {
  const colors: Record<string, string> = {
    LOW: "bg-emerald-50 text-emerald-700 border-emerald-200",
    MEDIUM: "bg-blue-50 text-blue-700 border-blue-200",
    HIGH: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <Badge variant="outline" className={`text-[10px] ${colors[effort] || colors.MEDIUM}`}>
      {effort} Effort
    </Badge>
  );
}

function DecisionBadge({ decision }: { decision: string | null }) {
  if (!decision || decision === "PENDING") return <Badge variant="outline" className="text-[10px]">Pending</Badge>;
  const colors: Record<string, string> = {
    APPROVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
    MODIFY: "bg-blue-100 text-blue-700 border-blue-200",
    REJECT: "bg-red-100 text-red-700 border-red-200",
    REQUEST_EVIDENCE: "bg-amber-100 text-amber-700 border-amber-200",
  };
  return (
    <Badge variant="outline" className={`text-[10px] ${colors[decision] || ""}`}>
      {decision.replace("_", " ")}
    </Badge>
  );
}
