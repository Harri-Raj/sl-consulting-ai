"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CalendarDays, Clock, CheckCircle2, Circle, AlertCircle,
  ArrowRight, Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/layout/app-shell";

interface ActionItem {
  id: string;
  action: string;
  owner: string | null;
  deadline: string | null;
  priority: string;
  expectedImpact: string | null;
  status: string;
}

interface ActionPlan {
  id: string;
  title: string;
  phase: string;
  status: string;
  actionItems: ActionItem[];
}

export default function ActionPlansPage() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId") || "demo-northstar";
  const [plans, setPlans] = useState<ActionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/action-plans?clientId=${clientId}`)
      .then((r) => r.json())
      .then((data) => { setPlans(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [clientId]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">30/60/90 Day Action Plans</h1>
          <p className="text-sm text-muted-foreground">Prioritized action items with owners and deadlines</p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64" />)}
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-20">
            <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold">No action plans</h3>
            <p className="text-sm text-muted-foreground mt-1">Approve recommendations to generate action plans</p>
          </div>
        ) : (
          <div className="space-y-8">
            {plans.map((plan, pi) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: pi * 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-lg">{plan.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{plan.actionItems.length} action items</p>
                    </div>
                    <Badge variant="outline">{plan.phase}-Day Phase</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {plan.actionItems.map((item, i) => (
                        <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border hover:border-foreground transition-colors">
                          <StatusIcon status={item.status} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium">{item.action}</span>
                              <PriorityBadge priority={item.priority} />
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              {item.owner && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.owner}</span>}
                              {item.deadline && <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {new Date(item.deadline).toLocaleDateString()}</span>}
                              {item.expectedImpact && <span>Impact: {item.expectedImpact}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
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

function StatusIcon({ status }: { status: string }) {
  if (status === "COMPLETE") return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
  if (status === "IN_PROGRESS") return <Clock className="h-5 w-5 text-blue-500 shrink-0" />;
  if (status === "BLOCKED") return <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />;
  return <Circle className="h-5 w-5 text-muted-foreground shrink-0" />;
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
