import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { User } from "@/models";
import { connectToDatabase } from "@/lib/db";

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

    const { token, email } = body;
    if (!token || !email) {
        return NextResponse.json(
            { success: false, message: "Token and email are required" },
            { status: 400 }
        );
    }

    try {
        await connectToDatabase();

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            email,
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: new Date() },
        }).select("+emailVerificationToken +emailVerificationExpires");

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Invalid or expired verification link" },
                { status: 400 }
            );
        }

        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        return NextResponse.json({ success: true, message: "Email verified successfully" });
    } catch (err) {
        console.error("Email verification error:", err);
        return NextResponse.json(
            { success: false, message: "Verification failed" },
            { status: 500 }
        );
    }
}