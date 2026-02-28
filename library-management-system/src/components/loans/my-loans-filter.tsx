"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Props = {
  defaultFilter: string;
};

export function MyLoansFilter({ defaultFilter }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const filter = (form.querySelector('[name="filter"]') as HTMLSelectElement)?.value ?? "all";
    const params = new URLSearchParams();
    if (filter && filter !== "all") params.set("filter", filter);
    startTransition(() => {
      router.push(`/loans?${params.toString()}`);
    });
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="filter">Show</Label>
          <select
            id="filter"
            name="filter"
            defaultValue={defaultFilter || "all"}
            onChange={(e) => {
              const form = e.currentTarget.form;
              if (form) form.requestSubmit();
            }}
            className="flex h-10 min-w-[140px] rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2"
          >
            <option value="all">All loans</option>
            <option value="overdue">Overdue only</option>
            <option value="due_soon">Due within 7 days</option>
          </select>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push("/loans")}
          disabled={isPending}
        >
          Clear
        </Button>
      </div>
    </form>
  );
}
