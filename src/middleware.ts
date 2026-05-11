import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const pathname = req.nextUrl.pathname;

        console.log(`[AUTH MIDDLEWARE] Path: ${pathname} | User: ${token?.email || 'No Token'} | Role: ${token?.role || 'No Role'}`);

        // We allow the login page itself (though withAuth usually handles this if configured)
        if (pathname === '/auth/login') {
            return NextResponse.next();
        }

        // Authenticated but not ADMIN → redirect to homepage
        if (token?.role !== 'ADMIN') {
            console.warn(`[AUTH REDIRECT] Non-admin user ${token?.email} attempted to access ${pathname}. Redirecting to home.`);
            return NextResponse.redirect(new URL('/', req.url));
        }

        return NextResponse.next();
    },
    {
        secret: process.env.NEXTAUTH_SECRET,
        callbacks: {
            // If authorized returns true, the middleware function above is executed
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/auth/login",
        },
    }
);

export const config = {
    matcher: [
        "/admin",
        "/admin/:path*",
    ]
};
