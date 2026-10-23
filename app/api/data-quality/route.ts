import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { calculateDataQuality } from "@/services/ai/analysis-service";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  try {
    const dataQuality = await calculateDataQuality(clientId);
    return NextResponse.json(dataQuality);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to calculate data quality";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
