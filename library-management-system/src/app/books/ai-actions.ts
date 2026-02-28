"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export async function updateBookDescription(bookId: string, description: string) {
  await requireRole(["ADMIN", "LIBRARIAN"]);
  await prisma.book.update({
    where: { id: bookId },
    data: { description: description.trim() || null },
  });
  revalidatePath(`/books/${bookId}`);
  return { success: true };
}

export async function updateBookTags(bookId: string, tagNames: string[]) {
  await requireRole(["ADMIN", "LIBRARIAN"]);
  const tags = await Promise.all(
    tagNames.map((name) =>
      prisma.tag.upsert({
        where: { name },
        create: { name },
        update: {},
      })
    )
  );
  await prisma.bookTag.deleteMany({ where: { bookId } });
  await prisma.book.update({
    where: { id: bookId },
    data: {
      tags: {
        create: tags.map((t) => ({ tagId: t.id })),
      },
    },
  });
  revalidatePath(`/books/${bookId}`);
  return { success: true };
}
