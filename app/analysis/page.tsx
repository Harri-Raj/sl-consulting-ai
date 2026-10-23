"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Play, Loader2, CheckCircle, AlertCircle, Brain, Search,
  FileSearch, Shield, TrendingUp, Lightbulb, AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppShell } from "@/components/layout/app-shell";

const stages = [
  { name: "Preparing client context", icon: Brain },
  { name: "Analyzing documents", icon: FileSearch },
  { name: "Identifying patterns", icon: Search },
  { name: "Cross-referencing evidence", icon: Shield },
  { name: "Evaluating risks", icon: AlertTriangle },
  { name: "Estimating business impact", icon: TrendingUp },
  { name: "Generating recommendations", icon: Lightbulb },
  { name: "Checking human-intervention requirements", icon: CheckCircle },
];

export default function AnalysisPage() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId") || "demo-northstar";
  const [analysis, setAnalysis] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/analysis?clientId=${clientId}`);
      if (!res.ok) {
        setAnalysis(null);
        return;
      }
      const text = await res.text();
      if (!text) {
        setAnalysis(null);
        return;
      }
      const data = JSON.parse(text);
      setAnalysis(data.analysis || null);
    } catch {
      setAnalysis(null);
    }
  }, [clientId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  async function runAnalysis() {
    setRunning(true);
    setError("");
    setComplete(false);
    setProgress(0);
    setCurrentStage(0);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) { clearInterval(interval); return p; }
        const next = p + Math.random() * 8;
        setCurrentStage(Math.min(Math.floor((next / 100) * stages.length), stages.length - 1));
        return next;
      });
    }, 600);

    try {
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });

      clearInterval(interval);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }

      setProgress(100);
      setCurrentStage(stages.length - 1);
      setComplete(true);
      await fetchStatus();
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Business Analysis</h1>
            <p className="text-sm text-muted-foreground">Run diagnostic analysis on client data</p>
          </div>
          <Button onClick={runAnalysis} disabled={running}>
            {running ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            {running ? "Analyzing..." : "Run AI Diagnostic"}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {complete && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Analysis complete. View findings, risks, and recommendations.</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Analysis Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{running || complete ? stages[currentStage]?.name || "Complete" : "Ready to start"}</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="grid gap-3">
              {stages.map((stage, i) => {
                const isComplete = progress >= ((i + 1) / stages.length) * 100;
                const isActive = i === currentStage && running;
                return (
                  <motion.div
                    key={stage.name}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      isComplete ? "bg-muted/50 border-foreground/20" : "border-muted"
                    } ${isActive ? "ring-1 ring-foreground" : ""}`}
                    animate={isActive ? { scale: [1, 1.01, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isComplete ? "bg-foreground text-background" : "bg-muted"
                    }`}>
                      {isComplete ? <CheckCircle className="h-4 w-4" /> : <stage.icon className="h-4 w-4" />}
                    </div>
                    <span className={`text-sm ${isComplete ? "font-medium" : "text-muted-foreground"}`}>
                      {stage.name}
                    </span>
                    {isActive && <Loader2 className="h-4 w-4 ml-auto animate-spin" />}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {analysis?.results && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Last Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-64">
                {JSON.stringify(JSON.parse(analysis.results), null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}