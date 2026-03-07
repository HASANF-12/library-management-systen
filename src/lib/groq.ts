/**
 * Groq API - free tier, no credit card required
 * Get API key: https://console.groq.com/keys
 * Models: llama-3.1-8b-instant (fast), llama-3.3-70b-versatile
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

export function isGroqConfigured(): boolean {
  return !!(GROQ_API_KEY && GROQ_API_KEY.length > 0);
}

type GenerateContentOptions = {
  systemInstruction: string;
  userContent: string;
  maxOutputTokens?: number;
};

export async function generateContent({
  systemInstruction,
  userContent,
  maxOutputTokens = 300,
}: GenerateContentOptions): Promise<string> {
  if (!GROQ_API_KEY?.length) {
    throw new Error("AI not configured. Set GROQ_API_KEY in .env.local");
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userContent },
      ],
      max_tokens: maxOutputTokens,
      temperature: 0.5,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${err}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Empty response from Groq");
  }
  return text;
}
