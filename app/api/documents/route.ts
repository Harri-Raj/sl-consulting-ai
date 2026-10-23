import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { processDocument, detectDocumentType } from "@/services/documents/document-service";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  const docs = await prisma.document.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(docs);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const clientId = formData.get("clientId") as string;
  const file = formData.get("file") as File;

  if (!clientId || !file) {
    return NextResponse.json({ error: "clientId and file required" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}_${file.name}`;

  // Simple text extraction based on file type
  let extractedText = "";
  const mimeType = file.type;

  if (mimeType === "text/plain" || mimeType === "text/csv") {
    extractedText = buffer.toString("utf-8");
  } else if (mimeType === "application/pdf") {
    extractedText = `[PDF Content Placeholder - ${file.name}]

This is a PDF document. In production, use pdf-parse for extraction.`;
  } else if (mimeType.includes("wordprocessingml.document") || mimeType.includes("msword")) {
    extractedText = `[DOCX Content Placeholder - ${file.name}]

This is a Word document. In production, use mammoth for extraction.`;
  } else {
    extractedText = `[Document: ${file.name}]

Type: ${mimeType}
Size: ${file.size} bytes`;
  }

  const documentType = detectDocumentType(file.name, mimeType);

  const doc = await prisma.document.create({
    data: {
      clientId,
      filename,
      originalName: file.name,
      mimeType,
      size: file.size,
      extractedText,
      processingStatus: "PROCESSING",
      documentType,
    },
  });

  // Process document asynchronously
  await processDocument(doc.id, extractedText);

  await prisma.auditLog.create({
    data: {
      clientId,
      userId: session.user.id,
      action: "DOCUMENT_UPLOADED",
      entityType: "Document",
      entityId: doc.id,
      details: JSON.stringify({ filename: file.name, type: documentType }),
    },
  });

  return NextResponse.json(doc);
}
