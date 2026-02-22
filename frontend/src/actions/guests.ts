"use server";

import { z } from "zod";
import { serverApi } from "@/lib/server-api";
import { revalidatePath } from "next/cache";
import { Guest, DocumentType } from "@/types/api";

const guestSchema = z.object({
    full_name: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    document_type: z.nativeEnum(DocumentType),
    document_number: z.string().min(1, "Document number is required"),
});

export type GuestFormState = {
    error?: string;
    success?: boolean;
};

export async function getGuests(): Promise<Guest[]> {
    try {
        const res = await serverApi("/guests");
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Get Guests Error:", error);
        return [];
    }
}

export async function createGuest(prevState: GuestFormState, formData: FormData): Promise<GuestFormState> {
    const validatedFields = guestSchema.safeParse({
        full_name: formData.get("full_name"),
        email: formData.get("email"),
        phone: formData.get("phone") || undefined,
        document_type: formData.get("document_type"),
        document_number: formData.get("document_number"),
    });

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.issues[0].message,
        };
    }

    try {
        const res = await serverApi("/guests", {
            method: "POST",
            body: JSON.stringify(validatedFields.data),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return {
                error: errorData.detail || "Failed to create guest",
            };
        }
    } catch (error) {
        console.error("Create Guest Error:", error);
        return {
            error: "Something went wrong",
        };
    }

    revalidatePath("/guests");
    return { success: true };
}

export async function updateGuest(
    guestId: string,
    prevState: GuestFormState,
    formData: FormData
): Promise<GuestFormState> {
    const validatedFields = guestSchema.safeParse({
        full_name: formData.get("full_name"),
        email: formData.get("email"),
        phone: formData.get("phone") || undefined,
        document_type: formData.get("document_type"),
        document_number: formData.get("document_number"),
    });

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.issues[0].message,
        };
    }

    try {
        const res = await serverApi(`/guests/${guestId}`, {
            method: "PUT",
            body: JSON.stringify(validatedFields.data),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return {
                error: errorData.detail || "Failed to update guest",
            };
        }
    } catch (error) {
        console.error("Update Guest Error:", error);
        return {
            error: "Something went wrong",
        };
    }

    revalidatePath("/guests");
    return { success: true };
}

export async function deleteGuest(guestId: string): Promise<{ success?: boolean; error?: string }> {
    try {
        const res = await serverApi(`/guests/${guestId}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return {
                error: errorData.detail || "Failed to delete guest",
            };
        }
    } catch (error) {
        console.error("Delete Guest Error:", error);
        return {
            error: "Something went wrong",
        };
    }

    revalidatePath("/guests");
    return { success: true };
}
