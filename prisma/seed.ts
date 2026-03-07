import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");

  const admin = await prisma.user.upsert({
    where: { email: "admin@library.local" },
    update: {},
    create: {
      email: "admin@library.local",
      name: "Admin User",
      role: "ADMIN",
    },
  });
  const librarian = await prisma.user.upsert({
    where: { email: "librarian@library.local" },
    update: {},
    create: {
      email: "librarian@library.local",
      name: "Librarian User",
      role: "LIBRARIAN",
    },
  });
  const member = await prisma.user.upsert({
    where: { email: "member@library.local" },
    update: {},
    create: {
      email: "member@library.local",
      name: "Member User",
      role: "MEMBER",
    },
  });

  const tags = await Promise.all(
    ["fiction", "non-fiction", "sci-fi", "history", "programming"].map((name) =>
      prisma.tag.upsert({ where: { name }, create: { name }, update: {} })
    )
  );

  let booksCount = 0;
  if ((await prisma.book.count()) === 0) {
    await prisma.book.create({
      data: {
        title: "The Pragmatic Programmer",
        author: "David Thomas, Andrew Hunt",
        isbn: "978-0135957059",
        description: "One of the most significant books in my life.",
        publishedYear: 2019,
        status: "AVAILABLE",
        tags: { create: [{ tagId: tags[4].id }] },
      },
    });
    await prisma.book.create({
      data: {
        title: "Clean Code",
        author: "Robert C. Martin",
        isbn: "978-0132350884",
        description: "A Handbook of Agile Software Craftsmanship.",
        publishedYear: 2008,
        status: "AVAILABLE",
        tags: { create: [{ tagId: tags[4].id }] },
      },
    });
    await prisma.book.create({
      data: {
        title: "Dune",
        author: "Frank Herbert",
        description: "Science fiction novel set in the far future.",
        publishedYear: 1965,
        status: "AVAILABLE",
        tags: { create: [{ tagId: tags[2].id }] },
      },
    });
    booksCount = 3;
  }

  console.log("Seeded users:", { admin: admin.email, librarian: librarian.email, member: member.email });
  console.log("Seeded books:", booksCount);
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
