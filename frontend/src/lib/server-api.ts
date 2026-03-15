import { cookies } from "next/headers";

// INTERNAL_API_URL is set at runtime in Docker (e.g. http://web:8000/api/v1).
// Falls back to NEXT_PUBLIC_API_URL (baked at build time) or localhost for local dev.
const SERVER_API_URL =
    process.env.INTERNAL_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8000";

type FetchOptions = RequestInit & {
    params?: Record<string, string>;
};

function buildUrl(endpoint: string, options: FetchOptions): string {
    let url = `${SERVER_API_URL}${endpoint}`;
    if (options.params) {
        url += `?${new URLSearchParams(options.params).toString()}`;
    }
    return url;
}

function buildHeaders(token: string | undefined, options: FetchOptions): Record<string, string> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...((options.headers as Record<string, string>) || {}),
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

const cookieBase = {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
};

export async function serverApi(endpoint: string, options: FetchOptions = {}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    const response = await fetch(buildUrl(endpoint, options), {
        ...options,
        headers: buildHeaders(token, options),
    });

    if (response.status !== 401) {
        return response;
    }

    // 401: attempt silent refresh using the httpOnly refresh_token cookie
    const refreshToken = cookieStore.get("refresh_token")?.value;
    if (!refreshToken) {
        return response;
    }

    try {
        const refreshRes = await fetch(`${SERVER_API_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!refreshRes.ok) {
            // Refresh failed: clear cookies when possible (Server Action context)
            try {
                cookieStore.delete("access_token");
                cookieStore.delete("refresh_token");
            } catch {
                // Server Component context: cannot write cookies, ignore
            }
            return response;
        }

        const { access_token, refresh_token } = await refreshRes.json();

        // Update cookies — only works in Server Actions and Route Handlers,
        // not in Server Components (throws). If it throws, return original 401.
        try {
            cookieStore.set("access_token", access_token, {
                ...cookieBase,
                httpOnly: false,
                maxAge: 30 * 60,
            });
            cookieStore.set("refresh_token", refresh_token, {
                ...cookieBase,
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 60,
            });
        } catch {
            return response;
        }

        // Retry original request with the new access token
        return fetch(buildUrl(endpoint, options), {
            ...options,
            headers: buildHeaders(access_token, options),
        });
    } catch {
        return response;
    }
}

export async function getJson<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    const res = await serverApi(endpoint, options);
    if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
    }
    return res.json();
}
