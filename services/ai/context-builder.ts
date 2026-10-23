import { prisma } from "@/lib/db";

export async function buildClientContext(clientId: string) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      assessments: true,
      documents: {
        where: { processingStatus: "COMPLETE" },
        select: {
          id: true,
          originalName: true,
          documentType: true,
          extractedText: true,
          sourceReliability: true,
        },
      },
      findings: {
        include: { evidence: { include: { document: true } } },
      },
      risks: true,
      recommendations: true,
      actionPlans: { include: { actionItems: true } },
    },
  });

  if (!client) throw new Error("Client not found");

  const documentsContext = client.documents
    .map((d) => `[${d.documentType}] ${d.originalName} (Reliability: ${d.sourceReliability}):\n${d.extractedText?.slice(0, 3000) || "No extracted text"}`)
    .join("\n\n---\n\n");

  const findingsContext = client.findings
    .map((f) => `FINDING: ${f.title}\nDomain: ${f.domain}\nSeverity: ${f.severity}\nConfidence: ${f.confidence}\nSummary: ${f.summary}`)
    .join("\n\n---\n\n");

  const risksContext = client.risks
    .map((r) => `RISK: ${r.title}\nCategory: ${r.category}\nSeverity: ${r.severity}\nProbability: ${r.probability}\nImpact: ${r.impact}\nDescription: ${r.description}`)
    .join("\n\n---\n\n");

  const recommendationsContext = client.recommendations
    .map((r) => `RECOMMENDATION: ${r.title}\nPriority: ${r.priority}\nImpact: ${r.expectedImpact}\nEffort: ${r.implementationEffort}\nRationale: ${r.rationale}`)
    .join("\n\n---\n\n");

  const assessment = client.assessments[0];

  return {
    clientProfile: `Company: ${client.name}\nIndustry: ${client.industry}\nSize: ${client.companySize}\nRevenue: ${client.revenueRange}\nEmployees: ${client.employeeCount}\nObjective: ${client.engagementObjective}\nChallenge: ${client.primaryChallenge}`,
    assessmentContext: assessment
      ? `Objectives: ${assessment.objectives || "N/A"}\nChallenges: ${assessment.challenges || "N/A"}\nStakeholders: ${assessment.stakeholders || "N/A"}`
      : "No assessment data",
    documentsContext,
    findingsContext,
    risksContext,
    recommendationsContext,
    fullContext: ``,
  };
}

export function preparePromptContext(context: Awaited<ReturnType<typeof buildClientContext>>, maxLength = 12000) {
  const parts = [
    `CLIENT PROFILE:\n${context.clientProfile}`,
    `ASSESSMENT:\n${context.assessmentContext}`,
    `DOCUMENTS:\n${context.documentsContext}`,
    `FINDINGS:\n${context.findingsContext}`,
    `RISKS:\n${context.risksContext}`,
    `RECOMMENDATIONS:\n${context.recommendationsContext}`,
  ];

  let fullText = parts.join("\n\n===\n\n");
  if (fullText.length > maxLength) {
    fullText = fullText.slice(0, maxLength) + "\n\n[Additional context truncated for length]";
  }
  return fullText;
}