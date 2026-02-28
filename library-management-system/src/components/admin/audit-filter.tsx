"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Props = {
  defaultAction: string;
  defaultUser: string;
  defaultFrom: string;
  defaultTo: string;
};

export function AuditFilter({ defaultAction, defaultUser, defaultFrom, defaultTo }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const action = (form.querySelector('[name="action"]') as HTMLSelectElement)?.value ?? "";
    const user = (form.querySelector('[name="user"]') as HTMLInputElement)?.value?.trim() ?? "";
    const from = (form.querySelector('[name="from"]') as HTMLInputElement)?.value ?? "";
    const to = (form.querySelector('[name="to"]') as HTMLInputElement)?.value ?? "";
    const params = new URLSearchParams();
    if (action) params.set("action", action);
    if (user) params.set("user", user);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("page", "1");
    startTransition(() => {
      router.push(`/admin/audit?${params.toString()}`);
    });
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-2">
          <Label htmlFor="action">Action</Label>
          <select
            id="action"
            name="action"
            defaultValue={defaultAction || "all"}
            className="flex h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2"
          >
            <option value="all">All actions</option>
            <option value="BOOK_CREATED">Book created</option>
            <option value="BOOK_UPDATED">Book updated</option>
            <option value="BOOK_DELETED">Book deleted</option>
            <option value="LOAN_CHECKOUT">Loan checkout</option>
            <option value="LOAN_RETURN">Loan return</option>
            <option value="ROLE_CHANGED">Role changed</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="user">User (name/email)</Label>
          <Input id="user" name="user" defaultValue={defaultUser} placeholder="Search user…" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="from">From date</Label>
          <Input id="from" name="from" type="date" defaultValue={defaultFrom} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="to">To date</Label>
          <Input id="to" name="to" type="date" defaultValue={defaultTo} />
        </div>
        <div className="flex items-end gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Filtering…" : "Filter"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/audit")}
            disabled={isPending}
          >
            Clear
          </Button>
        </div>
      </div>
    </form>
  );
}
