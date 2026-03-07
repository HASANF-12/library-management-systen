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
  const { title, author, description } = body as {
    title?: string;
    author?: string;
    description?: string;
  };
  const context = [title, author, description].filter(Boolean).join("\n");
  if (!context.trim()) {
    return NextResponse.json(
      { error: "title, author or description required" },
      { status: 400 }
    );
  }

  try {
    const text = await generateContent({
      systemInstruction:
        "You are a librarian. Based on the book title, author, and description, suggest 3-6 short tags or categories (e.g. fiction, science-fiction, history). Output only a comma-separated list of tags, lowercase, no numbers or punctuation inside tags. Example: fiction, sci-fi, adventure",
      userContent: context,
      maxOutputTokens: 150,
    });
    const tags = text
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    return NextResponse.json({ tags });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "AI request failed" },
      { status: 500 }
    );
  }
}
