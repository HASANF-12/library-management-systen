"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { updateBookTags } from "@/app/books/ai-actions";

export function SuggestTagsButton({
  bookId,
  title,
  author,
  description,
}: {
  bookId: string;
  title: string;
  author: string;
  description: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/suggest-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Error",
          description: data.error ?? "Failed to suggest tags",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      const tags = data.tags as string[];
      if (!tags?.length) {
        toast({ title: "No tags suggested", variant: "default" });
        setLoading(false);
        return;
      }
      const result = await updateBookTags(bookId, tags);
      if (result && "error" in result && result.error) {
        toast({ title: "Error", description: String(result.error), variant: "destructive" });
      } else {
        toast({ title: "Tags updated", description: tags.join(", "), variant: "success" });
        router.refresh();
      }
    } catch {
      toast({ title: "Error", description: "Request failed", variant: "destructive" });
    }
    setLoading(false);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={loading}
    >
      <Sparkles className="h-4 w-4" />
      {loading ? "Suggesting…" : "Suggest tags"}
    </Button>
  );
}
