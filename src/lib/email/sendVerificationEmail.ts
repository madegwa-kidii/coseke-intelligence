import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, rawToken: string) {
    const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${rawToken}&email=${encodeURIComponent(email)}`;

    try {
        await resend.emails.send({
            from: "noreply@coseke.com",
            to: email,
            subject: "Verify your email - Coseke Intelligence",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Verify Your Email</h2>
                    <p>Thank you for signing up! Please verify your email to complete your registration.</p>
                    <p><a href="${verifyUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
                    <p style="color: #666; font-size: 12px;">This link expires in 24 hours.</p>
                </div>
            `,
        });
    } catch (error) {
        console.error("Failed to send verification email:", error);
        throw error;
    }
}
