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
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
};

const navItems: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "LIBRARIAN", "MEMBER"],
  },
  {
    href: "/books",
    label: "Books",
    icon: BookOpen,
    roles: ["ADMIN", "LIBRARIAN", "MEMBER"],
  },
  { href: "/loans", label: "My Loans", icon: ClipboardList, roles: ["MEMBER"] },
  {
    href: "/loans/manage",
    label: "Manage Loans",
    icon: Library,
    roles: ["ADMIN", "LIBRARIAN"],
  },
  {
    href: "/admin/users",
    label: "Users & Roles",
    icon: UserCog,
    roles: ["ADMIN"],
  },
  {
    href: "/admin/audit",
    label: "Activity log",
    icon: History,
    roles: ["ADMIN", "LIBRARIAN"],
  },
];

export function AppShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const visible = navItems.filter((item) => item.roles.includes(user.role));
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-56 flex-col border-r border-[#334155] bg-[#0F172A] hidden md:flex">
        <div className="flex h-16 items-center border-b border-[#334155] px-6">
          <Link href="/dashboard" className="text-lg font-semibold text-white tracking-tight">
            Mini Library
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 p-4">
          {visible.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "bg-[#1E293B] text-white"
                    : "text-[#94A3B8] hover:bg-[#1E293B] hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:pl-56">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#E2E8F0] bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex-1" />
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors"
            >
              <span className="hidden truncate max-w-[160px] sm:inline">
                {user.email}
              </span>
              <span className="rounded-full bg-[#E2E8F0] px-2 py-0.5 text-xs font-medium text-[#475569]">
                {user.role}
              </span>
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", profileOpen && "rotate-180")}
              />
            </button>
            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                  aria-hidden
                />
                <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-[#E2E8F0] bg-white py-1 shadow-sm">
                  <div className="border-b border-[#E2E8F0] px-3 py-2">
                    <p className="text-sm font-medium text-[#0F172A] truncate">
                      {user.name ?? "User"}
                    </p>
                    <p className="text-xs text-[#475569] truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 p-4 pb-24 sm:p-6 sm:pb-6 lg:p-8">{children}</main>
      </div>

      {/* Mobile nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-[#E2E8F0] bg-white py-2 md:hidden">
        {visible.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-4 py-2 text-xs font-medium transition-colors",
                isActive ? "text-[#2563EB]" : "text-[#475569]"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label.replace("Manage ", "").replace("My ", "")}
            </Link>
          );
        })}
      </nav>
      <div className="h-16 md:hidden" aria-hidden />
    </div>
  );
}
