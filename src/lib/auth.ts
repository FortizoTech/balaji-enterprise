import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                        // @ts-ignore - Local Prisma client is stale; 'password' exists in DB and will be generated on Vercel
                        password: true,
                    }
                }) as any;

                if (!user || !user.password) return null;

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            }
        }),
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
    pages: {
        signIn: "/auth/login",
        newUser: "/auth/register",
    },
    callbacks: {
        async jwt({ token, user, account }) {
            // Initial sign in
            if (user) {
                token.sub = user.id;
                token.role = (user as any).role || "USER";
                console.log(`[AUTH JWT] Initial sign-in for ${user.email}, role: ${token.role}`);
            }

            // Always ensure role is present in session if we have a sub
            if (token.sub && !token.role) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.sub as string },
                    select: { role: true }
                });
                if (dbUser) {
                    token.role = dbUser.role;
                    console.log(`[AUTH JWT] Fetched missing role for ${token.email}: ${token.role}`);
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token?.sub && session.user) {
                (session.user as any).id = token.sub;
                (session.user as any).role = token.role || "USER";
            }
            return session;
        },
    },
};
