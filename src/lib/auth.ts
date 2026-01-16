import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { connectDB } from "@/lib/db";
import AllowedEmail from "@/models/AllowedEmail";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,

  callbacks: {
    async signIn({ user, account }) {
      await connectDB();

      if (!user.email) return false;

      // Check if email is allowed
      const allowed = await AllowedEmail.findOne({
        email: user.email,
      });

      if (!allowed) return false;

      // Handle Credentials provider
      if (account?.provider === "credentials") {
        const password = (user as any).password;
        if (!password) return false;

        // Check if user exists with password
        const existingUser = await User.findOne({ email: user.email }).select("+password");

        if (existingUser && existingUser.password) {
          // Verify password for returning user
          const isValid = await bcrypt.compare(password, existingUser.password);
          if (!isValid) return false;
        } else {
          // First time credentials login - create user with hashed password
          const hashedPassword = await bcrypt.hash(password, 12);
          await User.create({
            name: user.name || user.email.split("@")[0],
            email: user.email,
            password: hashedPassword,
            role: allowed.role,
          });
        }
      }
      // Handle OAuth (Google)
      else {
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            role: allowed.role,
          });
        }
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
