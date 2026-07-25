import NextAuth, { NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { User } from "@/models";
import { connectToDatabase } from "@/lib/db";
import type { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
    providers: [
        // Email/Password Provider
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                try {
                    await connectToDatabase();

                    // Find user with email
                    const user = await User.findOne({ email: credentials.email }).select("+password");

                    if (!user) {
                        throw new Error("Invalid email or password");
                    }

                    // Check if email is verified
                    if (!user.emailVerified) {
                        throw new Error("Please verify your email before logging in");
                    }

                    // Compare password
                    const isPasswordValid = await user.comparePassword(credentials.password);
                    if (!isPasswordValid) {
                        throw new Error("Invalid email or password");
                    }

                    // Update last login
                    user.lastLogin = new Date();
                    await user.save();

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        image: user.image,
                    };
                } catch (error: any) {
                    throw new Error(error.message || "Authentication failed");
                }
            },
        }),

        // Google Provider
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: true,
        }),
    ],

    callbacks: {
        // Handle JWT token creation/update
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
            }

            // Handle OAuth sign-in
            if (account?.provider === "google" && user) {
                try {
                    await connectToDatabase();

                    // Find or create user for Google OAuth
                    let dbUser = await User.findOne({ email: user.email });

                    if (!dbUser) {
                        // Create new user from Google OAuth
                        const username = user.email?.split("@")[0] || user.name?.replace(/\s+/g, "").toLowerCase();
                        dbUser = await User.create({
                            googleId: user.id,
                            email: user.email,
                            name: user.name,
                            image: user.image,
                            username: username,
                            authProvider: "google",
                            emailVerified: true, // Auto-verify for Google OAuth
                            profileCompleted: false, // Ask user to complete profile
                        });
                    } else if (!dbUser.googleId) {
                        // Link Google account to existing user
                        dbUser.googleId = user.id;
                        dbUser.authProvider = "google";
                        dbUser.image = user.image || dbUser.image;
                        await dbUser.save();
                    }

                    token.id = dbUser._id.toString();
                    token.profileCompleted = dbUser.profileCompleted;
                } catch (error) {
                    console.error("Google OAuth callback error:", error);
                }
            }

            return token;
        },

        // Update session with token data
        async session({ session, token }: { session: Session; token: JWT }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },

        // Handle sign-in event
        async signIn({ user, account }) {
            try {
                await connectToDatabase();

                if (account?.provider === "credentials") {
                    // Credentials provider: already verified in authorize callback
                    return true;
                }

                if (account?.provider === "google") {
                    // Google provider: always allow (user created/updated in JWT callback)
                    return true;
                }

                return false;
            } catch (error) {
                console.error("SignIn callback error:", error);
                return false;
            }
        },
    },

    pages: {
        signIn: "/auth/login",
        error: "/auth/error",
    },

    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    jwt: {
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    secret: process.env.NEXTAUTH_SECRET,

    debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
