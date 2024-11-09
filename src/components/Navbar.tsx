"use client";

import React from 'react';
import Link from "next/link";
import { useSession, signOut } from 'next-auth/react';
import { User } from 'next-auth';
import { Button } from './ui/button';


export default function Navbar() {
    const {data: session}= useSession();
    const user: User= session?.user;
    // console.log("User:", user);
    
    return (
        <nav className="p-4 md:p-5 shadow-md bg-gray-900 text-white">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                <a href="#" className="text-xl font-bold mb-4 md:mb-0">
                    Anonymous Feedback
                </a>

                {
                    session? (
                        <div className='flex flex-col justify-center items-center'>
                            <Button onClick={() => signOut()} className="w-full md:w-auto bg-slate-100 text-black" variant='outline'>
                                Logout
                            </Button>
                            <span className='text-sm'>{user.username || user.email}</span>
                        </div>
                    ): (
                        <Link href="/sign-in">
                            <Button className="w-full md:w-auto bg-slate-100 text-black" variant={'outline'}>Login</Button>
                        </Link>
                    )
                }
            </div>
        </nav>
    );
}