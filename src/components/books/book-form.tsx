"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createBook } from "@/app/books/actions";
import { updateBook } from "@/app/books/actions";

type Initial = {
  title: string;
  author: string;
  isbn: string;
  description: string;
  publishedYear?: number;
  coverImageUrl: string;
  tags: string;
};

export function BookForm({
  bookId,
  initial,
  showAiComplete = false,
}: {
  bookId?: string;
  initial?: Initial;
  showAiComplete?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const isEdit = !!bookId && !!initial;

  async function handleAiComplete() {
    const prompt = aiPrompt.trim();
    if (!prompt) {
      toast({ title: "Enter a book title, author, or ISBN", variant: "destructive" });
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/complete-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: res.status === 429 ? "Rate limit" : "Error",
          description: data.error,
          variant: "destructive",
        });
        setAiLoading(false);
        return;
      }
      const form = formRef.current;
      if (form) {
        const setField = (name: string, value: string | number | undefined) => {
          const el = form.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLTextAreaElement | null;
          if (el) el.value = value != null ? String(value) : "";
        };
        setField("title", data.title ?? "");
        setField("author", data.author ?? "");
        setField("isbn", data.isbn ?? "");
        setField("description", data.description ?? "");
        setField("publishedYear", data.publishedYear ?? "");
        setField("coverImageUrl", data.coverImageUrl ?? "");
        setField("tags", data.tags ?? "");
      }
      toast({
        title: "Form filled",
        description: "Review and edit as needed before saving.",
        variant: "success",
      });
    } catch {
      toast({ title: "Error", description: "AI request failed", variant: "destructive" });
    }
    setAiLoading(false);
  }

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isEdit
        ? await updateBook(bookId!, formData)
        : await createBook(formData);
      if (result?.error) {
        console.error(result.error);
        return;
      }
      if (result?.success) {
        const url = isEdit ? `/books/${bookId}` : (result && "id" in result ? `/books/${result.id}` : "/books");
        router.push(url);
        router.refresh();
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="max-w-xl space-y-4">
      {showAiComplete && !isEdit && (
        <div className="space-y-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <p className="text-sm font-medium text-[#0F172A]">AI Complete</p>
          <p className="text-xs text-[#475569]">Enter a book title, author, or ISBN to auto-fill all fields.</p>
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="e.g. To Kill a Mockingbird or 1984 George Orwell"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAiComplete())}
              className="min-w-[200px] flex-1"
            />
            <Button type="button" variant="outline" onClick={handleAiComplete} disabled={aiLoading}>
              <Sparkles className="h-4 w-4" />
              {aiLoading ? "Filling…" : "AI Complete"}
            </Button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={initial?.title}
          placeholder="Book title"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="author">Author *</Label>
        <Input
          id="author"
          name="author"
          required
          defaultValue={initial?.author}
          placeholder="Author name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="isbn">ISBN</Label>
        <Input
          id="isbn"
          name="isbn"
          defaultValue={initial?.isbn}
          placeholder="Optional"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={initial?.description}
          className="flex w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2"
          placeholder="Brief description"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="publishedYear">Published year</Label>
        <Input
          id="publishedYear"
          name="publishedYear"
          type="number"
          defaultValue={initial?.publishedYear}
          placeholder="e.g. 2020"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="coverImageUrl">Cover image URL</Label>
        <Input
          id="coverImageUrl"
          name="coverImageUrl"
          type="url"
          defaultValue={initial?.coverImageUrl}
          placeholder="https://..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          name="tags"
          defaultValue={initial?.tags}
          placeholder="fiction, sci-fi"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : isEdit ? "Save changes" : "Add book"}
        </Button>
        <Link href={isEdit ? `/books/${bookId}` : "/books"}>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
