import { NextRequest } from "next/server";

// this route sends AI generated sample messages to the Frontend for suggestions
export async function GET(request: NextRequest)
{
    console.log("GET");
}