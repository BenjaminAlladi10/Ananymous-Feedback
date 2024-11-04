import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/userModel";
import { z } from "zod";
import { verifySchema } from "@/zodSchemas/verifySchema";
import { NextRequest } from "next/server";


export async function POST(request: NextRequest)
{
    await dbConnect();

    try 
    {
        const {username, VerificationCode}= await request.json();

        const res= verifySchema.safeParse({
            code: VerificationCode
        });

        if(!res.success)
        {
            return Response.json({
                succeess: false,
                message: "Verification Code validation failed!"
            });
        }

        let code= res.data.code;

        const user= await UserModel.findOne({username});
        if (!user) {
            return Response.json(
              { success: false, message: 'User not found' },
              { status: 404 }
            );
        }
        
        // Check if the code is correct and not expired
        const isCodeValid = code === user.verificationCode;
        const isCodeNotExpired = new Date() < new Date(user.verificationCodeExpiry);

        if (isCodeValid && isCodeNotExpired) {
            // Update the user's verification status
            user.isVerified = true;
            await user.save();
      
            return Response.json(
              { success: true, message: 'Account verified successfully' },
              { status: 200 }
            );
        }
        else if (!isCodeNotExpired) {
            // Code has expired
            return Response.json(
              {
                success: false,
                message:
                  'Verification code has expired. Please sign up again to get a new code.',
              },
              { status: 400 }
            );
        }
        else {
            // Code is incorrect
            return Response.json(
              { success: false, message: 'Incorrect verification code' },
              { status: 400 }
            );
        }
    } 
    catch (error) {
        console.error('Error verifying user:', error);
        return Response.json({
            success: false, 
            message: 'Error verifying user' 
        },{ status: 500});
    }
}