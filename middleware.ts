import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
    '/admin(.*)',
    '/api/admin(.*)',
]);

// Helper function to add CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default clerkMiddleware(async (auth, req) => {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return new NextResponse(null, { headers: corsHeaders });
    }

    // Add CORS headers to all responses
    const response = isProtectedRoute(req) ? await handleProtectedRoute(auth, req) : new NextResponse(null);
    
    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
});

async function handleProtectedRoute(auth: any, req: Request) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.redirect(new URL('https://present-krill-46.accounts.dev/sign-in', req.url));
    }

    if (userId !== process.env.ADMIN_USER_ID) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return new NextResponse(null);
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};