import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { User } from "@/models";
import { connectToDatabase } from "@/lib/db";
import { registerSchema } from "@/lib/validations/user";
import { sendVerificationEmail } from "@/lib/email/sendVerificationEmail";

export async function POST(req: NextRequest) {
    // ✅ Fix 1: handle malformed JSON explicitly
    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { success: false, message: "Invalid JSON body" },
            { status: 400 }
        );
    }

    try {
        const parsed = registerSchema.safeParse(body);
        if (!parsed.success) {
            const firstIssue = parsed.error.issues[0];
            return NextResponse.json(
                { success: false, message: firstIssue.message },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // ✅ Fix 3: generate a verification token before creating the user
        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

        const user = await User.create({
            ...parsed.data,
            emailVerified: false,
            emailVerificationToken: hashedToken,
            emailVerificationExpires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
        });

        // Send the raw (unhashed) token in the email link — never the hashed one
        await sendVerificationEmail(user.email, rawToken);

        // ✅ Fix 2: strip sensitive/internal fields explicitly at the response boundary
        const safeUser = user.toObject();
        delete safeUser.password;
        delete safeUser.emailVerificationToken;
        delete safeUser.emailVerificationExpires;

        return NextResponse.json(
            {
                success: true,
                message: "Registered successfully. Please check your email to verify your account.",
                user: safeUser,
            },
            { status: 201 }
        );
    } catch (err: any) {
        if (err.name === "ValidationError") {
            const firstError = Object.values(err.errors)[0] as any;
            return NextResponse.json(
                { success: false, message: firstError.message },
                { status: 400 }
            );
        }

        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return NextResponse.json(
                { success: false, message: `${field} is already taken` },
                { status: 409 }
            );
        }

        console.error("Registration error:", err);
        return NextResponse.json(
            { success: false, message: "Registration failed" },
            { status: 500 }
        );
    }
}