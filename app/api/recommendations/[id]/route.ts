import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const recommendation = await prisma.recommendation.findFirst({
    where: { id },
    include: { client: true },
  });

  if (!recommendation || recommendation.client.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.recommendation.update({
    where: { id },
    data: {
      consultantDecision: body.decision,
      status: body.status || recommendation.status,
      owner: body.owner || recommendation.owner,
    },
  });

  await prisma.auditLog.create({
    data: {
      clientId: recommendation.clientId,
      userId: session.user.id,
      action: `RECOMMENDATION_${body.decision}`,
      entityType: "Recommendation",
      entityId: id,
      details: JSON.stringify({ decision: body.decision }),
    },
  });

  return NextResponse.json(updated);
}
