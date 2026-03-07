import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MyLoansFilter } from "@/components/loans/my-loans-filter";

export default async function MyLoansPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await requireAuth();
  const params = await searchParams;
  const filter = params.filter ?? "all";

  const now = new Date();
  const dueSoonEnd = new Date();
  dueSoonEnd.setDate(dueSoonEnd.getDate() + 7);

  const where: { userId: string; returnedAt: null; dueDate?: { lt?: Date; gte?: Date; lte?: Date } } = {
    userId: session.user.id,
    returnedAt: null,
  };
  if (filter === "overdue") {
    where.dueDate = { lt: now };
  } else if (filter === "due_soon") {
    where.dueDate = { gte: now, lte: dueSoonEnd };
  }

  const loans = await prisma.loan.findMany({
    where,
    include: { book: true },
    orderBy: { dueDate: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">My loans</h1>
      <MyLoansFilter defaultFilter={filter} />
      {loans.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-[#475569]">
            You have no active loans.
            {filter !== "all" && (
              <span> Try <Link href="/loans" className="text-[#2563EB] hover:underline">all loans</Link>.</span>
            )}
            {filter === "all" && (
              <> <Link href="/books" className="text-[#2563EB] hover:underline">Browse books</Link></>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="px-4 py-2 font-semibold text-[#0F172A]">Book</th>
                  <th className="px-4 py-2 font-semibold text-[#0F172A]">Borrowed</th>
                  <th className="px-4 py-2 font-semibold text-[#0F172A]">Due date</th>
                  <th className="px-4 py-2 font-semibold text-[#0F172A]">Status</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => {
                  const overdue = loan.dueDate < now;
                  const dueSoon = !overdue && loan.dueDate <= dueSoonEnd;
                  return (
                    <tr key={loan.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-2">
                        <Link href={`/books/${loan.book.id}`} className="font-medium text-[#2563EB] hover:underline">
                          {loan.book.title}
                        </Link>
                        <span className="text-[#475569]"> — {loan.book.author}</span>
                      </td>
                      <td className="px-4 py-2 text-[#475569]">{loan.borrowedAt.toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-[#475569]">{loan.dueDate.toLocaleDateString()}</td>
                      <td className="px-4 py-2">
                        <Badge variant={overdue ? "overdue" : dueSoon ? "borrowed" : "available"}>
                          {overdue ? "Overdue" : dueSoon ? "Due soon" : "On track"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
