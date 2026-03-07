"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { updateBookDescription } from "@/app/books/ai-actions";

export function ImproveDescriptionButton({
  bookId,
  currentDescription,
}: {
  bookId: string;
  currentDescription: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/improve-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: currentDescription }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Error",
          description: data.error ?? "Failed to improve description",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      const result = await updateBookDescription(bookId, data.description);
      if (result && "error" in result && result.error) {
        toast({ title: "Error", description: String(result.error), variant: "destructive" });
      } else {
        toast({ title: "Description updated", variant: "success" });
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
      {loading ? "Improving…" : "Improve description"}
    </Button>
  );
}
