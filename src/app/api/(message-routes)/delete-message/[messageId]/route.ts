import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/userModel';
import { User } from 'next-auth';

import { auth } from '@/auth';
import { NextRequest } from 'next/server';
// import { Message } from '@/model/User';

export async function DELETE(
  request: Request,
  { params }: { params: { messageId: string } }
) 
{
    console.log("DELETE");
}
