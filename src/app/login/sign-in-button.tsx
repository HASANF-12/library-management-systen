"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignInButton({
  callbackUrl,
  configured,
}: {
  callbackUrl: string;
  configured: boolean;
}) {
  if (!configured) {
    return (
      <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-sm text-[#475569]">
        <p className="font-medium text-[#0F172A]">Google sign-in is not configured.</p>
        <p className="mt-1">
          Add <code className="rounded bg-[#E2E8F0] px-1.5 py-0.5 text-xs">GOOGLE_CLIENT_ID</code> and{" "}
          <code className="rounded bg-[#E2E8F0] px-1.5 py-0.5 text-xs">GOOGLE_CLIENT_SECRET</code> to{" "}
          <code className="rounded bg-[#E2E8F0] px-1.5 py-0.5 text-xs">.env.local</code>, then restart the dev server.
        </p>
        <p className="mt-2 text-xs">
          Get credentials from Google Cloud Console → APIs &amp; Services → Credentials → Create OAuth 2.0 Client ID (Web application). Add redirect URI: <code className="break-all text-[#0F172A]">{typeof window !== "undefined" ? `${window.location.origin}/api/auth/callback/google` : "http://localhost:3000/api/auth/callback/google"}</code>
        </p>
      </div>
    );
  }
  return (
    <Button
      className="w-full"
      size="lg"
      onClick={() => signIn("google", { callbackUrl })}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Sign in with Google
    </Button>
  );
}
