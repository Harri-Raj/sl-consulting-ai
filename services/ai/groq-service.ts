import Groq from "groq-sdk";

export function getGroqClient(): Groq {
  const key = process.env.GROQ_API_KEY;
  if (!key || key.length < 10) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  return new Groq({ apiKey: key });
}

export function isGroqConfigured(): boolean {
  const key = process.env.GROQ_API_KEY;
  return !!key && key.length > 10 && key !== "your-groq-api-key";
}

export function extractJsonFromResponse(text: string): any {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid response: expected string");
  }
  // Try markdown code block
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1]);
  }
  // Try first { to last }
  const jsonMatch = text.match(/(\{[\s\S]*\})/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }
  // Fallback
  return JSON.parse(text);
}

export async function groqChatCompletion(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  options?: { temperature?: number; maxTokens?: number; jsonMode?: boolean }
): Promise<string> {
  const client = getGroqClient();
  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages,
    temperature: options?.temperature ?? 0.2,
    max_tokens: options?.maxTokens ?? 4000,
    // Don't use response_format — extract JSON manually
  });
  return response.choices[0]?.message?.content ?? "";
}