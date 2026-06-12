import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { z } from "zod";

declare module "next-auth" {
  interface Session {
    user: { id: string; role: string; mustChangePassword: boolean } & DefaultSession["user"];
  }
  interface User {
    role?: string;
    mustChangePassword?: boolean;
  }
}

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        await connectDB();
        const user = await User.findOne({ username: parsed.data.username }).lean();
        if (!user) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          name: user.username,
          email: user.email,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.mustChangePassword = user.mustChangePassword;
      }
      if (trigger === "update" && session?.mustChangePassword === false) {
        token.mustChangePassword = false;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.mustChangePassword = token.mustChangePassword as boolean;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});
