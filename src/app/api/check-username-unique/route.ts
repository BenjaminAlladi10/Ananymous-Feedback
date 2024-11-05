import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/userModel";
import { z } from "zod";
import { usernameValidation } from "@/zodSchemas/signUpSchema";
import { NextRequest } from "next/server";

let usernameQuerySchema= z.object({
    username: usernameValidation
});

export async function GET(request:NextRequest)
{
    await dbConnect();

    try {
        const {searchParams}= new URL(request.url);
        let username= searchParams.get("username");

        const usernameQuery= {
            username
        };

        const res= usernameQuerySchema.safeParse(usernameQuery);
        if(!res.success)
        {
            const usernameErrors= res.error.format().username?._errors || [];
           
            return Response.json({
                success: false,
                message: usernameErrors?.length > 0
                ? usernameErrors.join(', ')
                : 'Invalid query parameters',
            },{status: 400});
        }

        let {data}= res;

        const existingVerifiedUser= await UserModel.findOne({username: data.username, isVerified: true});
        console.log("existingVerifiedUser:", existingVerifiedUser);

        if(existingVerifiedUser)
        {
            return Response.json({
                success: false,
                message: "Username is already taken"
            },{status: 400});
        }

        return Response.json({
            success: true,
            message: "Username is available"
        },{status: 200});``
    } 
    catch (error) {
        console.error("Error checking username", error);
        return Response.json({
            success: false,
            message: "Error checking username"
        }, {
            status: 500
        });
    }
}