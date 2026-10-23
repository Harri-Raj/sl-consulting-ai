const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // 1. Create user
  const hashedPassword = await bcrypt.hash("demo123", 12);
  const user = await prisma.user.upsert({
    where: { email: "consultant@slconsulting.demo" },
    update: {},
    create: {
      id: "user-demo",
      email: "consultant@slconsulting.demo",
      name: "Demo Consultant",
      password: hashedPassword,
      role: "CONSULTANT",
    },
  });
  console.log("User created:", user.email);

  // 2. Create client
  const client = await prisma.client.upsert({
    where: { id: "demo-northstar" },
    update: {},
    create: {
      id: "demo-northstar",
      name: "Northstar Systems",
      industry: "B2B SaaS",
      companySize: "50-200 employees",
      revenueRange: "$5M – $15M",
      employeeCount: 127,
      engagementObjective: "Improve operational efficiency and reduce employee attrition",
      primaryChallenge: "High engineering turnover and delivery instability affecting customer retention",
      assessmentPeriod: "Q3 2024 – Q4 2024",
      stakeholders: JSON.stringify([
        "Sarah Chen – CTO",
        "Marcus Webb – VP Engineering",
        "Diana Ross – CFO",
        "James Park – VP Sales",
        "Alicia Torres – VP Customer Success",
      ]),
      consultantNotes: "Northstar has experienced rapid growth but operational maturity has not kept pace. Engineering team reports burnout. Customer churn has increased 18% over the last two quarters.",
      status: "ACTIVE",
      businessHealth: 62,
      dataCompleteness: 78,
      userId: user.id,
    },
  });
  console.log("Client created:", client.name);

  // 3. Create assessment
  await prisma.assessment.upsert({
    where: { id: "demo-assessment" },
    update: {},
    create: {
      id: "demo-assessment",
      clientId: client.id,
      objectives: JSON.stringify([
        "Reduce engineering attrition from 28% to under 15%",
        "Improve on-time delivery from 64% to 90%",
        "Reduce customer churn from 18% to under 10%",
        "Identify $500K+ in operational cost savings",
      ]),
      challenges: JSON.stringify([
        "Excessive on-call load without rotation",
        "No clear technical career progression",
        "Product roadmap changes every 2-3 weeks",
        "Customer onboarding takes 45+ days",
        "Sales promises features not on roadmap",
      ]),
      stakeholders: JSON.stringify([
        "Sarah Chen – CTO",
        "Marcus Webb – VP Engineering",
        "Diana Ross – CFO",
        "James Park – VP Sales",
      ]),
      status: "COMPLETE",
      step: 6,
    },
  });
  console.log("Assessment created");

  // 4. Create documents
  const docs = [
    {
      id: "doc-financial-q3",
      clientId: client.id,
      filename: "northstar_financial_q3_2024.pdf",
      originalName: "Northstar Financial Q3 2024.pdf",
      mimeType: "application/pdf",
      size: 245000,
      extractedText: `NORTHSTAR SYSTEMS – FINANCIAL PERFORMANCE Q3 2024\n\nRevenue: $3.2M (up 8% YoY)\nGross Margin: 72% (down from 78% in Q2)\nOperating Margin: 12% (down from 19% in Q2)\nBurn Rate: $380K/month\nRunway: 14 months\n\nKey Observations:\n- Customer acquisition cost increased 34% to $4,200 per new logo\n- Expansion revenue declined 22%\n- Professional services costs ballooned to $180K due to onboarding delays\n- Engineering overtime costs: $95K in Q3 alone`,
      processingStatus: "COMPLETE",
      analysisStatus: "ANALYZED",
      sourceReliability: "HIGH",
      documentType: "FINANCIAL",
    },
    {
      id: "doc-eng-survey",
      clientId: client.id,
      filename: "engineering_pulse_survey_oct2024.txt",
      originalName: "Engineering Pulse Survey – October 2024.txt",
      mimeType: "text/plain",
      size: 45000,
      extractedText: `ENGINEERING PULSE SURVEY – OCTOBER 2024\n\nResponse Rate: 89% (113 of 127 engineers)\n\nSatisfaction Scores (1-10):\n- Overall satisfaction: 4.2 (down from 5.8 in Jan)\n- Work-life balance: 3.1\n- Career growth clarity: 2.8\n- Management support: 3.9\n- Compensation fairness: 4.5\n\nKey Themes:\n"I am on-call every other week and it's burning me out."\n"There is no technical career path. Either you become a manager or you stall."\n"The roadmap changes so often that nothing ever ships."\n"We keep accumulating tech debt but never get time to fix it."\n\nAttrition Risk: 34% of respondents indicated they are actively looking`,
      processingStatus: "COMPLETE",
      analysisStatus: "ANALYZED",
      sourceReliability: "HIGH",
      documentType: "SURVEY",
    },
    {
      id: "doc-customer-feedback",
      clientId: client.id,
      filename: "customer_feedback_q3_2024.csv",
      originalName: "Customer Feedback Q3 2024.csv",
      mimeType: "text/csv",
      size: 32000,
      extractedText: `CUSTOMER FEEDBACK ANALYSIS – Q3 2024\n\nNPS Score: 32 (down from 48 in Q1)\n\nTop Complaints:\n1. Onboarding takes too long (mentioned by 42% of detractors)\n2. Product bugs not fixed for weeks (38%)\n3. Account manager turnover (27%)\n4. Feature requests ignored (23%)\n5. Pricing not transparent (19%)\n\nChurn Reasons (exit interviews):\n- Switched to competitor: 34%\n- Product stability concerns: 28%\n- Lack of promised features: 22%\n- Pricing: 16%\n\nAt-Risk Accounts: 12 customers representing $890K ARR`,
      processingStatus: "COMPLETE",
      analysisStatus: "ANALYZED",
      sourceReliability: "MEDIUM",
      documentType: "SURVEY",
    },
    {
      id: "doc-sales-pipeline",
      clientId: client.id,
      filename: "sales_pipeline_review_oct2024.docx",
      originalName: "Sales Pipeline Review – October 2024.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size: 67000,
      extractedText: `SALES PIPELINE REVIEW – OCTOBER 2024\n\nPipeline Value: $4.8M\nWin Rate: 22% (down from 31% in Q2)\nAverage Deal Size: $45K\nSales Cycle: 87 days (up from 62 days)\n\nKey Issues:\n- Engineering unable to commit to delivery dates\n- 6 deals stalled waiting for custom features\n- 3 enterprise deals lost to competitor with better onboarding\n- Sales team promising features not on roadmap\n\nJames Park (VP Sales): "We are losing deals because we cannot commit to timelines. Engineering says everything is possible but nothing ships on time."`,
      processingStatus: "COMPLETE",
      analysisStatus: "ANALYZED",
      sourceReliability: "HIGH",
      documentType: "STRATEGIC",
    },
    {
      id: "doc-ops-review",
      clientId: client.id,
      filename: "operations_review_sept2024.txt",
      originalName: "Operations Review – September 2024.txt",
      mimeType: "text/plain",
      size: 28000,
      extractedText: `OPERATIONS REVIEW – SEPTEMBER 2024\n\nOn-Time Delivery: 64% (target: 90%)\nSprint Completion Rate: 58%\nBug Backlog: 340 open issues (up from 180 in June)\nMean Time to Resolution: 14 days (up from 6 days)\n\nInfrastructure:\n- 3 critical outages in Q3 (total downtime: 8.2 hours)\n- No disaster recovery test conducted in 2024\n- Technical debt estimated at 4-6 sprints of work\n\nProcess Issues:\n- No clear definition of done\n- Code review backlog: average 3.2 days\n- No automated testing for legacy modules\n- Release process is manual and error-prone`,
      processingStatus: "COMPLETE",
      analysisStatus: "ANALYZED",
      sourceReliability: "HIGH",
      documentType: "OPERATIONAL",
    },
  ];

  for (const doc of docs) {
    await prisma.document.upsert({ where: { id: doc.id }, update: {}, create: doc });
  }
  console.log("5 documents created");

  // 5. Create findings
  const findings = [
    {
      id: "finding-1",
      clientId: client.id,
      title: "Engineering delivery instability is creating downstream commercial risk",
      domain: "OPERATIONS",
      severity: "HIGH",
      confidence: 0.91,
      summary: "On-time delivery has fallen to 64%, sprint completion is 58%, and the bug backlog has nearly doubled. Three critical outages in Q3 caused 8.2 hours of downtime. Technical debt is estimated at 4-6 sprints of work with no allocated capacity to address it.",
      rootCauseHypotheses: JSON.stringify([
        "Excessive on-call load causing burnout and reduced capacity",
        "No clear definition of done leading to scope creep",
        "Frequent roadmap changes destabilizing sprint commitments",
        "Manual release process introducing errors and delays",
      ]),
      contradictingEvidence: JSON.stringify([
        "Engineering headcount increased 15% in 2024",
        "Some teams report improved velocity after recent reorganization",
      ]),
      businessImpact: JSON.stringify({
        type: "Revenue at risk + operational cost increase",
        estimateLow: 420000,
        estimateHigh: 580000,
        currency: "USD",
        assumptions: [
          "12 at-risk accounts representing $890K ARR",
          "Professional services costs of $180K/quarter due to onboarding delays",
          "Engineering overtime costs of $95K/quarter",
        ],
      }),
      humanIntervention: JSON.stringify({
        required: true,
        level: "CONSULTANT_REVIEW",
        reason: "Delivery issues have cross-functional implications affecting sales, customer success, and financial performance. Consultant should validate root cause hypotheses with engineering leadership before recommending structural changes.",
      }),
      status: "ACTIVE",
    },
    {
      id: "finding-2",
      clientId: client.id,
      title: "Employee attrition risk is critically high in engineering",
      domain: "PEOPLE",
      severity: "CRITICAL",
      confidence: 0.87,
      summary: "Engineering satisfaction has dropped to 4.2/10. Work-life balance scores at 3.1 and career growth clarity at 2.8 are severe red flags. 34% of engineers are actively looking for new roles. Attrition is already at 28% annualized.",
      rootCauseHypotheses: JSON.stringify([
        "Excessive on-call rotation without adequate compensation or recovery time",
        "Absence of technical career progression path (IC track)",
        "Compensation potentially below market for senior engineers",
        "Burnout from constant context switching due to roadmap instability",
      ]),
      contradictingEvidence: JSON.stringify([
        "Compensation fairness score of 4.5 suggests pay is not the primary driver",
        "Some teams report strong camaraderie and mission alignment",
      ]),
      businessImpact: JSON.stringify({
        type: "Cost of attrition + knowledge loss",
        estimateLow: 380000,
        estimateHigh: 520000,
        currency: "USD",
        assumptions: [
          "Replacement cost of 1.5x salary per departed engineer",
          "Average engineering salary of $145K",
          "Estimated 15-20 departures in next 12 months if trend continues",
          "Productivity loss during onboarding of 6 months",
        ],
      }),
      humanIntervention: JSON.stringify({
        required: true,
        level: "EXECUTIVE_DECISION",
        reason: "People decisions involving compensation, career path restructuring, and workload redistribution require executive alignment and potentially board approval for budget changes.",
      }),
      status: "ACTIVE",
    },
    {
      id: "finding-3",
      clientId: client.id,
      title: "Customer churn acceleration signals product-market fit erosion",
      domain: "CUSTOMER",
      severity: "HIGH",
      confidence: 0.84,
      summary: "NPS has fallen from 48 to 32. Churn increased 18% over two quarters. 42% of detractors cite onboarding delays. 38% cite unresolved product bugs. 12 at-risk accounts represent $890K ARR.",
      rootCauseHypotheses: JSON.stringify([
        "Onboarding taking 45+ days due to product complexity and missing self-service features",
        "Bug backlog growth reducing product reliability perception",
        "Sales overpromising features creating expectation gaps",
        "Account manager turnover disrupting relationship continuity",
      ]),
      contradictingEvidence: JSON.stringify([
        "Expansion revenue decline may be cyclical rather than structural",
        "Net revenue retention still above 100% at 104%",
      ]),
      businessImpact: JSON.stringify({
        type: "Revenue leakage + growth impediment",
        estimateLow: 650000,
        estimateHigh: 950000,
        currency: "USD",
        assumptions: [
          "$890K ARR at risk from 12 flagged accounts",
          "CAC increased 34% to $4,200 per new logo",
          "Sales cycle lengthened from 62 to 87 days",
        ],
      }),
      humanIntervention: JSON.stringify({
        required: true,
        level: "CONSULTANT_REVIEW",
        reason: "Customer churn analysis requires validation against actual customer interviews and competitive intelligence to distinguish between execution issues and strategic positioning problems.",
      }),
      status: "ACTIVE",
    },
    {
      id: "finding-4",
      clientId: client.id,
      title: "Sales-engineering misalignment is compounding pipeline risk",
      domain: "STRATEGY",
      severity: "MEDIUM",
      confidence: 0.79,
      summary: "Win rate fell from 31% to 22%. Sales cycle increased from 62 to 87 days. 6 deals are stalled waiting for custom features. Sales team is promising features not on the engineering roadmap, creating a credibility gap with prospects.",
      rootCauseHypotheses: JSON.stringify([
        "No formal product-committee gate between sales promises and engineering capacity",
        "Competitive pressure forcing sales to overcommit",
        "Lack of visibility into engineering roadmap for sales team",
        "Custom feature requests not being triaged against strategic priorities",
      ]),
      contradictingEvidence: JSON.stringify([
        "Some custom features have led to major account expansions",
        "Sales team reports strong product-market fit in mid-market segment",
      ]),
      businessImpact: JSON.stringify({
        type: "Revenue opportunity cost",
        estimateLow: 200000,
        estimateHigh: 400000,
        currency: "USD",
        assumptions: [
          "6 stalled deals with average value of $45K",
          "3 lost enterprise deals estimated at $150K each",
          "Pipeline velocity reduction affecting quarterly forecasting",
        ],
      }),
      humanIntervention: JSON.stringify({
        required: true,
        level: "SPECIALIST_REVIEW",
        reason: "Sales process and product strategy alignment requires input from both sales operations and product strategy specialists. May require restructuring of the product-committee process.",
      }),
      status: "ACTIVE",
    },
  ];

  for (const f of findings) {
    await prisma.finding.upsert({ where: { id: f.id }, update: {}, create: f });
  }
  console.log("4 findings created");

  // 6. Create evidence
  const evidences = [
    { id: "ev-1-1", findingId: "finding-1", documentId: "doc-ops-review", type: "SUPPORTING", source: "Operations Review – September 2024", excerpt: "On-Time Delivery: 64% (target: 90%). Sprint Completion Rate: 58%. Bug Backlog: 340 open issues (up from 180 in June). 3 critical outages in Q3 (total downtime: 8.2 hours).", relevance: 0.95 },
    { id: "ev-1-2", findingId: "finding-1", documentId: "doc-sales-pipeline", type: "SUPPORTING", source: "Sales Pipeline Review – October 2024", excerpt: "Engineering unable to commit to delivery dates. 6 deals stalled waiting for custom features. 3 enterprise deals lost to competitor with better onboarding.", relevance: 0.88 },
    { id: "ev-2-1", findingId: "finding-2", documentId: "doc-eng-survey", type: "SUPPORTING", source: "Engineering Pulse Survey – October 2024", excerpt: "Overall satisfaction: 4.2 (down from 5.8 in Jan). Work-life balance: 3.1. Career growth clarity: 2.8. Attrition Risk: 34% of respondents indicated they are actively looking.", relevance: 0.96 },
    { id: "ev-3-1", findingId: "finding-3", documentId: "doc-customer-feedback", type: "SUPPORTING", source: "Customer Feedback Q3 2024", excerpt: "NPS Score: 32 (down from 48 in Q1). Onboarding takes too long (mentioned by 42% of detractors). Product bugs not fixed for weeks (38%). At-Risk Accounts: 12 customers representing $890K ARR.", relevance: 0.92 },
    { id: "ev-3-2", findingId: "finding-3", documentId: "doc-financial-q3", type: "SUPPORTING", source: "Northstar Financial Q3 2024", excerpt: "Customer acquisition cost increased 34% to $4,200 per new logo. Expansion revenue declined 22%. Professional services costs ballooned to $180K due to onboarding delays.", relevance: 0.85 },
    { id: "ev-4-1", findingId: "finding-4", documentId: "doc-sales-pipeline", type: "SUPPORTING", source: "Sales Pipeline Review – October 2024", excerpt: "Win Rate: 22% (down from 31% in Q2). Sales Cycle: 87 days (up from 62 days). 6 deals stalled waiting for custom features. Sales team promising features not on roadmap.", relevance: 0.91 },
  ];

  for (const e of evidences) {
    await prisma.evidence.upsert({ where: { id: e.id }, update: {}, create: e });
  }
  console.log("6 evidence items created");

  // 7. Create risks
  const risks = [
    { id: "risk-1", clientId: client.id, title: "Critical engineering talent exodus", category: "PEOPLE", probability: "HIGH", impact: "HIGH", severity: "CRITICAL", confidence: 0.87, description: "34% of engineers actively looking. 28% annualized attrition. Key senior engineers may depart, causing knowledge loss and further delivery degradation.", mitigation: "Implement immediate retention package. Establish technical career track. Reduce on-call frequency. Conduct stay interviews with top 20 performers.", humanReviewRequired: true, status: "OPEN" },
    { id: "risk-2", clientId: client.id, title: "Major customer churn wave", category: "CUSTOMER", probability: "HIGH", impact: "HIGH", severity: "CRITICAL", confidence: 0.84, description: "12 at-risk accounts represent $890K ARR. NPS at 32 indicates systemic dissatisfaction. Competitors are actively targeting Northstar's mid-market segment.", mitigation: "Deploy executive sponsor program for at-risk accounts. Accelerate onboarding improvement. Fix top 10 reported bugs within 30 days.", humanReviewRequired: true, status: "OPEN" },
    { id: "risk-3", clientId: client.id, title: "Cash runway compression", category: "FINANCIAL", probability: "MEDIUM", impact: "HIGH", severity: "HIGH", confidence: 0.76, description: "Burn rate of $380K/month with 14 months runway. Operating margin compressed from 19% to 12%. CAC up 34% while expansion revenue declined 22%.", mitigation: "Implement cost control measures. Renegotiate vendor contracts. Consider strategic pricing review. Model scenarios for bridge financing.", humanReviewRequired: true, status: "OPEN" },
    { id: "risk-4", clientId: client.id, title: "Regulatory compliance gap", category: "REGULATORY", probability: "MEDIUM", impact: "MEDIUM", severity: "MEDIUM", confidence: 0.68, description: "SOC 2 Type II audit due in 6 months. Current documentation and controls may be insufficient. No dedicated compliance resource.", mitigation: "Engage compliance consultant. Begin control documentation. Assign interim compliance owner. Budget for external audit support.", humanReviewRequired: true, status: "OPEN" },
    { id: "risk-5", clientId: client.id, title: "Product stability reputation damage", category: "STRATEGIC", probability: "HIGH", impact: "MEDIUM", severity: "HIGH", confidence: 0.81, description: "3 critical outages in Q3. 340 open bugs. Negative reviews on G2 and Capterra increasing. Word-of-mouth in target market may be deteriorating.", mitigation: "Declare engineering quality sprint. Implement automated testing for legacy modules. Establish incident response process. Proactive customer communication plan.", humanReviewRequired: false, status: "OPEN" },
  ];

  for (const r of risks) {
    await prisma.risk.upsert({ where: { id: r.id }, update: {}, create: r });
  }
  console.log("5 risks created");

  // 8. Create recommendations
  const recommendations = [
    { id: "rec-1", clientId: client.id, findingId: "finding-1", title: "Establish engineering capacity and roadmap governance", rationale: "Delivery instability is the root cause of multiple downstream issues. Without predictable engineering output, sales cannot commit timelines, customers experience delays, and engineers burn out from constant context switching.", expectedImpact: "Improve on-time delivery to 85%+ within 90 days. Reduce bug backlog by 40%.", implementationEffort: "MEDIUM", priority: "CRITICAL", confidence: 0.91, risk: "May slow feature delivery short-term while process changes take hold", owner: "Marcus Webb – VP Engineering", timeHorizon: "30–60 days", humanApprovalRequired: true, status: "PENDING", consultantDecision: "PENDING" },
    { id: "rec-2", clientId: client.id, findingId: "finding-2", title: "Implement technical career track and retention program", rationale: "Engineering attrition is the highest-priority people risk. The absence of a technical career path is a primary driver. Compensation fairness scores suggest pay is adequate, indicating non-monetary factors dominate.", expectedImpact: "Reduce attrition from 28% to under 15% within 12 months. Improve satisfaction scores to 6.5+.", implementationEffort: "HIGH", priority: "CRITICAL", confidence: 0.85, risk: "Requires budget approval and may face resistance from existing management structure", owner: "Sarah Chen – CTO", timeHorizon: "60–90 days", humanApprovalRequired: true, status: "PENDING", consultantDecision: "PENDING" },
    { id: "rec-3", clientId: client.id, findingId: "finding-3", title: "Redesign customer onboarding for sub-14-day time-to-value", rationale: "42% of detractors cite onboarding as the primary issue. Current 45+ day onboarding is a competitive disadvantage. Professional services costs of $180K/quarter are unsustainable.", expectedImpact: "Reduce onboarding time to 14 days. Cut professional services costs by 50%. Improve NPS by 10+ points.", implementationEffort: "HIGH", priority: "HIGH", confidence: 0.82, risk: "Requires product and engineering investment that may conflict with other priorities", owner: "Alicia Torres – VP Customer Success", timeHorizon: "60–90 days", humanApprovalRequired: true, status: "PENDING", consultantDecision: "PENDING" },
    { id: "rec-4", clientId: client.id, findingId: "finding-4", title: "Create product-committee gate for sales commitments", rationale: "Sales-engineering misalignment is causing pipeline erosion and credibility damage. A formal gate process will prevent overcommitment while preserving sales velocity.", expectedImpact: "Improve win rate to 28%+. Reduce sales cycle to under 70 days. Eliminate feature-commitment disputes.", implementationEffort: "LOW", priority: "HIGH", confidence: 0.88, risk: "Sales team may resist process overhead initially", owner: "James Park – VP Sales", timeHorizon: "30 days", humanApprovalRequired: false, status: "PENDING", consultantDecision: "PENDING" },
    { id: "rec-5", clientId: client.id, findingId: "finding-1", title: "Implement automated testing and CI/CD pipeline", rationale: "Manual release process and lack of automated testing for legacy modules are contributing to outages and bug accumulation. Technical debt is estimated at 4-6 sprints.", expectedImpact: "Reduce release errors by 70%. Cut mean time to resolution from 14 to 7 days. Enable faster, safer deployments.", implementationEffort: "MEDIUM", priority: "MEDIUM", confidence: 0.79, risk: "Legacy codebase may resist full test coverage; requires careful prioritization", owner: "Marcus Webb – VP Engineering", timeHorizon: "60–90 days", humanApprovalRequired: false, status: "PENDING", consultantDecision: "PENDING" },
  ];

  for (const r of recommendations) {
    await prisma.recommendation.upsert({ where: { id: r.id }, update: {}, create: r });
  }
  console.log("5 recommendations created");

  // 9. Create action plans
  const plan30 = await prisma.actionPlan.upsert({ where: { id: "ap-30" }, update: {}, create: { id: "ap-30", clientId: client.id, title: "Stabilize – First 30 Days", phase: "30", status: "ACTIVE" } });
  const plan60 = await prisma.actionPlan.upsert({ where: { id: "ap-60" }, update: {}, create: { id: "ap-60", clientId: client.id, title: "Structure – Days 31–60", phase: "60", status: "ACTIVE" } });
  const plan90 = await prisma.actionPlan.upsert({ where: { id: "ap-90" }, update: {}, create: { id: "ap-90", clientId: client.id, title: "Scale – Days 61–90", phase: "90", status: "ACTIVE" } });

  const actionItems = [
    { id: "ai-1", actionPlanId: plan30.id, recommendationId: "rec-1", action: "Conduct engineering capacity audit and identify bottlenecks", owner: "Marcus Webb", deadline: new Date("2024-11-30"), priority: "CRITICAL", expectedImpact: "Baseline current capacity and identify quick wins", status: "NOT_STARTED" },
    { id: "ai-2", actionPlanId: plan30.id, recommendationId: "rec-4", action: "Implement product-committee gate for all custom feature requests", owner: "James Park", deadline: new Date("2024-11-20"), priority: "HIGH", expectedImpact: "Stop pipeline erosion from overcommitment", status: "NOT_STARTED" },
    { id: "ai-3", actionPlanId: plan30.id, recommendationId: "rec-2", action: "Launch stay interviews with top 20 engineering performers", owner: "Sarah Chen", deadline: new Date("2024-11-25"), priority: "CRITICAL", expectedImpact: "Identify immediate retention levers", status: "NOT_STARTED" },
    { id: "ai-4", actionPlanId: plan30.id, recommendationId: "rec-3", action: "Map current onboarding journey and identify friction points", owner: "Alicia Torres", deadline: new Date("2024-11-30"), priority: "HIGH", expectedImpact: "Identify highest-impact onboarding improvements", status: "NOT_STARTED" },
    { id: "ai-5", actionPlanId: plan60.id, recommendationId: "rec-1", action: "Establish sprint commitment protocol and definition of done", owner: "Marcus Webb", deadline: new Date("2024-12-20"), priority: "HIGH", expectedImpact: "Improve sprint completion to 80%+", status: "NOT_STARTED" },
    { id: "ai-6", actionPlanId: plan60.id, recommendationId: "rec-2", action: "Design and announce technical career progression framework", owner: "Sarah Chen", deadline: new Date("2024-12-31"), priority: "HIGH", expectedImpact: "Give engineers visible growth path", status: "NOT_STARTED" },
    { id: "ai-7", actionPlanId: plan60.id, recommendationId: "rec-3", action: "Build self-service onboarding portal MVP", owner: "Alicia Torres", deadline: new Date("2024-12-31"), priority: "MEDIUM", expectedImpact: "Reduce onboarding time by 30%", status: "NOT_STARTED" },
    { id: "ai-8", actionPlanId: plan90.id, recommendationId: "rec-5", action: "Deploy automated testing for top 3 legacy modules", owner: "Marcus Webb", deadline: new Date("2025-01-31"), priority: "MEDIUM", expectedImpact: "Reduce regression bugs by 50%", status: "NOT_STARTED" },
    { id: "ai-9", actionPlanId: plan90.id, recommendationId: "rec-2", action: "Launch technical mentorship program", owner: "Sarah Chen", deadline: new Date("2025-01-31"), priority: "MEDIUM", expectedImpact: "Improve knowledge retention and junior engineer growth", status: "NOT_STARTED" },
  ];

  for (const item of actionItems) {
    await prisma.actionItem.upsert({ where: { id: item.id }, update: {}, create: item });
  }
  console.log("9 action items created");

  // 10. Create audit logs
  const auditLogs = [
    { action: "CLIENT_CREATED", entityType: "Client", entityId: client.id, details: JSON.stringify({ name: client.name }) },
    { action: "ASSESSMENT_CREATED", entityType: "Assessment", entityId: "demo-assessment", details: JSON.stringify({ step: 1 }) },
    { action: "DOCUMENT_UPLOADED", entityType: "Document", entityId: "doc-financial-q3", details: JSON.stringify({ filename: "northstar_financial_q3_2024.pdf" }) },
    { action: "DOCUMENT_UPLOADED", entityType: "Document", entityId: "doc-eng-survey", details: JSON.stringify({ filename: "engineering_pulse_survey_oct2024.txt" }) },
    { action: "DOCUMENT_UPLOADED", entityType: "Document", entityId: "doc-customer-feedback", details: JSON.stringify({ filename: "customer_feedback_q3_2024.csv" }) },
    { action: "DOCUMENT_UPLOADED", entityType: "Document", entityId: "doc-sales-pipeline", details: JSON.stringify({ filename: "sales_pipeline_review_oct2024.docx" }) },
    { action: "DOCUMENT_UPLOADED", entityType: "Document", entityId: "doc-ops-review", details: JSON.stringify({ filename: "operations_review_sept2024.txt" }) },
    { action: "AI_ANALYSIS_STARTED", entityType: "AIAnalysis", entityId: "analysis-1", details: JSON.stringify({ clientId: client.id }) },
    { action: "AI_ANALYSIS_COMPLETED", entityType: "AIAnalysis", entityId: "analysis-1", details: JSON.stringify({ findings: 4, risks: 5, recommendations: 5 }) },
    { action: "FINDING_CREATED", entityType: "Finding", entityId: "finding-1", details: JSON.stringify({ title: "Engineering delivery instability" }) },
    { action: "FINDING_CREATED", entityType: "Finding", entityId: "finding-2", details: JSON.stringify({ title: "Employee attrition risk" }) },
    { action: "RISK_CREATED", entityType: "Risk", entityId: "risk-1", details: JSON.stringify({ title: "Critical engineering talent exodus" }) },
    { action: "RECOMMENDATION_CREATED", entityType: "Recommendation", entityId: "rec-1", details: JSON.stringify({ title: "Establish engineering capacity governance" }) },
  ];

  for (const log of auditLogs) {
    await prisma.auditLog.create({ data: { ...log, clientId: client.id, userId: user.id } });
  }
  console.log("Audit logs created");

  console.log("\nSeed complete! All demo data populated.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });