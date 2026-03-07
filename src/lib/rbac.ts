import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

const ROLE_HIERARCHY: Record<Role, number> = {
  ADMIN: 3,
  LIBRARIAN: 2,
  MEMBER: 1,
};

export async function getSession() {
  return auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth();
  const role = session.user.role as Role;
  if (!allowedRoles.includes(role)) {
    redirect("/dashboard");
  }
  return session;
}

export function hasRole(userRole: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole);
}

export function canManageBooks(role: Role): boolean {
  return role === "ADMIN" || role === "LIBRARIAN";
}

export function canManageUsers(role: Role): boolean {
  return role === "ADMIN";
}

export function canManageLoans(role: Role): boolean {
  return role === "ADMIN" || role === "LIBRARIAN";
}

export function isAtLeastLibrarian(role: Role): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.LIBRARIAN;
}
