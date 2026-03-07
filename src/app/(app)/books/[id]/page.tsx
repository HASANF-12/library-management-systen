import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { canManageBooks } from "@/lib/rbac";
import { BookActions } from "@/components/books/book-actions";
import { ImproveDescriptionButton } from "@/components/books/improve-description-button";
import { SuggestTagsButton } from "@/components/books/suggest-tags-button";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();
  const book = await prisma.book.findFirst({
    where: { id, deletedAt: null },
    include: { tags: { include: { tag: true } } },
  });
  if (!book) notFound();

  const canManage = canManageBooks(session.user.role);
  const hasAi = !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/books" className="text-sm text-[#475569] hover:text-[#2563EB] hover:underline">
          ← Back to books
        </Link>
        {canManage && (
          <div className="flex gap-2">
            <Link href={`/books/${id}/edit`}>
              <Button variant="outline">Edit</Button>
            </Link>
            <BookActions bookId={id} bookTitle={book.title} />
          </div>
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="space-y-1 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-semibold tracking-tight text-[#0F172A]">{book.title}</h1>
                  <p className="text-[#475569]">{book.author}</p>
                </div>
                <Badge variant={book.status === "AVAILABLE" ? "available" : "borrowed"}>
                  {book.status}
                </Badge>
              </div>
              {(book.isbn || book.publishedYear) && (
                <p className="text-sm text-zinc-500">
                  {[book.isbn && `ISBN ${book.isbn}`, book.publishedYear].filter(Boolean).join(" · ")}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0 sm:p-5 sm:pt-0">
              {book.coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- external cover URLs
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  className="h-36 w-24 shrink-0 rounded border border-[#E2E8F0] object-cover"
                />
              )}
              {book.description ? (
                <p className="whitespace-pre-wrap text-[#475569] leading-relaxed">{book.description}</p>
              ) : (
                <p className="text-[#475569]">No description.</p>
              )}
              {book.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {book.tags.map((t) => (
                    <Badge key={t.tag.id} variant="outline">
                      {t.tag.name}
                    </Badge>
                  ))}
                </div>
              )}
              {canManage && hasAi && (
                <div className="flex flex-wrap gap-2 border-t border-[#E2E8F0] pt-4">
                  <ImproveDescriptionButton bookId={id} currentDescription={book.description ?? ""} />
                  <SuggestTagsButton
                    bookId={id}
                    title={book.title}
                    author={book.author}
                    description={book.description ?? ""}
                  />
                </div>
              )}
              {canManage && !hasAi && (
                <p className="text-sm text-zinc-500">
                  Set OPENAI_API_KEY in env to enable AI description and tag suggestions.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader className="p-4 sm:p-5">
              <h2 className="text-sm font-medium text-[#0F172A]">Availability</h2>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
              {book.status === "AVAILABLE" ? (
                <p className="text-sm text-[#475569]">This book is available to borrow.</p>
              ) : (
                <p className="text-sm text-[#475569]">Currently borrowed.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
