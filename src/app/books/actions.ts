"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";
import { bookSchema } from "@/lib/validators";

export async function createBook(formData: FormData) {
  const session = await requireRole(["ADMIN", "LIBRARIAN"]);
  const raw = {
    title: formData.get("title") as string,
    author: formData.get("author") as string,
    isbn: (formData.get("isbn") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
    publishedYear: formData.get("publishedYear")
      ? Number(formData.get("publishedYear"))
      : undefined,
    coverImageUrl: (formData.get("coverImageUrl") as string) || undefined,
    tags: formData.get("tags") ? (formData.get("tags") as string).split(",").map((t) => t.trim()).filter(Boolean) : [],
  };
  const parsed = bookSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;
  const tagNames = data.tags ?? [];
  const tags = await Promise.all(
    tagNames.map((name) =>
      prisma.tag.upsert({
        where: { name },
        create: { name },
        update: {},
      })
    )
  );
  const book = await prisma.book.create({
    data: {
      title: data.title,
      author: data.author,
      isbn: data.isbn || null,
      description: data.description || null,
      publishedYear: data.publishedYear ?? null,
      coverImageUrl: data.coverImageUrl || null,
      status: "AVAILABLE",
      tags: {
        create: tags.map((t) => ({ tagId: t.id })),
      },
    },
  });
  await createAuditLog({
    userId: session.user.id,
    action: "BOOK_CREATED",
    entity: "Book",
    entityId: book.id,
    details: book.title,
  });
  revalidatePath("/books");
  revalidatePath("/dashboard");
  return { success: true, id: book.id };
}

export async function updateBook(id: string, formData: FormData) {
  const session = await requireRole(["ADMIN", "LIBRARIAN"]);
  const raw = {
    title: formData.get("title") as string,
    author: formData.get("author") as string,
    isbn: (formData.get("isbn") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
    publishedYear: formData.get("publishedYear")
      ? Number(formData.get("publishedYear"))
      : undefined,
    coverImageUrl: (formData.get("coverImageUrl") as string) || undefined,
    tags: formData.get("tags") ? (formData.get("tags") as string).split(",").map((t) => t.trim()).filter(Boolean) : [],
  };
  const parsed = bookSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;
  const tagNames = data.tags ?? [];
  const tags = await Promise.all(
    tagNames.map((name) =>
      prisma.tag.upsert({
        where: { name },
        create: { name },
        update: {},
      })
    )
  );
  await prisma.bookTag.deleteMany({ where: { bookId: id } });
  await prisma.book.update({
    where: { id },
    data: {
      title: data.title,
      author: data.author,
      isbn: data.isbn || null,
      description: data.description || null,
      publishedYear: data.publishedYear ?? null,
      coverImageUrl: data.coverImageUrl || null,
      tags: {
        create: tags.map((t) => ({ tagId: t.id })),
      },
    },
  });
  await createAuditLog({
    userId: session.user.id,
    action: "BOOK_UPDATED",
    entity: "Book",
    entityId: id,
    details: data.title,
  });
  revalidatePath("/books");
  revalidatePath(`/books/${id}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteBook(id: string) {
  const session = await requireRole(["ADMIN", "LIBRARIAN"]);
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) return { error: "Book not found" };
  await prisma.book.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  await createAuditLog({
    userId: session.user.id,
    action: "BOOK_DELETED",
    entity: "Book",
    entityId: id,
    details: book.title,
  });
  revalidatePath("/books");
  revalidatePath("/dashboard");
  return { success: true };
}
