import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
// import { withAuth } from 'next-auth/middleware';


export async function middleware(request: NextRequest)
{
    console.log("Middleware called");
    const secret = process.env.NEXTAUTH_SECRET || 'your-secret';

    const token = await getToken({ req: request, secret });
    const url = request.nextUrl;

    console.log(secret, token, url);

    if (
        token &&
        (url.pathname.startsWith('/sign-in') ||
          url.pathname.startsWith('/sign-up') ||
          url.pathname.startsWith('/verify') ||
          url.pathname === '/')
    ) 
    {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if(!token && url.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
}

export const config= {
    matcher:[
        '/sign-in',
        '/sign-up',
        '/',
        '/dashboard/:path*',
        '/verify/:path*'
    ]
}