import { auth } from "@/auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/userModel";
import { NextRequest } from "next/server";

export async function DELETE(request: NextRequest, {params}: {params: Promise<{messageId:string}>})
{
    const messageId= (await params).messageId;

    await dbConnect();
    const session= await auth();
    const user= session?.user;

    if (!session || !user) {
        return Response.json(
          { success: false, message: 'Not authenticated' },
          { status: 401 }
        );
    }

    try 
    {
        const updatedResult= await UserModel.updateOne({_id:user._id},
            {
                $pull: {messages: {_id: messageId}}
            }
        );

        if (updatedResult.modifiedCount === 0) {
            return Response.json(
              { message: 'Message not found or already deleted', success: false },
              { status: 404 }
            );
        }
      
        return Response.json(
            { message: 'Message deleted', success: true },
            { status: 200 }
        );
    } 
    catch (error) {
        console.error('Error deleting message:', error);

        return Response.json(
            { message: 'Error deleting message', success: false },
            { status: 500 }
        );
    }
}