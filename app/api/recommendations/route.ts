import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json({ error: "clientId required" }, { status: 400 });
  }

  const recommendations = await prisma.recommendation.findMany({
    where: { clientId },
    orderBy: [{ priority: "desc" }, { confidence: "desc" }],
    include: { finding: true },
  });

  return NextResponse.json(recommendations);
}