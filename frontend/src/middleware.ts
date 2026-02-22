import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
    // 1. Run next-intl middleware first to handle redirects and locale
    const response = intlMiddleware(request);

    // 2. Auth Logic
    const token = request.cookies.get("access_token")?.value;
    const secret = process.env.JWT_SECRET_KEY;

    // Public paths need to account for locale prefix (e.g., /en/auth/login or /auth/login)
    // We normalize the path by removing the locale if present
    const pathname = request.nextUrl.pathname;

    // Check if path is public (auth pages, static assets, etc)
    const isPublicPath =
        pathname.match(/^\/([a-z]{2})?\/auth\//) || // /en/auth/..., /es/auth/...
        pathname.includes("/auth/") ||              // /auth/... (unprefixed)
        pathname.match(/\.(ico|svg|png|jpg|jpeg)$/) ||
        pathname.startsWith("/_next");

    if (isPublicPath) {
        return response;
    }

    // Protected Routes Logic
    if (!token) {
        // Redirect to login, preserving locale if present
        const locale = pathname.match(/^\/([a-z]{2})\//)?.[1] || routing.defaultLocale;
        return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
    }

    try {
        if (!secret) throw new Error("JWT_SECRET_KEY not defined");
        const secretKey = new TextEncoder().encode(secret);
        await jwtVerify(token, secretKey);
        // Token valid, proceed with the response from intlMiddleware
        return response;
    } catch (error) {
        // Token invalid
        const locale = pathname.match(/^\/([a-z]{2})\//)?.[1] || routing.defaultLocale;
        return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
    }
}

export const config = {
    matcher: ['/', '/(es|en)/:path*']
};
