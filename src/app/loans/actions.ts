"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";
import { loanSchema } from "@/lib/validators";

export async function checkoutBook(formData: FormData) {
  const session = await requireRole(["ADMIN", "LIBRARIAN"]);
  const bookId = formData.get("bookId") as string;
  const userId = formData.get("userId") as string;
  const dueDays = formData.get("dueDays") ? Number(formData.get("dueDays")) : 14;
  const parsed = loanSchema.safeParse({ bookId, userId, dueDays });
  if (!parsed.success) return { error: "Invalid input" };

  const [book, borrower] = await Promise.all([
    prisma.book.findFirst({ where: { id: bookId, deletedAt: null } }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
  ]);
  if (!book) return { error: "Book not found" };
  if (book.status === "BORROWED") return { error: "Book is already borrowed" };

  const borrowerLabel = borrower?.name ?? borrower?.email ?? "Unknown";

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + parsed.data.dueDays);

  const loan = await prisma.loan.create({
    data: {
      bookId,
      userId,
      dueDate,
    },
  });
  await prisma.book.update({
    where: { id: bookId },
    data: { status: "BORROWED" },
  });
  await createAuditLog({
    userId: session.user.id,
    action: "LOAN_CHECKOUT",
    entity: "Loan",
    entityId: loan.id,
    details: `Book ${book.title} → ${borrowerLabel}`,
  });
  revalidatePath("/loans");
  revalidatePath("/loans/manage");
  revalidatePath("/books");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function returnLoan(loanId: string) {
  const session = await requireRole(["ADMIN", "LIBRARIAN"]);
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: { book: true },
  });
  if (!loan || loan.returnedAt) return { error: "Loan not found or already returned" };

  await prisma.loan.update({
    where: { id: loanId },
    data: { returnedAt: new Date() },
  });
  await prisma.book.update({
    where: { id: loan.bookId },
    data: { status: "AVAILABLE" },
  });
  await createAuditLog({
    userId: session.user.id,
    action: "LOAN_RETURN",
    entity: "Loan",
    entityId: loanId,
    details: `Book ${loan.book.title} returned`,
  });
  revalidatePath("/loans");
  revalidatePath("/loans/manage");
  revalidatePath("/books");
  revalidatePath("/dashboard");
  return { success: true };
}
