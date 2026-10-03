import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.adminUser.findUnique({
          where: { email },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized: async ({ auth, request: { nextUrl } }) => {
      const isAdminRoute = nextUrl.pathname.startsWith("/admin") && nextUrl.pathname !== "/admin/login";
      if (isAdminRoute && !auth) return false;
      return true;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export async function requireAdmin() {
  const session = await auth();
  return session ? null : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
