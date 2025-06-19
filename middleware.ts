import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
    '/admin(.*)',
    '/api/admin(.*)',
]);

const isApiRoute = createRouteMatcher([
    '/api/(.*)',
]);

// Helper function to add CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default clerkMiddleware(async (auth, req) => {
    // Handle preflight requests for API routes
    if (isApiRoute(req) && req.method === 'OPTIONS') {
        return new NextResponse(null, { headers: corsHeaders });
    }

    // Handle protected routes
    if (isProtectedRoute(req)) {
        const response = await handleProtectedRoute(auth, req);
        if (isApiRoute(req)) {
            // Add CORS headers only for API routes
            Object.entries(corsHeaders).forEach(([key, value]) => {
                response.headers.set(key, value);
            });
        }
        return response;
    }

    // For API routes, add CORS headers
    if (isApiRoute(req)) {
        const response = NextResponse.next();
        Object.entries(corsHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
        });
        return response;
    }

    // For all other routes, just pass through
    return NextResponse.next();
});

async function handleProtectedRoute(auth: any, req: Request) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.redirect(new URL('https://present-krill-46.accounts.dev/sign-in', req.url));
    }

    if (userId !== process.env.ADMIN_USER_ID) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};