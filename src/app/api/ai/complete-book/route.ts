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
  const { prompt } = body as { prompt?: string };
  const input = typeof prompt === "string" ? prompt.trim() : "";
  if (!input) {
    return NextResponse.json({ error: "prompt required" }, { status: 400 });
  }

  try {
    const text = await generateContent({
      systemInstruction: `You are a librarian. Given a book title, author name, ISBN, or brief description, infer book details. Respond with ONLY a valid JSON object (no markdown, no code blocks) with these exact keys: title, author, isbn, description, publishedYear, tags. Rules:
- title: string (required)
- author: string (required)
- isbn: string (empty string if unknown)
- description: 2-4 sentences, professional tone
- publishedYear: number or null if unknown
- tags: comma-separated lowercase tags, e.g. "fiction, classic, drama"
Example: {"title":"To Kill a Mockingbird","author":"Harper Lee","isbn":"","description":"...","publishedYear":1960,"tags":"fiction, classic, drama"}`,
      userContent: input,
      maxOutputTokens: 600,
    });

    let parsed: {
      title?: string;
      author?: string;
      isbn?: string;
      description?: string;
      publishedYear?: number | null;
      tags?: string;
    };
    try {
      const cleaned = text.replace(/```json?\s*/gi, "").replace(/```\s*$/gi, "").trim();
      parsed = JSON.parse(cleaned) as typeof parsed;
    } catch {
      return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 502 });
    }

    const result = {
      title: typeof parsed.title === "string" ? parsed.title.trim() : "",
      author: typeof parsed.author === "string" ? parsed.author.trim() : "",
      isbn: typeof parsed.isbn === "string" ? parsed.isbn.trim() : "",
      description: typeof parsed.description === "string" ? parsed.description.trim() : "",
      publishedYear:
        typeof parsed.publishedYear === "number" && !Number.isNaN(parsed.publishedYear)
          ? parsed.publishedYear
          : undefined,
      coverImageUrl: "", // AI cannot reliably provide valid cover URLs
      tags: typeof parsed.tags === "string" ? parsed.tags.trim() : "",
    };

    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "AI request failed" },
      { status: 500 }
    );
  }
}
