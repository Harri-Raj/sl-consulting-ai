import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { challengeFinding } from "@/services/ai/finding-service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const result = await challengeFinding(id);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Challenge failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
