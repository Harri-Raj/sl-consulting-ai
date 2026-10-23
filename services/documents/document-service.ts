import { prisma } from "@/lib/db";

export async function processDocument(documentId: string, text: string) {
  // Simple chunking strategy
  const chunks = chunkText(text, 2000);

  await prisma.documentChunk.deleteMany({
    where: { documentId },
  });

  for (let i = 0; i < chunks.length; i++) {
    await prisma.documentChunk.create({
      data: {
        documentId,
        content: chunks[i],
        chunkIndex: i,
      },
    });
  }

  await prisma.document.update({
    where: { id: documentId },
    data: {
      extractedText: text.slice(0, 50000),
      processingStatus: "COMPLETE",
      analysisStatus: "PENDING",
    },
  });
}

function chunkText(text: string, maxChunkSize: number): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += " " + sentence;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

export function detectDocumentType(filename: string, mimeType: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes("financial") || lower.includes("revenue") || lower.includes("profit")) return "FINANCIAL";
  if (lower.includes("survey") || lower.includes("feedback") || lower.includes("interview")) return "SURVEY";
  if (lower.includes("sales") || lower.includes("pipeline") || lower.includes("revenue")) return "SALES";
  if (lower.includes("operation") || lower.includes("process") || lower.includes("delivery")) return "OPERATIONAL";
  if (lower.includes("strategic") || lower.includes("plan") || lower.includes("roadmap")) return "STRATEGIC";
  if (lower.includes("hr") || lower.includes("people") || lower.includes("employee")) return "HR";
  if (mimeType === "text/csv" || mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") return "DATA";
  return "UNKNOWN";
}
