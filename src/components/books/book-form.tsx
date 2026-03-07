"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
}: {
  bookId?: string;
  initial?: Initial;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!bookId && !!initial;

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
    <form action={handleSubmit} className="max-w-xl space-y-4">
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
