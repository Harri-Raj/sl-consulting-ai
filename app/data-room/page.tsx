"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Upload, FileText, Trash2, Search, Filter, FileSpreadsheet,
  FileType2, Loader2, AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppShell } from "@/components/layout/app-shell";

interface Document {
  id: string;
  originalName: string;
  documentType: string;
  size: number;
  processingStatus: string;
  analysisStatus: string;
  sourceReliability: string;
  createdAt: string;
}

export default function DataRoomPage() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId") || "demo-northstar";
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState("");

  const fetchDocs = useCallback(async () => {
    const res = await fetch(`/api/documents?clientId=${clientId}`);
    const data = await res.json();
    setDocuments(data);
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("clientId", clientId);
    formData.append("file", file);

    try {
      const res = await fetch("/api/documents", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      await fetchDocs();
    } catch {
      setError("Failed to upload document");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    setDocuments(documents.filter((d) => d.id !== id));
  }

  const filtered = documents.filter((d) => {
    const matchesSearch = d.originalName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || d.documentType === filter;
    return matchesSearch && matchesFilter;
  });

  const docTypes = [...new Set(documents.map((d) => d.documentType))];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Data Room</h1>
            <p className="text-sm text-muted-foreground">Upload and manage business documents</p>
          </div>
          <div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.docx,.txt,.csv,.xlsx"
              onChange={handleUpload}
            />
            <label htmlFor="file-upload">
              <Button disabled={uploading} asChild>
                <span>
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Upload Document
                </span>
              </Button>
            </label>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button variant={filter === "ALL" ? "default" : "outline"} size="sm" onClick={() => setFilter("ALL")}>All</Button>
            {docTypes.map((type) => (
              <Button key={type} variant={filter === type ? "default" : "outline"} size="sm" onClick={() => setFilter(type)}>
                {type}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg border bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold">No documents</h3>
            <p className="text-sm text-muted-foreground mt-1">Upload business data to begin analysis</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((doc) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-4 p-4 rounded-lg border hover:border-foreground transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <FileType2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.originalName}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px]">{doc.documentType}</Badge>
                    <span>{(doc.size / 1024).toFixed(1)} KB</span>
                    <span>·</span>
                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={doc.processingStatus} />
                  <ReliabilityBadge reliability={doc.sourceReliability} />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(doc.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    COMPLETE: "bg-emerald-100 text-emerald-700",
    PROCESSING: "bg-amber-100 text-amber-700",
    PENDING: "bg-gray-100 text-gray-700",
    FAILED: "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[status] || colors.PENDING}`}>
      {status}
    </span>
  );
}

function ReliabilityBadge({ reliability }: { reliability: string }) {
  const colors: Record<string, string> = {
    HIGH: "border-emerald-200 text-emerald-700",
    MEDIUM: "border-amber-200 text-amber-700",
    LOW: "border-red-200 text-red-700",
  };
  return (
    <Badge variant="outline" className={`text-[10px] ${colors[reliability] || colors.MEDIUM}`}>
      {reliability}
    </Badge>
  );
}
