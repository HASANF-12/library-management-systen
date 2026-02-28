"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Props = {
  defaultQ: string;
  defaultEmail: string;
  defaultRole: string;
};

export function UsersFilter({ defaultQ, defaultEmail, defaultRole }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.querySelector('[name="q"]') as HTMLInputElement)?.value?.trim() ?? "";
    const email = (form.querySelector('[name="email"]') as HTMLInputElement)?.value?.trim() ?? "";
    const role = (form.querySelector('[name="role"]') as HTMLSelectElement)?.value ?? "";
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (email) params.set("email", email);
    if (role) params.set("role", role);
    startTransition(() => {
      router.push(`/admin/users?${params.toString()}`);
    });
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="q">Name</Label>
          <Input id="q" name="q" defaultValue={defaultQ} placeholder="Search name…" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" defaultValue={defaultEmail} placeholder="Search email…" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            name="role"
            defaultValue={defaultRole || "all"}
            className="flex h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2"
          >
            <option value="all">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="LIBRARIAN">Librarian</option>
            <option value="MEMBER">Member</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Filtering…" : "Filter"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/users")}
            disabled={isPending}
          >
            Clear
          </Button>
        </div>
      </div>
    </form>
  );
}
