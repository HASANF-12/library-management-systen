import { z } from "zod";

export const bookSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  author: z.string().min(1, "Author is required").max(200),
  isbn: z.string().max(20).optional().or(z.literal("")),
  description: z.string().max(5000).optional().or(z.literal("")),
  publishedYear: z.coerce.number().int().min(1000).max(2100).optional().nullable(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string().max(50)).optional().default([]),
});

export const loanSchema = z.object({
  bookId: z.string().cuid(),
  userId: z.string().cuid(),
  dueDays: z.coerce.number().int().min(1).max(365).default(14),
});

export const roleSchema = z.enum(["ADMIN", "LIBRARIAN", "MEMBER"]);

export type BookInput = z.infer<typeof bookSchema>;
export type LoanInput = z.infer<typeof loanSchema>;
