"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Search, Building2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/layout/app-shell";

interface Client {
  id: string;
  name: string;
  industry: string;
  companySize: string;
  revenueRange: string;
  status: string;
  businessHealth: number | null;
  dataCompleteness: number | null;
  _count: { documents: number; findings: number; risks: number; recommendations: number };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", industry: "", companySize: "", revenueRange: "" });

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => { setClients(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      const newClient = await res.json();
      setClients([newClient, ...clients]);
      setShowForm(false);
      setFormData({ name: "", industry: "", companySize: "", revenueRange: "" });
    }
  }

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
            <p className="text-sm text-muted-foreground">Manage client engagements and assessments</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" /> New Client
          </Button>
        </div>

        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-6 rounded-xl border bg-card"
            onSubmit={handleCreate}
          >
            <h3 className="font-semibold mb-4">Create New Client</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Company Name</label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Acme Corp" required />
              </div>
              <div>
                <label className="text-sm font-medium">Industry</label>
                <Input value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} placeholder="B2B SaaS" required />
              </div>
              <div>
                <label className="text-sm font-medium">Company Size</label>
                <Input value={formData.companySize} onChange={(e) => setFormData({ ...formData, companySize: e.target.value })} placeholder="50-200 employees" required />
              </div>
              <div>
                <label className="text-sm font-medium">Revenue Range</label>
                <Input value={formData.revenueRange} onChange={(e) => setFormData({ ...formData, revenueRange: e.target.value })} placeholder="$5M – $15M" required />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="submit">Create Client</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </motion.form>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold">No clients found</h3>
            <p className="text-sm text-muted-foreground mt-1">Create your first client to begin</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((client) => (
              <Link key={client.id} href={`/clients/${client.id}`}>
                <Card className="hover:border-foreground transition-colors cursor-pointer h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{client.name}</h3>
                        <p className="text-sm text-muted-foreground">{client.industry}</p>
                      </div>
                      <Badge variant="outline">{client.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                      <div>{client.companySize}</div>
                      <div>{client.revenueRange}</div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex gap-3">
                        <span>{client._count.documents} docs</span>
                        <span>{client._count.findings} findings</span>
                        <span>{client._count.risks} risks</span>
                      </div>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                    {client.businessHealth !== null && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Business Health</span>
                          <span>{client.businessHealth}/100</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-foreground"
                            style={{ width: `${client.businessHealth}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
