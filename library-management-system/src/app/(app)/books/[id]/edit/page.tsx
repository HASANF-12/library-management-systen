import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BookForm } from "@/components/books/book-form";

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN", "LIBRARIAN"]);
  const { id } = await params;
  const book = await prisma.book.findFirst({
    where: { id, deletedAt: null },
    include: { tags: { include: { tag: true } } },
  });
  if (!book) notFound();

  const initial = {
    title: book.title,
    author: book.author,
    isbn: book.isbn ?? "",
    description: book.description ?? "",
    publishedYear: book.publishedYear ?? undefined,
    coverImageUrl: book.coverImageUrl ?? "",
    tags: book.tags.map((t) => t.tag.name).join(", "),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Edit book</h1>
      <BookForm bookId={id} initial={initial} />
    </div>
  );
}
