import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Return minimal user object - full validation in signIn callback
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        return {
          id: "temp",
          email: credentials.email as string,
          password: credentials.password as string,
        } as any;
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },
};
