import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { User } from "@/models";
import { connectToDatabase } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email/sendVerificationEmail";

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

    const { email } = body;

    if (!email) {
        return NextResponse.json(
            { success: false, message: "Email is required" },
            { status: 400 }
        );
    }

    try {
        await connectToDatabase();

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        if (user.emailVerified) {
            return NextResponse.json(
                { success: false, message: "Email is already verified" },
                { status: 400 }
            );
        }

        // Generate new verification token
        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

        user.emailVerificationToken = hashedToken;
        user.emailVerificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
        await user.save();

        // Send verification email
        await sendVerificationEmail(user.email, rawToken);

        return NextResponse.json({
            success: true,
            message: "Verification email sent successfully",
        });
    } catch (err: any) {
        console.error("Resend verification error:", err);
        return NextResponse.json(
            { success: false, message: "Failed to resend verification email" },
            { status: 500 }
        );
    }
}
