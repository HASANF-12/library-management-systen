import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignInButton } from "./sign-in-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const { callbackUrl } = await searchParams;
  const redirectTo = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";
  const googleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F1F5F9] px-4">
      <div className="w-full max-w-sm space-y-8 rounded-lg border border-[#E2E8F0] bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">
            Mini Library
          </h1>
          <p className="mt-2 text-sm text-[#475569]">
            Sign in to access the library management system
          </p>
        </div>
        <SignInButton callbackUrl={redirectTo} configured={googleConfigured} />
        <p className="text-center text-xs text-[#475569]">
          By signing in you agree to use Google SSO. No password stored.
        </p>
      </div>
      <p className="mt-6 text-sm text-[#475569]">
        <Link href="/" className="text-[#2563EB] hover:text-[#1D4ED8] hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
