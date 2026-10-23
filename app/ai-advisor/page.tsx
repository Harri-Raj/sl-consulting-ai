"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Send, User, Bot, Loader2, FileText, AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppShell } from "@/components/layout/app-shell";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; excerpt: string }[];
  confidence?: string;
}

const suggestedQuestions = [
  "What are the three biggest threats to profitability?",
  "What evidence supports the retention problem?",
  "What are we missing?",
  "Which findings have the strongest evidence?",
  "What should we address in the next 30 days?",
  "Challenge the conclusion about customer churn.",
  "What would you investigate next?",
];

export default function AIAdvisorPage() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId") || "demo-northstar";
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage(question: string) {
    if (!question.trim()) return;
    setInput("");
    setError("");
    setLoading(true);

    const userMsg: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/ai-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, question }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMsg: Message = {
        role: "assistant",
        content: data.answer,
        sources: data.sources,
        confidence: data.confidence,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err.message);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error processing your request. Please ensure the Groq API key is configured.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <AppShell>
      <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Business Advisor</h1>
          <p className="text-sm text-muted-foreground">Ask evidence-backed questions about the client</p>
        </div>

        {messages.length === 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {suggestedQuestions.map((q, i) => (
              <Button
                key={i}
                variant="outline"
                className="h-auto py-3 px-4 text-left justify-start text-sm whitespace-normal"
                onClick={() => sendMessage(q)}
              >
                {q}
              </Button>
            ))}
          </div>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-background" />
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.role === "user" ? "order-1" : ""}`}>
                  <Card className={msg.role === "user" ? "bg-foreground text-background" : ""}>
                    <CardContent className="p-3">
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                          <p className="text-xs font-medium flex items-center gap-1">
                            <FileText className="h-3 w-3" /> Sources
                          </p>
                          {msg.sources.map((s, j) => (
                            <div key={j} className="text-xs text-muted-foreground">
                              <span className="font-medium">{s.title}</span>
                              <p className="italic mt-0.5">&ldquo;{s.excerpt}&rdquo;</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.confidence && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-[10px]">
                            AI Confidence: {msg.confidence}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 order-2">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-background animate-pulse" />
              </div>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing evidence and formulating response...
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the client..."
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
