"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Props = {
  defaultQ: string;
  defaultAuthor: string;
  defaultIsbn: string;
  defaultTag: string;
  defaultStatus: string;
  defaultSort: string;
};

export function BookSearchForm({
  defaultQ,
  defaultAuthor,
  defaultIsbn,
  defaultTag,
  defaultStatus,
  defaultSort,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.querySelector('[name="q"]') as HTMLInputElement)?.value?.trim() ?? "";
    const author = (form.querySelector('[name="author"]') as HTMLInputElement)?.value?.trim() ?? "";
    const isbn = (form.querySelector('[name="isbn"]') as HTMLInputElement)?.value?.trim() ?? "";
    const tag = (form.querySelector('[name="tag"]') as HTMLInputElement)?.value?.trim() ?? "";
    const status = (form.querySelector('[name="status"]') as HTMLSelectElement)?.value ?? "";
    const sort = (form.querySelector('[name="sort"]') as HTMLSelectElement)?.value ?? "newest";
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (author) params.set("author", author);
    if (isbn) params.set("isbn", isbn);
    if (tag) params.set("tag", tag);
    if (status) params.set("status", status);
    if (sort && sort !== "newest") params.set("sort", sort);
    params.set("page", "1");
    startTransition(() => {
      router.push(`/books?${params.toString()}`);
    });
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="q">Search (title, author, ISBN, tags)</Label>
          <Input id="q" name="q" defaultValue={defaultQ} placeholder="Search…" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="author">Author</Label>
          <Input id="author" name="author" defaultValue={defaultAuthor} placeholder="Author" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Availability</Label>
          <select
            id="status"
            name="status"
            defaultValue={defaultStatus || "all"}
            className="flex h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2"
          >
            <option value="all">All</option>
            <option value="available">Available</option>
            <option value="borrowed">Borrowed</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sort">Sort</Label>
          <select
            id="sort"
            name="sort"
            defaultValue={defaultSort}
            className="flex h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2"
          >
            <option value="newest">Newest added</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>
      </div>
      <input type="hidden" name="tag" value={defaultTag} />
      <input type="hidden" name="isbn" value={defaultIsbn} />
      <div className="mt-4 flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Searching…" : "Search"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/books")}
        >
          Clear
        </Button>
      </div>
    </form>
  );
}
