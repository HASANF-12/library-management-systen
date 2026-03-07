import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateContent, isGroqConfigured } from "@/lib/groq";
import { checkAiRateLimit } from "@/lib/rate-limit-ai";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = session.user.role as string;
  if (role !== "ADMIN" && role !== "LIBRARIAN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { allowed, retryAfterSec } = checkAiRateLimit(session.user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: `You have 10 AI requests per minute. Please try again in ${retryAfterSec ?? 1} seconds.` },
      { status: 429 }
    );
  }
  if (!isGroqConfigured()) {
    return NextResponse.json(
      { error: "AI not configured. Set GROQ_API_KEY in .env.local" },
      { status: 503 }
    );
  }

  const body = await req.json();
  const { description } = body as { description?: string };
  if (typeof description !== "string") {
    return NextResponse.json({ error: "description required" }, { status: 400 });
  }

  try {
    const text = await generateContent({
      systemInstruction:
        "You are a librarian. Rewrite the given book description in a clear, professional tone. Keep it concise (2-4 sentences). Do not add information that is not in the original. Output only the improved description, no preamble.",
      userContent: description || "No description provided.",
      maxOutputTokens: 300,
    });
    return NextResponse.json({ description: text });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "AI request failed" },
      { status: 500 }
    );
  }
}
