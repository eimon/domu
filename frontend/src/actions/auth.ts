"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "@/i18n/routing";
import { API_URL } from "@/lib/api";

const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

export type LoginState = {
    error?: string;
    success?: boolean;
};

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
    const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            error: "Invalid input fields",
        };
    }

    const { username, password } = validatedFields.data;

    try {
        // Convert to FormData for the backend request since it expects form-data
        const backendFormData = new FormData();
        backendFormData.append("username", username);
        backendFormData.append("password", password);

        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            body: backendFormData,
        });

        if (!res.ok) {
            const data = await res.json().catch(() => null);
            return {
                error: data?.detail || "Authentication failed",
            };
        }

        const data = await res.json();
        const { access_token } = data;

        // Set cookie
        const cookieStore = await cookies();
        cookieStore.set("access_token", access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/",
        });

    } catch (error) {
        console.error("Login Error:", error);
        return {
            error: "Something went wrong. Please try again.",
        };
    }


    redirect({ href: "/", locale: (await cookies()).get("NEXT_LOCALE")?.value || "en" });
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("access_token");
    redirect("/auth/login");
}
