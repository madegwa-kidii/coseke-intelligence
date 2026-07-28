import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, rawToken: string) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${rawToken}`;

    try {
        await resend.emails.send({
            from: "noreply@coseke.com",
            to: email,
            subject: "Reset your password - Coseke Intelligence",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Reset Your Password</h2>
                    <p>We received a request to reset your password. Click the link below to set a new password.</p>
                    <p><a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
                    <p style="color: #666; font-size: 12px;">This link expires in 24 hours.</p>
                    <p style="color: #666; font-size: 12px;">If you didn&apos;t request a password reset, you can ignore this email.</p>
                </div>
            `,
        });
    } catch (error) {
        console.error("Failed to send password reset email:", error);
        throw error;
    }
}
