"use server";

import { serverApi } from "@/lib/server-api";
import { revalidatePath } from "next/cache";

export async function revertBasePrice(
    propertyId: string
): Promise<{ success?: boolean; error?: string }> {
    try {
        const res = await serverApi(`/properties/${propertyId}/base-price/revert`, {
            method: "POST",
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return { error: errorData.detail || "No se pudo revertir el precio base" };
        }
    } catch (error) {
        console.error("Revert Base Price Error:", error);
        return { error: "Something went wrong" };
    }

    revalidatePath(`/properties/${propertyId}`);
    return { success: true };
}

export type BasePriceFormState = {
    error?: string;
    success?: boolean;
};

export async function modifyBasePrice(
    propertyId: string,
    prevState: BasePriceFormState,
    formData: FormData
): Promise<BasePriceFormState> {
    const value = parseFloat(formData.get("value") as string);
    const start_date = formData.get("start_date") as string;

    if (!value || value <= 0) return { error: "El valor debe ser mayor a 0" };
    if (!start_date) return { error: "La fecha de inicio es obligatoria" };

    try {
        const res = await serverApi(`/properties/${propertyId}/base-price/modify`, {
            method: "POST",
            body: JSON.stringify({ value, start_date }),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return { error: errorData.detail || "No se pudo modificar el precio base" };
        }
    } catch (error) {
        console.error("Modify Base Price Error:", error);
        return { error: "Something went wrong" };
    }

    revalidatePath(`/properties/${propertyId}`);
    return { success: true };
}
