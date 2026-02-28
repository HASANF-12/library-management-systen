import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
    };
  }
}

// JWT payload shape for callbacks (extends next-auth's JWT)
type JWTWithRole = { id?: string; role?: string; sub?: string };

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  // JWT strategy so auth() in Edge middleware doesn't need Prisma
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      const t = token as JWTWithRole;
      if (user) {
        t.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        t.role = dbUser?.role ?? "MEMBER";
      }
      return t;
    },
    async session({ session, token }) {
      const t = token as JWTWithRole;
      if (session.user) {
        session.user.id = typeof t.id === "string" ? t.id : (t.sub ?? "");
        session.user.role = (t.role as Role) ?? "MEMBER";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  events: {
    async createUser({ user }) {
      const count = await prisma.user.count();
      if (count === 1) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
        });
      }
    },
  },
});
