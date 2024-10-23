import { resend } from "@/lib/resend";
import VerificationEmail from "@/emailTemplates/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(email:string, username:string, verificationCode:string): Promise<ApiResponse>
{
    try 
    {
        await resend.emails.send({
            from: process.env.MY_EMAIL!,
            to: email,
            subject: "Ananymous Feedback Verification Code",
            react: VerificationEmail({username, otp:verificationCode})
        });

        return { success: true, message: 'Verification email sent successfully.'};
    } 
    catch (error) {
        console.error('Error sending verification email:', error);
        return { success: false, message: 'Failed to send verification email.' };
    }
}