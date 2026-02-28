import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = session.user.role as string;
  if (role !== "ADMIN" && role !== "LIBRARIAN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!OPENAI_API_KEY?.length) {
    return NextResponse.json(
      { error: "AI not configured. Set OPENAI_API_KEY." },
      { status: 503 }
    );
  }

  const body = await req.json();
  const { description } = body as { description?: string };
  if (typeof description !== "string") {
    return NextResponse.json({ error: "description required" }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a librarian. Rewrite the given book description in a clear, professional tone. Keep it concise (2-4 sentences). Do not add information that is not in the original. Output only the improved description, no preamble.",
          },
          { role: "user", content: description || "No description provided." },
        ],
        max_tokens: 300,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: "OpenAI request failed", details: err },
        { status: 502 }
      );
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return NextResponse.json({ error: "Empty response from AI" }, { status: 502 });
    }
    return NextResponse.json({ description: text });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
