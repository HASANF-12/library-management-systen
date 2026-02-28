import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AuditFilter } from "@/components/admin/audit-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 50;

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string; user?: string; from?: string; to?: string }>;
}) {
  await requireRole(["ADMIN", "LIBRARIAN"]);
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const action = (params.action ?? "").trim();
  const user = (params.user ?? "").trim();
  const from = params.from;
  const to = params.to;
  const skip = (page - 1) * PAGE_SIZE;

  const where: { action?: string; user?: { OR: { name?: { contains: string; mode: "insensitive" }; email?: { contains: string; mode: "insensitive" } }[] }; createdAt?: { gte?: Date; lte?: Date } } = {};
  if (action) where.action = action;
  if (user) {
    where.user = {
      OR: [
        { name: { contains: user, mode: "insensitive" } },
        { email: { contains: user, mode: "insensitive" } },
      ],
    };
  }
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from + "T00:00:00");
    if (to) where.createdAt.lte = new Date(to + "T23:59:59");
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count({ where: Object.keys(where).length ? where : undefined }),
  ]);

  const query = (p: number) => {
    const sp = new URLSearchParams();
    if (params.action) sp.set("action", params.action);
    if (params.user) sp.set("user", params.user);
    if (params.from) sp.set("from", params.from);
    if (params.to) sp.set("to", params.to);
    sp.set("page", String(p));
    return sp.toString();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">Activity log</h1>
      <AuditFilter defaultAction={action} defaultUser={user} defaultFrom={from ?? ""} defaultTo={to ?? ""} />
      <Card>
        <CardHeader>
          <CardTitle>Recent actions</CardTitle>
          <CardContent className="pt-0">
            {logs.length === 0 ? (
              <p className="py-6 text-center text-[#475569]">No activity yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    <th className="px-4 py-2 font-semibold text-[#0F172A]">Time</th>
                    <th className="px-4 py-2 font-semibold text-[#0F172A]">User</th>
                    <th className="px-4 py-2 font-semibold text-[#0F172A]">Action</th>
                    <th className="px-4 py-2 font-semibold text-[#0F172A]">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-2 text-[#475569]">
                        {log.createdAt.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-[#0F172A]">
                        {log.user?.name ?? log.user?.email ?? "—"}
                      </td>
                      <td className="px-4 py-2 font-medium text-[#0F172A]">{log.action}</td>
                      <td className="px-4 py-2 text-[#475569]">{log.details ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {total > PAGE_SIZE && (
              <div className="mt-4 flex items-center justify-between border-t border-[#E2E8F0] pt-4">
                <p className="text-sm text-[#475569]">
                  Page {page} — showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
                </p>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Link href={`/admin/audit?${query(page - 1)}`}>
                      <Button variant="outline" size="sm">Previous</Button>
                    </Link>
                  )}
                  {page * PAGE_SIZE < total && (
                    <Link href={`/admin/audit?${query(page + 1)}`}>
                      <Button variant="outline" size="sm">Next</Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
}
