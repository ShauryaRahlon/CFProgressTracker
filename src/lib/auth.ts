import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { connectDB } from "@/lib/db";
import AllowedEmail from "@/models/AllowedEmail";
import User from "@/models/User";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,

  callbacks: {
    async signIn({ user }) {
      await connectDB();

      if (!user.email) return false;

      const allowed = await AllowedEmail.findOne({
        email: user.email,
      });

      if (!allowed) return false;

      const existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        await User.create({
          name: user.name,
          email: user.email,
          role: allowed.role,
        });
      }

      return true;
    },

    async session({ session }) {
      await connectDB();

      if (!session.user?.email) return session;

      const dbUser = await User.findOne({
        email: session.user.email,
      });

      if (dbUser) {
        session.user.role = dbUser.role;
      }

      return session;
    },
  },
});
