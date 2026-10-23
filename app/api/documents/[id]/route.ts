import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const doc = await prisma.document.findFirst({
    where: { id },
    include: { client: true },
  });

  if (!doc || doc.client.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.document.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      clientId: doc.clientId,
      userId: session.user.id,
      action: "DOCUMENT_DELETED",
      entityType: "Document",
      entityId: id,
      details: JSON.stringify({ filename: doc.originalName }),
    },
  });

  return NextResponse.json({ success: true });
}
