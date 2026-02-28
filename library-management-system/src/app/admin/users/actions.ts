"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";
import { roleSchema } from "@/lib/validators";
import type { Role } from "@prisma/client";

export async function updateUserRole(userId: string, role: Role) {
  const session = await requireRole(["ADMIN"]);
  const parsed = roleSchema.safeParse(role);
  if (!parsed.success) return { error: "Invalid role" };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User not found" };

  await prisma.user.update({
    where: { id: userId },
    data: { role: parsed.data },
  });
  await createAuditLog({
    userId: session.user.id,
    action: "ROLE_CHANGED",
    entity: "User",
    entityId: userId,
    details: `${user.name ?? user.email ?? "Unknown user"} → ${parsed.data}`,
  });
  revalidatePath("/admin/users");
  revalidatePath("/dashboard");
  return { success: true };
}
