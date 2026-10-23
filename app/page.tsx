"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Brain, Shield, FileText, Users, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-foreground rounded-sm flex items-center justify-center">
              <span className="text-background font-bold text-sm">SL</span>
            </div>
            <span className="font-semibold text-sm tracking-tight">SL Consulting AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Start Assessment</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Business intelligence for decisions that matter.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Transform fragmented business information into evidence-backed findings, opportunities, risks, and action plans.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="gap-2">
                  Start Assessment <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  View Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 border-t">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: FileText, title: "Intake & Data Room", desc: "Collect qualitative and quantitative business information through structured intake and document uploads." },
              { icon: Brain, title: "AI-Powered Analysis", desc: "Groq AI analyzes documents, identifies patterns, cross-references evidence, and evaluates risks." },
              { icon: Shield, title: "Human-in-the-Loop", desc: "Consultants review AI findings, challenge conclusions, and make evidence-backed decisions." },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-20 px-6 border-t bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-16">Core Capabilities</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BarChart3, title: "Business Health Diagnostics", desc: "Multi-domain analysis across financial, operational, people, customer, and strategic dimensions." },
              { icon: Shield, title: "Risk Radar", desc: "Identify, categorize, and prioritize risks with probability, impact, and confidence scoring." },
              { icon: Zap, title: "Evidence Explorer", desc: "Trace every finding back to source documents with relevant excerpts and contradicting evidence." },
              { icon: Users, title: "Human Intervention Engine", desc: "Explicitly flag when consultant review, specialist input, or executive decision is required." },
              { icon: FileText, title: "Executive Reporting", desc: "Generate professional consulting reports with structured sections and data limitations." },
              { icon: Brain, title: "AI Business Advisor", desc: "Ask evidence-backed questions about the client's situation with source references." },
            ].map((cap, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-xl border bg-background"
              >
                <cap.icon className="h-5 w-5 mb-3" />
                <h3 className="font-semibold text-sm mb-2">{cap.title}</h3>
                <p className="text-sm text-muted-foreground">{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI + Human Workflow */}
      <section className="py-20 px-6 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">AI + Human Workflow</h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
            AI accelerates analysis. Human expertise makes the decision. Every critical recommendation requires consultant validation.
          </p>
          <div className="grid sm:grid-cols-2 gap-8 text-left">
            <div className="p-6 rounded-xl border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Brain className="h-4 w-4" /> AI Does
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {["Pattern recognition across documents", "Evidence extraction and linking", "Risk probability estimation", "Impact range calculation", "Structured output generation"].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 rounded-xl border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" /> Humans Do
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {["Strategic judgment and context", "Client relationship management", "Legal and regulatory interpretation", "Final recommendation approval", "Action plan ownership"].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 border-t bg-muted/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to transform your consulting workflow?</h2>
          <p className="text-muted-foreground mb-8">
            Start with a demo assessment and experience evidence-backed business intelligence.
          </p>
          <Link href="/login">
            <Button size="lg" className="gap-2">
              Start Assessment <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t text-center text-sm text-muted-foreground">
        <p>SL Consulting AI – Business Diagnostic & Decision Intelligence</p>
      </footer>
    </div>
  );
}
