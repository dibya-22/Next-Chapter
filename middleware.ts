import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
    '/admin(.*)',
    '/api/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
    // Add authorized parties check for production
    if (process.env.NODE_ENV === 'production') {
        const authorizedParties = [process.env.NEXT_PUBLIC_APP_URL];
        if (!authorizedParties.includes(req.headers.get('origin') || '')) {
            return NextResponse.json({ error: 'Unauthorized origin' }, { status: 403 });
        }
    }

    if (isProtectedRoute(req)) {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.redirect(new URL('https://present-krill-46.accounts.dev/sign-in', req.url));
        }

        if (userId !== process.env.ADMIN_USER_ID) {
            return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};