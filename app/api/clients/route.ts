import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { clientSchema } from "@/lib/validation/schemas";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { documents: true, findings: true, risks: true, recommendations: true } },
    },
  });

  return NextResponse.json(clients);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = clientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const client = await prisma.client.create({
    data: { ...parsed.data, userId: session.user.id },
  });

  await prisma.auditLog.create({
    data: {
      clientId: client.id,
      userId: session.user.id,
      action: "CLIENT_CREATED",
      entityType: "Client",
      entityId: client.id,
      details: JSON.stringify({ name: client.name }),
    },
  });

  return NextResponse.json(client);
}
