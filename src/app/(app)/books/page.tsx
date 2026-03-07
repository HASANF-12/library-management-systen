import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { BookList } from "@/components/books/book-list";
import { BookSearchForm } from "@/components/books/book-search-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { canManageBooks } from "@/lib/rbac";

const PAGE_SIZE = 10;

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    author?: string;
    isbn?: string;
    tag?: string;
    status?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  await requireAuth();
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;
  const q = (params.q ?? "").trim();
  const author = (params.author ?? "").trim();
  const isbn = (params.isbn ?? "").trim();
  const tag = (params.tag ?? "").trim();
  const status = params.status ?? "";
  const sort = params.sort ?? "newest";

  const where: Prisma.BookWhereInput = {
    deletedAt: null,
  };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { author: { contains: q, mode: "insensitive" } },
      { isbn: q },
      { tags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
    ];
  }
  if (author) where.author = { contains: author, mode: "insensitive" };
  if (isbn) where.isbn = isbn;
  if (tag) where.tags = { some: { tag: { name: tag } } };
  if (status === "available") where.status = "AVAILABLE";
  if (status === "borrowed") where.status = "BORROWED";

  const orderBy =
    sort === "title"
      ? [{ title: "asc" as const }]
      : [{ createdAt: "desc" as const }];

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      orderBy,
      skip,
      take: PAGE_SIZE,
      include: {
        tags: { include: { tag: true } },
      },
    }),
    prisma.book.count({ where }),
  ]);

  const session = await requireAuth();
  const canManage = canManageBooks(session.user.role);

  const query = (p: number) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.author) sp.set("author", params.author);
    if (params.isbn) sp.set("isbn", params.isbn);
    if (params.tag) sp.set("tag", params.tag);
    if (params.status) sp.set("status", params.status);
    if (params.sort) sp.set("sort", params.sort);
    sp.set("page", String(p));
    return sp.toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">Books</h1>
        {canManage && (
          <Link href="/books/new">
            <Button>
              <Plus className="h-4 w-4" />
              Add book
            </Button>
          </Link>
        )}
      </div>
      <BookSearchForm
        defaultQ={q}
        defaultAuthor={author}
        defaultIsbn={isbn}
        defaultTag={tag}
        defaultStatus={status}
        defaultSort={sort}
      />
      <BookList books={books} canManage={canManage} />
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-4">
          <p className="text-sm text-[#475569]">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/books?${query(page - 1)}`}>
                <Button variant="outline" size="sm">Previous</Button>
              </Link>
            )}
            {page * PAGE_SIZE < total && (
              <Link href={`/books?${query(page + 1)}`}>
                <Button variant="outline" size="sm">Next</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
