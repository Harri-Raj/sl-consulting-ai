import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const hashedPassword = await bcrypt.hash("demo123", 12);
    await prisma.user.upsert({
      where: { email: "consultant@slconsulting.demo" },
      update: {},
      create: {
        email: "consultant@slconsulting.demo",
        name: "Demo Consultant",
        password: hashedPassword,
        role: "CONSULTANT",
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
