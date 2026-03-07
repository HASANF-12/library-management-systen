import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { UpdateRoleForm } from "@/components/admin/update-role-form";
import { UsersFilter } from "@/components/admin/users-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Role } from "@prisma/client";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; email?: string; role?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const email = (params.email ?? "").trim();
  const role = params.role ?? "";

  const where: { name?: { contains: string; mode: "insensitive" }; email?: { contains: string; mode: "insensitive" }; role?: Role } = {};
  if (q) where.name = { contains: q, mode: "insensitive" };
  if (email) where.email = { contains: email, mode: "insensitive" };
  if (role && ["ADMIN", "LIBRARIAN", "MEMBER"].includes(role)) where.role = role as Role;

  const users = await prisma.user.findMany({
    where: Object.keys(where).length ? where : undefined,
    orderBy: [{ name: "asc" }, { email: "asc" }],
    select: { id: true, name: true, email: true, image: true, role: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">Users & roles</h1>
      <UsersFilter defaultQ={q} defaultEmail={email} defaultRole={role} />
      <Card>
        <CardHeader>
          <CardTitle>All users</CardTitle>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    <th className="px-4 py-2 font-semibold text-[#0F172A]">User</th>
                    <th className="px-4 py-2 font-semibold text-[#0F172A]">Email</th>
                    <th className="px-4 py-2 font-semibold text-[#0F172A]">Role</th>
                    <th className="px-4 py-2 font-semibold text-[#0F172A]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-2 text-[#0F172A]">{user.name ?? "—"}</td>
                      <td className="px-4 py-2 text-[#475569]">{user.email ?? "—"}</td>
                      <td className="px-4 py-2 text-[#475569]">{user.role}</td>
                      <td className="px-4 py-2">
                        <UpdateRoleForm userId={user.id} currentRole={user.role} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
}
