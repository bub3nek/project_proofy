import { withAuth } from 'next-auth/middleware';
import type { NextRequestWithAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const resolvedSecret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'project-proofy-secret';
if (!process.env.NEXTAUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = resolvedSecret;
}

export default withAuth(
    function middleware(req: NextRequestWithAuth) {
        const pathname = req.nextUrl.pathname;
        if (pathname.startsWith('/admin/login')) {
            return NextResponse.next();
        }
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                if (req.nextUrl.pathname.startsWith('/admin/login')) {
                    return true;
                }
                return !!token;
            },
        },
        pages: {
            signIn: '/admin/login',
        },
    }
);

export const config = {
    matcher: ['/admin/:path*'],
};
