import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

// Add paths that don't require authentication
const publicPaths = [
    '/',
    '/login',
    '/filie-se',
    '/api/auth/login',
    '/api/public',
    '/about', // Example
];

// Add paths that are always protected
const protectedPaths = [
    '/dashboard',
    '/members',
    '/finance',
    '/schedules',
    '/settings',
    '/chat',
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the path is public
    if (publicPaths.some(path => pathname.startsWith(path) && (path !== '/' || pathname === '/'))) {

        // If user is already logged in and tries to access login, redirect to dashboard
        if (pathname === '/login') {
            const token = request.cookies.get('auth_token')?.value;
            if (token) {
                const payload = await verifyToken(token);
                if (payload) {
                    return NextResponse.redirect(new URL('/dashboard', request.url));
                }
            }
        }
        return NextResponse.next();
    }

    // Check if the path is protected or implicit protected (not public and not api/public)
    // Generally assume everything else is protected for this app, except static assets
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/public')
    ) {
        return NextResponse.next();
    }

    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
        // Redirect to login if no token
        const url = new URL('/login', request.url);
        url.searchParams.set('from', pathname);
        return NextResponse.redirect(url);
    }

    const payload = await verifyToken(token);

    if (!payload) {
        // Redirect to login if token is invalid
        const url = new URL('/login', request.url);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
