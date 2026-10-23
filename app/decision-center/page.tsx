"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ClipboardCheck, CheckCircle, XCircle, MessageSquare, UserPlus,
  Calendar, Clock, Filter, Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/layout/app-shell";

interface Decision {
  id: string;
  type: string;
  title: string;
  description: string | null;
  status: string;
  assignedOwner: string | null;
  targetDate: string | null;
  createdAt: string;
  user: { name: string | null };
}

export default function DecisionCenterPage() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId") || "demo-northstar";
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    fetch(`/api/decisions?clientId=${clientId}`)
      .then((r) => r.json())
      .then((data) => { setDecisions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [clientId]);

  const filtered = decisions.filter((d) => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "ALL" || d.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const types = [...new Set(decisions.map((d) => d.type))];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Decision Center</h1>
            <p className="text-sm text-muted-foreground">Track consultant decisions and approvals</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search decisions..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant={typeFilter === "ALL" ? "default" : "outline"} size="sm" onClick={() => setTypeFilter("ALL")}>All</Button>
            {types.map((t) => (
              <Button key={t} variant={typeFilter === t ? "default" : "outline"} size="sm" onClick={() => setTypeFilter(t)}>
                {t.replace("_", " ")}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Decisions", value: decisions.length },
            { label: "Pending", value: decisions.filter((d) => d.status === "PENDING").length },
            { label: "Approved", value: decisions.filter((d) => d.status === "APPROVED").length },
            { label: "Rejected", value: decisions.filter((d) => d.status === "REJECTED").length },
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
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold">No decisions recorded</h3>
            <p className="text-sm text-muted-foreground mt-1">Decisions will appear as you review recommendations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((decision, i) => (
              <motion.div
                key={decision.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="hover:border-foreground transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <TypeIcon type={decision.type} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px]">{decision.type.replace("_", " ")}</Badge>
                          <StatusBadge status={decision.status} />
                        </div>
                        <h3 className="font-semibold mt-2">{decision.title}</h3>
                        {decision.description && (
                          <p className="text-sm text-muted-foreground mt-1">{decision.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><UserPlus className="h-3 w-3" /> {decision.user?.name || "Unknown"}</span>
                          {decision.assignedOwner && <span className="flex items-center gap-1"><UserPlus className="h-3 w-3" /> Owner: {decision.assignedOwner}</span>}
                          {decision.targetDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Target: {decision.targetDate}</span>}
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(decision.createdAt).toLocaleDateString()}</span>
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

function TypeIcon({ type }: { type: string }) {
  const icons: Record<string, React.ElementType> = {
    APPROVE: CheckCircle,
    REJECT: XCircle,
    MODIFY: MessageSquare,
    REQUEST_EVIDENCE: MessageSquare,
    ASSIGN_OWNER: UserPlus,
    CLIENT_DISCUSSION: MessageSquare,
  };
  const Icon = icons[type] || ClipboardCheck;
  return (
    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
      <Icon className="h-5 w-5" />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
    COMPLETE: "bg-blue-100 text-blue-700 border-blue-200",
  };
  return (
    <Badge variant="outline" className={`text-[10px] ${colors[status] || colors.PENDING}`}>
      {status}
    </Badge>
  );
}
