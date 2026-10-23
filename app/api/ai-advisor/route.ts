import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { askAdvisor } from "@/services/ai/advisor-service";
import { aiAdvisorQuerySchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = aiAdvisorQuerySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  try {
    const result = await askAdvisor(parsed.data.clientId, parsed.data.question);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Advisor request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
