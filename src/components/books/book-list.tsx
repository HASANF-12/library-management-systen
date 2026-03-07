import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  status: string;
  coverImageUrl: string | null;
  tags: { tag: { name: string } }[];
};

export function BookList({
  books,
  canManage,
}: {
  books: Book[];
  canManage: boolean;
}) {
  if (books.length === 0) {
    return (
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-16 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-[#CBD5E1]" />
        <p className="mt-4 text-sm text-[#475569]">
          No books found. Try adjusting your search or add a book if you have permission.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <tr>
              <th className="w-12 px-2 py-2 font-semibold text-[#0F172A]">Cover</th>
              <th className="px-4 py-2 font-semibold text-[#0F172A]">Title</th>
              <th className="px-4 py-2 font-semibold text-[#0F172A]">Author</th>
              <th className="px-4 py-2 font-semibold text-[#0F172A]">Status</th>
              <th className="px-4 py-2 font-semibold text-[#0F172A]">Tags</th>
              {canManage && (
                <th className="px-4 py-2 font-semibold text-[#0F172A]">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {books.map((book, i) => (
              <tr
                key={book.id}
                className={`border-b border-[#E2E8F0] last:border-0 transition-colors duration-200 ${
                  i % 2 === 0 ? "hover:bg-[#F8FAFC]" : "hover:bg-[#F1F5F9]"
                }`}
              >
                <td className="w-18 px-2 py-2 align-middle">
                  {book.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.coverImageUrl}
                      alt=""
                      className="h-20 w-15 shrink-0 rounded border border-[#E2E8F0] object-cover"
                    />
                  ) : (
                    <div className="h-20 w-15 shrink-0 rounded border border-[#E2E8F0] bg-[#F1F5F9]" />
                  )}
                </td>
                <td className="px-4 py-2">
                  <Link
                    href={`/books/${book.id}`}
                    className="font-medium text-[#2563EB] hover:text-[#1D4ED8] hover:underline"
                  >
                    {book.title}
                  </Link>
                </td>
                <td className="px-4 py-2 text-[#475569]">{book.author}</td>
                <td className="px-4 py-2">
                  <Badge
                    variant={
                      book.status === "AVAILABLE"
                        ? "available"
                        : "borrowed"
                    }
                  >
                    {book.status}
                  </Badge>
                </td>
                <td className="px-4 py-2 text-[#475569]">
                  {book.tags.map((t) => t.tag.name).join(", ") || "—"}
                </td>
                {canManage && (
                  <td className="px-4 py-2">
                    <Link
                      href={`/books/${book.id}/edit`}
                      className="text-[#2563EB] hover:text-[#1D4ED8] hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
