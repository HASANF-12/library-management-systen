import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/loans/checkout-form";
import { ReturnLoanButton } from "@/components/loans/return-loan-button";
import { ManageLoansFilter } from "@/components/loans/manage-loans-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

export default async function ManageLoansPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; borrower?: string }>;
}) {
  await requireRole(["ADMIN", "LIBRARIAN"]);
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const borrower = (params.borrower ?? "").trim();
  const skip = (page - 1) * PAGE_SIZE;

  const where: { returnedAt: null; user?: { OR: { name?: { contains: string; mode: "insensitive" }; email?: { contains: string; mode: "insensitive" } }[] } } = { returnedAt: null };
  if (borrower) {
    where.user = {
      OR: [
        { name: { contains: borrower, mode: "insensitive" } },
        { email: { contains: borrower, mode: "insensitive" } },
      ],
    };
  }

  const [activeLoans, total, users, availableBooks] = await Promise.all([
    prisma.loan.findMany({
      where,
      include: { book: true, user: true },
      orderBy: { dueDate: "asc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.loan.count({ where }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.book.findMany({
      where: { deletedAt: null, status: "AVAILABLE" },
      select: { id: true, title: true, author: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">Manage loans</h1>
        <p className="text-sm text-[#475569]">Check out books to members and mark returns</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Check out a book</CardTitle>
        </CardHeader>
        <CardContent>
          <CheckoutForm users={users} books={availableBooks} />
        </CardContent>
      </Card>

      <ManageLoansFilter defaultBorrower={borrower} />

      <Card>
        <CardHeader>
          <CardTitle>Active loans</CardTitle>
        </CardHeader>
        <CardContent>
          {activeLoans.length === 0 ? (
            <p className="py-6 text-center text-[#475569]">No active loans.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    <th className="px-4 py-2 font-semibold text-[#0F172A]">Book</th>
                    <th className="px-4 py-2 font-semibold text-[#0F172A]">Borrower</th>
                    <th className="px-4 py-2 font-semibold text-[#0F172A]">Due date</th>
                    <th className="px-4 py-2 font-semibold text-[#0F172A]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeLoans.map((loan) => (
                    <tr key={loan.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-2">
                        <span className="font-medium text-[#0F172A]">{loan.book.title}</span>
                        <span className="text-[#475569]"> — {loan.book.author}</span>
                      </td>
                      <td className="px-4 py-2 text-[#475569]">
                        {loan.user.name ?? loan.user.email ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-[#475569]">{loan.dueDate.toLocaleDateString()}</td>
                      <td className="px-4 py-2">
                        <ReturnLoanButton loanId={loan.id} />
                      </td>
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
                  <Link href={`/loans/manage?${borrower ? `borrower=${encodeURIComponent(borrower)}&` : ""}page=${page - 1}`}>
                    <Button variant="outline" size="sm">Previous</Button>
                  </Link>
                )}
                {page * PAGE_SIZE < total && (
                  <Link href={`/loans/manage?${borrower ? `borrower=${encodeURIComponent(borrower)}&` : ""}page=${page + 1}`}>
                    <Button variant="outline" size="sm">Next</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
