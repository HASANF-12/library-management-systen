"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Props = { defaultBorrower: string };

export function ManageLoansFilter({ defaultBorrower }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const borrower = (form.querySelector('[name="borrower"]') as HTMLInputElement)?.value?.trim() ?? "";
    const params = new URLSearchParams();
    if (borrower) params.set("borrower", borrower);
    params.set("page", "1");
    startTransition(() => router.push(`/loans/manage?${params.toString()}`));
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="borrower">Filter by borrower</Label>
          <Input id="borrower" name="borrower" defaultValue={defaultBorrower} placeholder="Name or email" className="max-w-xs" />
        </div>
        <Button type="submit" disabled={isPending}>{isPending ? "Filtering" : "Filter"}</Button>
        <Button type="button" variant="outline" onClick={() => router.push("/loans/manage")} disabled={isPending}>Clear</Button>
      </div>
    </form>
  );
}
