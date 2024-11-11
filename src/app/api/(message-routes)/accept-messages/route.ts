import { auth } from "@/auth"

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/userModel";
import { User } from "next-auth";
import { NextRequest } from "next/server";

// to toggle isAcceptingMessages
export async function POST(request: NextRequest)
{
    const session = await auth();
    console.log("session:", session);

    const user: User= session?.user;

    if(!session || !user)
    {
        console.log("No logged in users");
        return Response.json(
            { success: false, message: 'Not authenticated' },
            { status: 401 }
          );
    }

    const {acceptMessages}= await request.json();
    const userId= user._id;

    try 
    {
        await dbConnect();

        const updatedUser= UserModel.findByIdAndUpdate(userId, {isAcceptingMessages: acceptMessages}).exec();

        if (!updatedUser) {
            // User not found
            return Response.json(
              {
                success: false,
                message: 'Unable to find user to update message acceptance status',
              },
              { status: 404 }
            );
          }
      
          // Successfully updated message acceptance status
          return Response.json(
            {
              success: true,
              message: 'Message acceptance status updated successfully',
              updatedUser,
            },
            { status: 200 }
          );
    } 
    catch (error) {
        console.error('Error updating message acceptance status:', error);
        return Response.json(
            { success: false, message: 'Error updating message acceptance status' },
            { status: 500 }
        );
    }
};

export async function GET()
{
    const session= await auth();
    console.log("session:", session);

    const user= session?.user;
    if(!session || !user)
    {
        console.log("No logged in users");
        return Response.json(
            { success: false, message: 'Not authenticated' },
            { status: 401 }
        );
    }

    try {
        const foundUser = await UserModel.findById(user._id);

        if (!foundUser) {
            // User not found
            return Response.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // return the user's message acceptance status
        return Response.json(
            {
                success: true,
                isAcceptingMessages: foundUser.isAcceptingMessages
            },
            { status: 200 }
        );
    } 
    catch (error) {
        console.error('Error retrieving message acceptance status:', error);
        return Response.json(
            { success: false, message: 'Error retrieving message acceptance status' },
            { status: 500 }
        );
    }
};
