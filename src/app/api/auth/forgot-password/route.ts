import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { User } from "@/models";
import { connectToDatabase } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email/sendPasswordResetEmail";

export async function POST(req: NextRequest) {
    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { success: false, message: "Invalid JSON body" },
            { status: 400 }
        );
    }

    const { identifier } = body; // Can be email or username

    if (!identifier) {
        return NextResponse.json(
            { success: false, message: "Email or username is required" },
            { status: 400 }
        );
    }

    try {
        await connectToDatabase();

        // Find user by email or username
        const user = await User.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { username: identifier.toLowerCase() }
            ]
        });

        if (!user) {
            // Don't reveal if user exists or not for security
            return NextResponse.json(
                { success: true, message: "If an account exists with that email or username, a password reset link has been sent." },
                { status: 200 }
            );
        }

        // Generate password reset token
        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

        // Save token and expiration to user
        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
        await user.save();

        // Send password reset email
        await sendPasswordResetEmail(user.email, rawToken);

        return NextResponse.json(
            { success: true, message: "If an account exists with that email or username, a password reset link has been sent." },
            { status: 200 }
        );
    } catch (err) {
        console.error("Forgot password error:", err);
        return NextResponse.json(
            { success: false, message: "Failed to process password reset request" },
            { status: 500 }
        );
    }
}
