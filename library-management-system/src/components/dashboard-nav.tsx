"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  Library,
  UserCog,
  ClipboardList,
  LogOut,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
};

const navItems: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; roles: Role[] }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "LIBRARIAN", "MEMBER"] },
  { href: "/books", label: "Books", icon: BookOpen, roles: ["ADMIN", "LIBRARIAN", "MEMBER"] },
  { href: "/loans", label: "My Loans", icon: ClipboardList, roles: ["MEMBER"] },
  { href: "/loans/manage", label: "Manage Loans", icon: Library, roles: ["ADMIN", "LIBRARIAN"] },
  { href: "/admin/users", label: "Users & Roles", icon: UserCog, roles: ["ADMIN"] },
  { href: "/admin/audit", label: "Activity log", icon: History, roles: ["ADMIN", "LIBRARIAN"] },
];

export function DashboardNav({ user }: { user: User }) {
  const pathname = usePathname();
  const visible = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className="mr-4 text-lg font-semibold text-zinc-900"
          >
            Mini Library
          </Link>
          {visible.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href || pathname.startsWith(item.href + "/")
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-zinc-500 sm:inline">
            {user.email}
          </span>
          <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
            {user.role}
          </span>
          <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
