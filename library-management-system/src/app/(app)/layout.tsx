import { requireAuth } from "@/lib/rbac";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <AppShell user={session.user}>
      <div className="mx-auto max-w-5xl">{children}</div>
    </AppShell>
  );
}
