import { prisma } from "@/lib/prisma";

type AuditAction =
  | "BOOK_CREATED"
  | "BOOK_UPDATED"
  | "BOOK_DELETED"
  | "LOAN_CHECKOUT"
  | "LOAN_RETURN"
  | "ROLE_CHANGED"
  | "USER_UPDATED";

/** Create an audit log entry. details should use human-readable names (or emails), never user IDs. */
export async function createAuditLog(params: {
  userId: string | null;
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  details?: string | null;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId ?? undefined,
      details: params.details ?? undefined,
    },
  });
}
