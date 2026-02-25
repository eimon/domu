import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/**
 * Detects the best matching locale for a request, in priority order:
 * 1. NEXT_LOCALE cookie (user's explicit preference, set by next-intl)
 * 2. Locale already present in the URL path (/es/..., /en/...)
 * 3. Browser's Accept-Language header
 * 4. Default locale (en)
 */
function detectLocale(request: NextRequest): string {
    const locales = routing.locales as readonly string[];

    const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
    if (cookieLocale && locales.includes(cookieLocale)) return cookieLocale;

    const urlLocale = request.nextUrl.pathname.match(/^\/([a-z]{2})(\/|$)/)?.[1];
    if (urlLocale && locales.includes(urlLocale)) return urlLocale;

    const acceptLang = request.headers.get("accept-language") ?? "";
    for (const part of acceptLang.split(",")) {
        const tag = part.split(";")[0].trim().toLowerCase();
        if (locales.includes(tag)) return tag;
        const prefix = tag.split("-")[0];
        if (locales.includes(prefix)) return prefix;
    }

    return routing.defaultLocale;
}

export async function middleware(request: NextRequest) {
    const response = intlMiddleware(request);

    const token = request.cookies.get("access_token")?.value;
    const secret = process.env.JWT_SECRET_KEY;
    const pathname = request.nextUrl.pathname;

    const isPublicPath =
        pathname.match(/^\/([a-z]{2})?\/auth\//) ||
        pathname.includes("/auth/") ||
        pathname.match(/\.(ico|svg|png|jpg|jpeg)$/) ||
        pathname.startsWith("/_next");

    if (isPublicPath) {
        return response;
    }

    const redirectToLogin = (locale: string) => {
        const res = NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
        // Persist the detected locale so the login page and post-login redirect use it
        res.cookies.set("NEXT_LOCALE", locale, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
        return res;
    };

    if (!token) {
        return redirectToLogin(detectLocale(request));
    }

    try {
        if (!secret) throw new Error("JWT_SECRET_KEY not defined");
        await jwtVerify(token, new TextEncoder().encode(secret));
        return response;
    } catch {
        return redirectToLogin(detectLocale(request));
    }
}

export const config = {
    matcher: ['/', '/(es|en)/:path*']
};
