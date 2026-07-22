export async function sendVerificationEmail(email: string, rawToken: string) {
    const verifyUrl = `${process.env.APP_URL}/verify-email?token=${rawToken}&email=${encodeURIComponent(email)}`;

    // Replace this with your actual email provider call
    console.log(`Send verification email to ${email}: ${verifyUrl}`);

    // Example with Resend:
    // await resend.emails.send({
    //     from: "noreply@yourapp.com",
    //     to: email,
    //     subject: "Verify your email",
    //     html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email. This link expires in 24 hours.</p>`,
    // });
}