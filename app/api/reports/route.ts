import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { generateReportData } from "@/services/reports/report-service";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  const reports = await prisma.report.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reports);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { clientId, title } = body;
  if (!clientId || !title) return NextResponse.json({ error: "clientId and title required" }, { status: 400 });

  const reportData = await generateReportData(clientId);

  const report = await prisma.report.create({
    data: {
      clientId,
      title,
      content: JSON.stringify(reportData),
      status: "COMPLETE",
    },
  });

  await prisma.auditLog.create({
    data: {
      clientId,
      userId: session.user.id,
      action: "REPORT_GENERATED",
      entityType: "Report",
      entityId: report.id,
      details: JSON.stringify({ title }),
    },
  });

  return NextResponse.json(report);
}
