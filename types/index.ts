export interface BusinessImpact {
  type: string;
  estimateLow: number;
  estimateHigh: number;
  currency: string;
  assumptions: string[];
}

export interface HumanIntervention {
  required: boolean;
  level: string;
  reason: string;
}

export interface FindingData {
  title: string;
  domain: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidence: number;
  summary: string;
  evidence: EvidenceData[];
  rootCauseHypotheses: string[];
  contradictingEvidence: string[];
  businessImpact: BusinessImpact;
  humanIntervention: HumanIntervention;
}

export interface EvidenceData {
  type: "SUPPORTING" | "CONTRADICTING" | "MISSING";
  source: string;
  excerpt: string;
  relevance: number;
}

export interface RiskData {
  title: string;
  category: string;
  probability: "LOW" | "MEDIUM" | "HIGH";
  impact: "LOW" | "MEDIUM" | "HIGH";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidence: number;
  description: string;
  mitigation: string;
  humanReviewRequired: boolean;
}

export interface RecommendationData {
  title: string;
  rationale: string;
  expectedImpact: string;
  implementationEffort: "LOW" | "MEDIUM" | "HIGH";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidence: number;
  risk: string;
  owner: string;
  timeHorizon: string;
  humanApprovalRequired: boolean;
}

export interface ActionItemData {
  action: string;
  owner: string;
  deadline: string;
  priority: string;
  expectedImpact: string;
  dependencies: string[];
  status: string;
}

export interface AnalysisStage {
  name: string;
  description: string;
  progress: number;
}

export interface DataQualityScore {
  overall: number;
  completeness: number;
  recency: number;
  consistency: number;
  sourceDiversity: number;
  reliability: number;
  warnings: string[];
}

export interface AIAdvisorMessage {
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; excerpt: string }[];
}
