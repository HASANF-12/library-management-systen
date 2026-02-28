import { requireRole } from "@/lib/rbac";
import { BookForm } from "@/components/books/book-form";

export default async function NewBookPage() {
  await requireRole(["ADMIN", "LIBRARIAN"]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Add book</h1>
      <BookForm />
    </div>
  );
}
