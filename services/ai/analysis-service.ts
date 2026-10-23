import { z } from "zod";
import { groqChatCompletion, isGroqConfigured } from "./groq-service";
import { businessAnalysisSystemPrompt } from "./prompts";
import { buildClientContext, preparePromptContext } from "./context-builder";
import { prisma } from "@/lib/db";
import type { DataQualityScore } from "@/types";

const EvidenceSchema = z.object({
  type: z.enum(["SUPPORTING", "CONTRADICTING", "MISSING"]),
  source: z.string(),
  excerpt: z.string(),
  relevance: z.number().min(0).max(1),
});

const BusinessImpactSchema = z.object({
  type: z.string(),
  estimateLow: z.number(),
  estimateHigh: z.number(),
  currency: z.string(),
  assumptions: z.array(z.string()),
});

const HumanInterventionSchema = z.object({
  required: z.boolean(),
  level: z.enum(["AI_CAN_PROCEED", "CONSULTANT_REVIEW", "EXECUTIVE_DECISION", "SPECIALIST_REVIEW", "CRITICAL_HUMAN_DECISION"]),
  reason: z.string(),
});

const FindingSchema = z.object({
  title: z.string(),
  domain: z.enum(["FINANCIAL", "OPERATIONS", "PEOPLE", "CUSTOMER", "MARKETING", "STRATEGY", "RISK"]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  confidence: z.number().min(0).max(1),
  summary: z.string(),
  evidence: z.array(EvidenceSchema),
  rootCauseHypotheses: z.array(z.string()),
  contradictingEvidence: z.array(z.string()),
  businessImpact: BusinessImpactSchema,
  humanIntervention: HumanInterventionSchema,
});

const RiskSchema = z.object({
  title: z.string(),
  category: z.enum(["FINANCIAL", "OPERATIONAL", "PEOPLE", "CUSTOMER", "STRATEGIC", "REGULATORY", "CONTRACTUAL"]),
  probability: z.enum(["LOW", "MEDIUM", "HIGH"]),
  impact: z.enum(["LOW", "MEDIUM", "HIGH"]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  confidence: z.number().min(0).max(1),
  description: z.string(),
  mitigation: z.string(),
  humanReviewRequired: z.boolean(),
});

const RecommendationSchema = z.object({
  title: z.string(),
  rationale: z.string(),
  expectedImpact: z.string(),
  implementationEffort: z.enum(["LOW", "MEDIUM", "HIGH"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  confidence: z.number().min(0).max(1),
  risk: z.string(),
  owner: z.string(),
  timeHorizon: z.string(),
  humanApprovalRequired: z.boolean(),
});

const DataQualitySchema = z.object({
  overall: z.number().min(0).max(100),
  completeness: z.number().min(0).max(100),
  recency: z.number().min(0).max(100),
  consistency: z.number().min(0).max(100),
  sourceDiversity: z.number().min(0).max(100),
  reliability: z.number().min(0).max(100),
  warnings: z.array(z.string()),
});

const AnalysisResultSchema = z.object({
  findings: z.array(FindingSchema),
  risks: z.array(RiskSchema),
  recommendations: z.array(RecommendationSchema),
  dataQuality: DataQualitySchema,
});

export async function runBusinessAnalysis(clientId: string) {
  if (!isGroqConfigured()) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const analysis = await prisma.aIAnalysis.create({
    data: {
      clientId,
      status: "RUNNING",
      stage: "PREPARING_CONTEXT",
      progress: 10,
    },
  });

  try {
    await prisma.aIAnalysis.update({
      where: { id: analysis.id },
      data: { stage: "ANALYZING_DOCUMENTS", progress: 25 },
    });

    const context = await buildClientContext(clientId);
    const promptContext = preparePromptContext(context);

    await prisma.aIAnalysis.update({
      where: { id: analysis.id },
      data: { stage: "IDENTIFYING_PATTERNS", progress: 40 },
    });

    const response = await groqChatCompletion(
      [
        { role: "system", content: businessAnalysisSystemPrompt },
        { role: "user", content: `Analyze the following business context and return structured findings, risks, recommendations, and data quality assessment:

${promptContext}` },
      ],
      { temperature: 0.2, maxTokens: 4000, jsonMode: true }
    );

    await prisma.aIAnalysis.update({
      where: { id: analysis.id },
      data: { stage: "CROSS_REFERENCING", progress: 60 },
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(response);
    } catch {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    const validated = AnalysisResultSchema.parse(parsed);

    await prisma.aIAnalysis.update({
      where: { id: analysis.id },
      data: { stage: "EVALUATING_RISKS", progress: 75 },
    });

    // Store findings
    for (const finding of validated.findings) {
      const createdFinding = await prisma.finding.create({
        data: {
          clientId,
          title: finding.title,
          domain: finding.domain,
          severity: finding.severity,
          confidence: finding.confidence,
          summary: finding.summary,
          rootCauseHypotheses: JSON.stringify(finding.rootCauseHypotheses),
          contradictingEvidence: JSON.stringify(finding.contradictingEvidence),
          businessImpact: JSON.stringify(finding.businessImpact),
          humanIntervention: JSON.stringify(finding.humanIntervention),
          status: "ACTIVE",
        },
      });

      for (const ev of finding.evidence) {
        await prisma.evidence.create({
          data: {
            findingId: createdFinding.id,
            type: ev.type,
            source: ev.source,
            excerpt: ev.excerpt,
            relevance: ev.relevance,
          },
        });
      }
    }

    // Store risks
    for (const risk of validated.risks) {
      await prisma.risk.create({
        data: {
          clientId,
          title: risk.title,
          category: risk.category,
          probability: risk.probability,
          impact: risk.impact,
          severity: risk.severity,
          confidence: risk.confidence,
          description: risk.description,
          mitigation: risk.mitigation,
          humanReviewRequired: risk.humanReviewRequired,
          status: "OPEN",
        },
      });
    }

    // Store recommendations
    for (const rec of validated.recommendations) {
      await prisma.recommendation.create({
        data: {
          clientId,
          title: rec.title,
          rationale: rec.rationale,
          expectedImpact: rec.expectedImpact,
          implementationEffort: rec.implementationEffort,
          priority: rec.priority,
          confidence: rec.confidence,
          risk: rec.risk,
          owner: rec.owner,
          timeHorizon: rec.timeHorizon,
          humanApprovalRequired: rec.humanApprovalRequired,
          status: "PENDING",
          consultantDecision: "PENDING",
        },
      });
    }

    await prisma.aIAnalysis.update({
      where: { id: analysis.id },
      data: {
        status: "COMPLETE",
        stage: "COMPLETE",
        progress: 100,
        results: JSON.stringify(validated.dataQuality),
        completedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        clientId,
        action: "AI_ANALYSIS_COMPLETED",
        entityType: "AIAnalysis",
        entityId: analysis.id,
        details: JSON.stringify({
          findings: validated.findings.length,
          risks: validated.risks.length,
          recommendations: validated.recommendations.length,
        }),
      },
    });

    return { success: true, analysisId: analysis.id, dataQuality: validated.dataQuality };
  } catch (error) {
    await prisma.aIAnalysis.update({
      where: { id: analysis.id },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}

export async function calculateDataQuality(clientId: string): Promise<DataQualityScore> {
  const documents = await prisma.document.findMany({
    where: { clientId },
  });

  const findings = await prisma.finding.findMany({
    where: { clientId },
  });

  const totalDocs = documents.length;
  if (totalDocs === 0) {
    return {
      overall: 0,
      completeness: 0,
      recency: 0,
      consistency: 0,
      sourceDiversity: 0,
      reliability: 0,
      warnings: ["No documents uploaded. Upload business data to begin analysis."],
    };
  }

  const processedDocs = documents.filter((d) => d.processingStatus === "COMPLETE").length;
  const completeness = Math.round((processedDocs / totalDocs) * 100);

  const docTypes = new Set(documents.map((d) => d.documentType));
  const sourceDiversity = Math.min(100, docTypes.size * 20);

  const highReliability = documents.filter((d) => d.sourceReliability === "HIGH").length;
  const reliability = Math.round((highReliability / totalDocs) * 100);

  const consistency = findings.length > 0 ? Math.round(85 - findings.filter((f) => f.confidence < 0.7).length * 5) : 70;

  const recency = 75; // Placeholder based on upload dates

  const overall = Math.round((completeness + recency + consistency + sourceDiversity + reliability) / 5);

  const warnings: string[] = [];
  if (completeness < 80) warnings.push("Some documents are still processing or incomplete.");
  if (sourceDiversity < 60) warnings.push("Limited document types reduce analysis breadth.");
  if (reliability < 70) warnings.push("Several documents have medium or low reliability ratings.");
  if (!documents.some((d) => d.documentType === "FINANCIAL")) {
    warnings.push("Financial data is missing. Profitability conclusions should be treated as preliminary.");
  }

  return {
    overall,
    completeness,
    recency,
    consistency,
    sourceDiversity,
    reliability,
    warnings,
  };
}
