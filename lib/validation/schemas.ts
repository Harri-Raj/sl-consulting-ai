import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const clientSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  companySize: z.string().min(1, "Company size is required"),
  revenueRange: z.string().min(1, "Revenue range is required"),
  employeeCount: z.number().optional(),
  engagementObjective: z.string().optional(),
  primaryChallenge: z.string().optional(),
  assessmentPeriod: z.string().optional(),
  stakeholders: z.string().optional(),
  consultantNotes: z.string().optional(),
});

export const assessmentStepSchema = z.object({
  clientId: z.string(),
  step: z.number().min(1).max(6),
  objectives: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional(),
  stakeholders: z.array(z.string()).optional(),
});

export const decisionSchema = z.object({
  clientId: z.string(),
  recommendationId: z.string().optional(),
  type: z.enum(["APPROVE", "MODIFY", "REJECT", "REQUEST_EVIDENCE", "ASSIGN_OWNER", "CLIENT_DISCUSSION"]),
  title: z.string(),
  description: z.string().optional(),
  assignedOwner: z.string().optional(),
  targetDate: z.string().optional(),
});

export const actionItemSchema = z.object({
  actionPlanId: z.string(),
  action: z.string(),
  owner: z.string().optional(),
  deadline: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  expectedImpact: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
});

export const aiAdvisorQuerySchema = z.object({
  clientId: z.string(),
  question: z.string().min(1, "Question is required"),
});
