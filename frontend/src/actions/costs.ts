"use server";

import { z } from "zod";
import { serverApi } from "@/lib/server-api";
import { revalidatePath } from "next/cache";

const costSchema = z.object({
    name: z.string().min(1, "Name is required"),
    category: z.enum(["RECURRING_MONTHLY", "PER_RESERVATION"]),
    calculation_type: z.enum(["FIXED_AMOUNT", "PERCENTAGE"]),
    value: z.coerce.number().min(0, "Value must be positive"),
});

export type CostFormState = {
    error?: string;
    success?: boolean;
};

export async function createCost(
    propertyId: string,
    prevState: CostFormState,
    formData: FormData
): Promise<CostFormState> {
    const validatedFields = costSchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) {
        return {
            error: "Invalid fields",
        };
    }

    try {
        const res = await serverApi(`/properties/${propertyId}/costs`, {
            method: "POST",
            body: JSON.stringify(validatedFields.data),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return {
                error: errorData.detail || "Failed to add cost",
            };
        }
    } catch (error) {
        console.error("Create Cost Error:", error);
        return {
            error: "Something went wrong",
        };
    }

    revalidatePath(`/properties/${propertyId}`);
    return { success: true };
}

export async function updateCost(
    costId: string,
    propertyId: string,
    prevState: CostFormState,
    formData: FormData
): Promise<CostFormState> {
    const validatedFields = costSchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) {
        return {
            error: "Invalid fields",
        };
    }

    try {
        const res = await serverApi(`/costs/${costId}`, {
            method: "PUT",
            body: JSON.stringify(validatedFields.data),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return {
                error: errorData.detail || "Failed to update cost",
            };
        }
    } catch (error) {
        console.error("Update Cost Error:", error);
        return {
            error: "Something went wrong",
        };
    }

    revalidatePath(`/properties/${propertyId}`);
    return { success: true };
}

export async function deleteCost(
    costId: string,
    propertyId: string
): Promise<{ success?: boolean; error?: string }> {
    try {
        const res = await serverApi(`/costs/${costId}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return {
                error: errorData.detail || "Failed to delete cost",
            };
        }
    } catch (error) {
        console.error("Delete Cost Error:", error);
        return {
            error: "Something went wrong",
        };
    }

    revalidatePath(`/properties/${propertyId}`);
    return { success: true };
}
