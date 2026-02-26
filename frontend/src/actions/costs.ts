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

export type CostModifyFormState = {
    error?: string;
    success?: boolean;
};

export async function modifyCost(
    costId: string,
    propertyId: string,
    prevState: CostModifyFormState,
    formData: FormData
): Promise<CostModifyFormState> {
    const value = parseFloat(formData.get("value") as string);
    const start_date = formData.get("start_date") as string;

    if (!value || value <= 0) return { error: "El valor debe ser mayor a 0" };
    if (!start_date) return { error: "La fecha de inicio es obligatoria" };

    try {
        const res = await serverApi(`/costs/${costId}/modify`, {
            method: "POST",
            body: JSON.stringify({ value, start_date }),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return { error: errorData.detail || "No se pudo modificar el costo" };
        }
    } catch (error) {
        console.error("Modify Cost Error:", error);
        return { error: "Something went wrong" };
    }

    revalidatePath(`/properties/${propertyId}`);
    return { success: true };
}

export async function revertCost(
    costId: string,
    propertyId: string
): Promise<{ success?: boolean; error?: string }> {
    try {
        const res = await serverApi(`/costs/${costId}/revert`, { method: "POST" });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return { error: errorData.detail || "No se pudo revertir el costo" };
        }
    } catch (error) {
        console.error("Revert Cost Error:", error);
        return { error: "Something went wrong" };
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
