import { z } from "zod";
import { groqChatCompletion, isGroqConfigured } from "./groq-service";
import { advisorSystemPrompt } from "./prompts";
import { buildClientContext, preparePromptContext } from "./context-builder";

const AdvisorResponseSchema = z.object({
  answer: z.string(),
  sources: z.array(z.object({
    title: z.string(),
    excerpt: z.string(),
  })),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
  suggestedFollowUp: z.array(z.string()),
});

export async function askAdvisor(clientId: string, question: string) {
  if (!isGroqConfigured()) {
    return {
      answer: "Groq API key is not configured. Add GROQ_API_KEY to your environment variables to enable the AI Advisor.",
      sources: [],
      confidence: "LOW",
      suggestedFollowUp: [],
    };
  }

  const context = await buildClientContext(clientId);
  const promptContext = preparePromptContext(context, 10000);

  const response = await groqChatCompletion(
    [
      { role: "system", content: advisorSystemPrompt },
      { role: "user", content: `Context:
${promptContext}

Question: ${question}` },
    ],
    { temperature: 0.3, maxTokens: 3000, jsonMode: true }
  );

  let parsed: unknown;
  try {
    parsed = JSON.parse(response);
  } catch {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      return {
        answer: response,
        sources: [],
        confidence: "MEDIUM",
        suggestedFollowUp: [],
      };
    }
  }

  const validated = AdvisorResponseSchema.parse(parsed);
  return validated;
}
