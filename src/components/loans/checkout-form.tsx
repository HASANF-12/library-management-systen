"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { checkoutBook } from "@/app/loans/actions";
import { useToast } from "@/components/ui/use-toast";

type User = { id: string; name: string | null; email: string | null };
type Book = { id: string; title: string; author: string };

export function CheckoutForm({
  users,
  books,
}: {
  users: User[];
  books: Book[];
}) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const bookId = (form.elements.namedItem("bookId") as HTMLSelectElement)?.value;
    const userId = (form.elements.namedItem("userId") as HTMLSelectElement)?.value;
    if (!bookId || !userId) return;
    const formData = new FormData();
    formData.set("bookId", bookId);
    formData.set("userId", userId);
    formData.set("dueDays", (form.elements.namedItem("dueDays") as HTMLInputElement)?.value ?? "14");
    startTransition(async () => {
      const result = await checkoutBook(formData);
      if (result?.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
        return;
      }
      toast({ title: "Success", description: "Book checked out." });
      form.reset();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
      <div className="min-w-[200px] space-y-2">
        <Label htmlFor="bookId">Book</Label>
        <select
          id="bookId"
          name="bookId"
          required
          className="flex h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
        >
          <option value="">Select book</option>
          {books.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title} — {b.author}
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-[200px] space-y-2">
        <Label htmlFor="userId">Member</Label>
        <select
          id="userId"
          name="userId"
          required
          className="flex h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
        >
          <option value="">Select member</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name ?? u.email ?? "Unknown"}
            </option>
          ))}
        </select>
      </div>
      <div className="w-24 space-y-2">
        <Label htmlFor="dueDays">Due (days)</Label>
        <input
          id="dueDays"
          name="dueDays"
          type="number"
          min={1}
          max={365}
          defaultValue={14}
          className="flex h-10 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Checking out…" : "Check out"}
      </Button>
    </form>
  );
}
