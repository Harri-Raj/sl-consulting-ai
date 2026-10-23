import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { decisionSchema } from "@/lib/validation/schemas";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  const decisions = await prisma.decision.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  return NextResponse.json(decisions);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = decisionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const decision = await prisma.decision.create({
    data: { ...parsed.data, userId: session.user.id },
  });

  await prisma.auditLog.create({
    data: {
      clientId: parsed.data.clientId,
      userId: session.user.id,
      action: `DECISION_${parsed.data.type}`,
      entityType: "Decision",
      entityId: decision.id,
      details: JSON.stringify({ title: parsed.data.title }),
    },
  });

  return NextResponse.json(decision);
}
