"use server";

import { z } from "zod";
import { serverApi } from "@/lib/server-api";
import { revalidatePath } from "next/cache";
import { redirect } from "@/i18n/routing";
import { cookies } from "next/headers";
import { Property } from "@/types/api";

export async function getMyProperties(): Promise<Property[]> {
    try {
        const res = await serverApi("/properties/my-managed");
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Get My Properties Error:", error);
        return [];
    }
}

const propertySchema = z.object({
    name: z.string().min(1, "Name is required"),
    address: z.string().min(1, "Address is required"),
    description: z.string().optional(),
    base_price: z.coerce.number().min(1, "Base price must be greater than 0"),
    avg_stay_days: z.coerce.number().int().min(1, "Average stay must be at least 1 day"),
    latitude: z.preprocess(
        val => (!val || val === "") ? undefined : parseFloat(val as string),
        z.number().optional()
    ),
    longitude: z.preprocess(
        val => (!val || val === "") ? undefined : parseFloat(val as string),
        z.number().optional()
    ),
});

export type PropertyFormState = {
    error?: string;
    success?: boolean;
};

export async function createProperty(prevState: PropertyFormState, formData: FormData): Promise<PropertyFormState> {
    const validatedFields = propertySchema.safeParse({
        name: formData.get("name"),
        address: formData.get("address"),
        description: formData.get("description"),
        base_price: formData.get("base_price"),
        avg_stay_days: formData.get("avg_stay_days"),
        latitude: formData.get("latitude"),
        longitude: formData.get("longitude"),
    });

    if (!validatedFields.success) {
        return {
            error: "Invalid fields",
        };
    }

    try {
        const res = await serverApi("/properties", {
            method: "POST",
            body: JSON.stringify(validatedFields.data),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return {
                error: errorData.detail || "Failed to create property",
            };
        }

    } catch (error) {
        console.error("Create Property Error:", error);
        return {
            error: "Something went wrong",
        };
    }

    revalidatePath("/properties");
    const locale = (await cookies()).get("NEXT_LOCALE")?.value || "en";
    redirect({ href: "/properties", locale });
    return { success: true };
}

export async function updateProperty(
    propertyId: string,
    prevState: PropertyFormState,
    formData: FormData
): Promise<PropertyFormState> {
    const validatedFields = propertySchema.safeParse({
        name: formData.get("name"),
        address: formData.get("address"),
        description: formData.get("description"),
        base_price: formData.get("base_price"),
        avg_stay_days: formData.get("avg_stay_days"),
        latitude: formData.get("latitude"),
        longitude: formData.get("longitude"),
    });

    if (!validatedFields.success) {
        return {
            error: "Invalid fields",
        };
    }

    try {
        const res = await serverApi(`/properties/${propertyId}`, {
            method: "PUT",
            body: JSON.stringify(validatedFields.data),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return {
                error: errorData.detail || "Failed to update property",
            };
        }
    } catch (error) {
        console.error("Update Property Error:", error);
        return {
            error: "Something went wrong",
        };
    }

    revalidatePath(`/properties/${propertyId}`);
    revalidatePath("/properties");
    return { success: true };
}

export async function deleteProperty(propertyId: string): Promise<{ success?: boolean; error?: string }> {
    try {
        const res = await serverApi(`/properties/${propertyId}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));

            // Handle specific case where property has bookings
            if (res.status === 409 || res.status === 400) {
                return {
                    error: errorData.detail || "Cannot delete property with existing bookings",
                };
            }

            return {
                error: errorData.detail || "Failed to delete property",
            };
        }
    } catch (error) {
        console.error("Delete Property Error:", error);
        return {
            error: "Something went wrong",
        };
    }

    revalidatePath("/properties");
    return { success: true };
}
