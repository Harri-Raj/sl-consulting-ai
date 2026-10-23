import { prisma } from "@/lib/db";

export async function generateReportData(clientId: string) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      findings: { include: { evidence: { include: { document: true } } }, orderBy: { createdAt: "desc" } },
      risks: { orderBy: { severity: "desc" } },
      recommendations: { orderBy: { priority: "desc" } },
      decisions: { orderBy: { createdAt: "desc" } },
      actionPlans: { include: { actionItems: true } },
      documents: true,
      auditLogs: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  if (!client) throw new Error("Client not found");

  const domainHealth = calculateDomainHealth(client.findings);
  const criticalRisks = client.risks.filter((r) => r.severity === "CRITICAL").length;
  const highFindings = client.findings.filter((f) => f.severity === "HIGH" || f.severity === "CRITICAL").length;
  const pendingDecisions = client.decisions.filter((d) => d.status === "PENDING").length;

  return {
    client,
    domainHealth,
    criticalRisks,
    highFindings,
    pendingDecisions,
    generatedAt: new Date().toISOString(),
  };
}

function calculateDomainHealth(findings: { domain: string; severity: string; confidence: number }[]) {
  const domains = ["FINANCIAL", "OPERATIONS", "PEOPLE", "CUSTOMER", "MARKETING", "STRATEGY"];
  const health: Record<string, number> = {};

  for (const domain of domains) {
    const domainFindings = findings.filter((f) => f.domain === domain);
    if (domainFindings.length === 0) {
      health[domain] = 75;
      continue;
    }

    const severityWeights: Record<string, number> = { LOW: 5, MEDIUM: 15, HIGH: 30, CRITICAL: 50 };
    let deduction = 0;
    for (const f of domainFindings) {
      deduction += (severityWeights[f.severity] || 0) * f.confidence;
    }
    health[domain] = Math.max(0, Math.round(100 - deduction));
  }

  return health;
}
