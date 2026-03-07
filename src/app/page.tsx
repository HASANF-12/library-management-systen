import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F1F5F9] px-4">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-[#0F172A]">
          Mini Library Management System
        </h1>
        <p className="mt-2 text-[#475569]">
          Manage books, loans, and members with role-based access.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {session?.user ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors duration-200"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors duration-200"
            >
              Sign in with Google
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
