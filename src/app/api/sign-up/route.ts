import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/userModel";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from '@/utils/sendVerificationEmail';

export async function POST(request: Request)
{
    dbConnect();

    try {
        const { username, email, password}= await request.json();

        const existingVerifiedUserByUsername = await UserModel.findOne({
            username,
            isVerified: true,
        });

        if (existingVerifiedUserByUsername) {
            return Response.json(
              {
                success: false,
                message: 'Username is already taken',
              },
              { status: 400 }
            );
        }

        const existingUserByEmail = await UserModel.findOne({ email });
        let verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        if(existingUserByEmail)
        {
            if(existingUserByEmail.isVerified)
            {
                return Response.json(
                    {
                      success: false,
                      message: 'User already exists with this email',
                    },
                    { status: 400 }
                );
            }
            else
            {
                const hashedPassword = await bcrypt.hash(password, 10);

                existingUserByEmail.username = username;
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verificationCode = verificationCode;
                existingUserByEmail.verificationCodeExpiry = new Date(Date.now() + 3600000);
                await existingUserByEmail.save();
            }
        }
        else
        {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verificationCode,
                verificationCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: [],
            });
        
            await newUser.save();
        }

        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verificationCode
        );

        if (!emailResponse.success) {
            return Response.json(
              {
                success: false,
                message: emailResponse.message,
              },
              { status: 500 }
            );
        }

        console.log("Email sent for verification", emailResponse);

        return Response.json(
            {
              success: true,
              message: 'User registered successfully. Please verify your account.',
            },
            { status: 201 }
        );
    } 
    catch (error) {
        console.error('Error registering user:', error);

        return Response.json({
            success: false,
            message: 'Error registering user',
          },{ status: 500 }
        );
    }
}