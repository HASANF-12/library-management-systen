import { requireAuth } from "@/lib/rbac";
import { canManageBooks, canManageUsers } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { BookOpen, Users, ClipboardList, AlertCircle } from "lucide-react";

export default async function DashboardPage() {
  const session = await requireAuth();
  const role = session.user.role;

  const [totalBooks, borrowedCount, overdueCount] = await Promise.all([
    prisma.book.count({ where: { deletedAt: null } }),
    prisma.loan.count({ where: { returnedAt: null } }),
    prisma.loan.count({
      where: {
        returnedAt: null,
        dueDate: { lt: new Date() },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[#475569]">
          Welcome back, {session.user.name ?? session.user.email}
        </p>
      </div>

      {(canManageBooks(role) || canManageUsers(role)) && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#475569]">Total Books</CardTitle>
              <BookOpen className="h-4 w-4 text-[#94A3B8]" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-[#0F172A]">{totalBooks}</p>
              <p className="text-xs text-[#475569]">In catalog</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#475569]">Borrowed Now</CardTitle>
              <ClipboardList className="h-4 w-4 text-[#94A3B8]" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-[#0F172A]">{borrowedCount}</p>
              <p className="text-xs text-[#475569]">Active loans</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#475569]">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-[#94A3B8]" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-[#0F172A]">{overdueCount}</p>
              <p className="text-xs text-[#475569]">Past due date</p>
            </CardContent>
          </Card>
          {canManageUsers(role) && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#475569]">Users</CardTitle>
                <Users className="h-4 w-4 text-[#94A3B8]" />
              </CardHeader>
              <CardContent>
                <Link
                  href="/admin/users"
                  className="text-2xl font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline"
                >
                  Manage
                </Link>
                <p className="text-xs text-[#475569]">Roles & permissions</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {role === "MEMBER" && (
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Browse books or view your current loans</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Link
              href="/books"
              className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-medium text-[#0F172A] hover:bg-[#F1F5F9] transition-colors duration-200"
            >
              <BookOpen className="h-4 w-4" />
              Browse books
            </Link>
            <Link
              href="/loans"
              className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-medium text-[#0F172A] hover:bg-[#F1F5F9] transition-colors duration-200"
            >
              <ClipboardList className="h-4 w-4" />
              My loans
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
