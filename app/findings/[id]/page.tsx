"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, AlertTriangle, MessageSquareWarning, CheckCircle,
  FileText, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/layout/app-shell";

export default function FindingDetailPage() {
  const params = useParams();
  const findingId = params.id as string;
  const [finding, setFinding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [challenging, setChallenging] = useState(false);
  const [challengeResult, setChallengeResult] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/findings/${findingId}`)
      .then((r) => r.json())
      .then((data) => { setFinding(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [findingId]);

  async function handleChallenge() {
    setChallenging(true);
    try {
      const res = await fetch(`/api/findings/${findingId}/challenge`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setChallengeResult(data);
        const refreshed = await fetch(`/api/findings/${findingId}`).then((r) => r.json());
        setFinding(refreshed);
      }
    } catch {
      // ignore
    } finally {
      setChallenging(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-96" />
      </AppShell>
    );
  }

  if (!finding) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold">Finding not found</h2>
          <Link href="/findings">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Findings
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const businessImpact = finding.businessImpact ? JSON.parse(finding.businessImpact) : null;
  const humanIntervention = finding.humanIntervention ? JSON.parse(finding.humanIntervention) : null;
  const rootCauses = finding.rootCauseHypotheses ? JSON.parse(finding.rootCauseHypotheses) : [];
  const contradicting = finding.contradictingEvidence ? JSON.parse(finding.contradictingEvidence) : [];
  const existingChallenge = finding.challengeResult ? JSON.parse(finding.challengeResult) : null;

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Link href="/findings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <SeverityBadge severity={finding.severity} />
              <Badge variant="outline" className="text-[10px]">{finding.domain}</Badge>
            </div>
            <h1 className="text-xl font-bold mt-1">{finding.title}</h1>
          </div>
        </div>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">AI confidence:</span>
              <span className="font-medium">{Math.round(finding.confidence * 100)}%</span>
              {existingChallenge && (
                <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                  Revised: {Math.round(existingChallenge.revisedConfidence * 100)}%
                </Badge>
              )}
            </div>
            <p className="text-sm mt-4 leading-relaxed">{finding.summary}</p>
          </CardContent>
        </Card>

        {/* Evidence Explorer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Evidence Explorer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {finding.evidence?.map((ev: any, i: number) => (
              <div key={i} className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={`text-[10px] ${
                    ev.type === "SUPPORTING" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    ev.type === "CONTRADICTING" ? "bg-red-50 text-red-700 border-red-200" :
                    "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {ev.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{ev.source}</span>
                  <span className="text-xs text-muted-foreground ml-auto">Relevance: {Math.round(ev.relevance * 100)}%</span>
                </div>
                <p className="text-sm text-muted-foreground italic">&ldquo;{ev.excerpt}&rdquo;</p>
              </div>
            ))}
            {(!finding.evidence || finding.evidence.length === 0) && (
              <p className="text-sm text-muted-foreground">No evidence linked to this finding</p>
            )}
          </CardContent>
        </Card>

        {/* Root Cause */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Root Cause Hypotheses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rootCauses.map((cause: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-medium">
                    {i + 1}
                  </div>
                  <p className="text-sm">{cause}</p>
                </div>
              ))}
              {rootCauses.length === 0 && (
                <p className="text-sm text-muted-foreground">No root cause hypotheses identified</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic">These are AI-generated hypotheses, not proven causal relationships.</p>
          </CardContent>
        </Card>

        {/* Contradicting Evidence */}
        {contradicting.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Contradicting Evidence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contradicting.map((item: string, i: number) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-lg border border-red-100 bg-red-50/30">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Business Impact */}
        {businessImpact && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Business Impact Estimate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  ${(businessImpact.estimateLow / 1000).toFixed(0)}K &ndash; ${(businessImpact.estimateHigh / 1000).toFixed(0)}K
                </span>
                <span className="text-sm text-muted-foreground">{businessImpact.type}</span>
              </div>
              <p className="text-xs text-muted-foreground">AI estimate &mdash; validate with client financial data</p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Assumptions:</p>
                {businessImpact.assumptions.map((a: string, i: number) => (
                  <p key={i} className="text-sm text-muted-foreground">&bull; {a}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Human Intervention */}
        {humanIntervention?.required && (
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Human Intervention Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-700 border-amber-200">
                {humanIntervention.level}
              </Badge>
              <p className="text-sm">{humanIntervention.reason}</p>
            </CardContent>
          </Card>
        )}

        {/* Challenge */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Challenge This Finding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Send this finding back to AI for critical re-evaluation of evidence, assumptions, and alternative explanations.
            </p>
            <Button onClick={handleChallenge} disabled={challenging}>
              {challenging ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MessageSquareWarning className="h-4 w-4 mr-2" />}
              {challenging ? "Analyzing..." : "Challenge Finding"}
            </Button>

            {(challengeResult || existingChallenge) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 p-4 rounded-lg border bg-muted/30 space-y-3"
              >
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Original confidence:</span>
                    <span className="font-medium ml-1">{Math.round((challengeResult || existingChallenge).originalConfidence * 100)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Revised confidence:</span>
                    <span className="font-medium ml-1">{Math.round((challengeResult || existingChallenge).revisedConfidence * 100)}%</span>
                  </div>
                </div>
                <p className="text-sm">{(challengeResult || existingChallenge).confidenceChangeReason}</p>
                {(challengeResult || existingChallenge).alternativeExplanations?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Alternative Explanations:</p>
                    {(challengeResult || existingChallenge).alternativeExplanations.map((e: string, i: number) => (
                      <p key={i} className="text-sm text-muted-foreground">&bull; {e}</p>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
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
