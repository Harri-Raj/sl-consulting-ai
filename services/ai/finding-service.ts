import { z } from "zod";
import { groqChatCompletion, isGroqConfigured } from "./groq-service";
import { challengeFindingSystemPrompt } from "./prompts";
import { prisma } from "@/lib/db";

const ChallengeResultSchema = z.object({
  originalConfidence: z.number(),
  revisedConfidence: z.number(),
  confidenceChangeReason: z.string(),
  supportingEvidenceStrength: z.enum(["WEAK", "MODERATE", "STRONG"]),
  alternativeExplanations: z.array(z.string()),
  assumptionsChallenged: z.array(z.string()),
  missingInformation: z.array(z.string()),
  recommendation: z.string(),
});

export async function challengeFinding(findingId: string) {
  if (!isGroqConfigured()) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const finding = await prisma.finding.findUnique({
    where: { id: findingId },
    include: { evidence: { include: { document: true } }, client: { include: { documents: true } } },
  });

  if (!finding) throw new Error("Finding not found");

  const evidenceText = finding.evidence
    .map((e) => `[${e.type}] ${e.source}:
${e.excerpt}`)
    .join("

");

  const context = `FINDING: ${finding.title}
Domain: ${finding.domain}
Severity: ${finding.severity}
Confidence: ${finding.confidence}
Summary: ${finding.summary}

EVIDENCE:
${evidenceText}

ROOT CAUSE HYPOTHESES:
${JSON.parse(finding.rootCauseHypotheses || "[]").join("
")}

CONTRADICTING EVIDENCE:
${JSON.parse(finding.contradictingEvidence || "[]").join("
")}`;

  const response = await groqChatCompletion(
    [
      { role: "system", content: challengeFindingSystemPrompt },
      { role: "user", content: `Challenge the following finding critically:

${context}` },
    ],
    { temperature: 0.3, maxTokens: 3000, jsonMode: true }
  );

  let parsed: unknown;
  try {
    parsed = JSON.parse(response);
  } catch {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Failed to parse challenge response");
    }
  }

  const validated = ChallengeResultSchema.parse(parsed);

  await prisma.finding.update({
    where: { id: findingId },
    data: {
      challenged: true,
      challengeResult: JSON.stringify(validated),
    },
  });

  await prisma.auditLog.create({
    data: {
      clientId: finding.clientId,
      action: "FINDING_CHALLENGED",
      entityType: "Finding",
      entityId: findingId,
      details: JSON.stringify({
        originalConfidence: validated.originalConfidence,
        revisedConfidence: validated.revisedConfidence,
      }),
    },
  });

  return validated;
}
