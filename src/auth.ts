import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type SafeUser = {
  id: string;
  email: string;
  name: string;
  currency?: string;
  payday15?: boolean;
  payday30?: boolean;
  salaryAmount?: number;
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        const salaryAmount = Number(user.salaryAmount ?? 0);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          currency: user.currency,
          salaryAmount,
          payday15: user.payday15,
          payday30: user.payday30,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const profile = user as SafeUser;
        token.sub = profile.id;
        token.email = profile.email;
        token.name = profile.name;
        (token as any).currency = profile.currency;
        (token as any).payday15 = profile.payday15 ?? false;
        (token as any).payday30 = profile.payday30 ?? false;
        (token as any).salaryAmount = profile.salaryAmount ?? 0;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        const tokenExtras = token as Record<string, unknown>;
        session.user.currency = tokenExtras.currency as string | undefined;
        session.user.payday15 = Boolean(tokenExtras.payday15);
        session.user.payday30 = Boolean(tokenExtras.payday30);
        session.user.salaryAmount = Number(tokenExtras.salaryAmount ?? 0);
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const publicPaths = ["/", "/login", "/register", "/api/auth"];
      const isPublic = publicPaths.some((path) =>
        pathname === path || pathname.startsWith(`${path}/`)
      );

      if (isPublic) return true;
      return !!auth;
    },
  },
  trustHost: true,
});
