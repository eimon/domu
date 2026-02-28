"use server";

import { z } from "zod";
import { serverApi } from "@/lib/server-api";
import { revalidatePath } from "next/cache";

const pricingRuleSchema = z.object({
    name: z.string().min(1, "Name is required"),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    profitability_percent: z.coerce.number().min(0, "Must be positive"),
});

export type PricingRuleFormState = {
    error?: string;
    success?: boolean;
};

export async function createPricingRule(
    propertyId: string,
    prevState: PricingRuleFormState,
    formData: FormData
): Promise<PricingRuleFormState> {
    const validatedFields = pricingRuleSchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) {
        return {
            error: "Invalid fields",
        };
    }

    try {
        const res = await serverApi(`/properties/${propertyId}/pricing-rules`, {
            method: "POST",
            body: JSON.stringify(validatedFields.data),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return {
                error: errorData.detail || "Failed to create pricing rule",
            };
        }
    } catch (error) {
        console.error("Create Pricing Rule Error:", error);
        return {
            error: "Something went wrong",
        };
    }

    revalidatePath(`/properties/${propertyId}`);
    return { success: true };
}

export async function updatePricingRule(
    ruleId: string,
    propertyId: string,
    prevState: PricingRuleFormState,
    formData: FormData
): Promise<PricingRuleFormState> {
    const validatedFields = pricingRuleSchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) {
        return {
            error: "Invalid fields",
        };
    }

    try {
        const res = await serverApi(`/pricing-rules/${ruleId}`, {
            method: "PUT",
            body: JSON.stringify(validatedFields.data),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return {
                error: errorData.detail || "Failed to update pricing rule",
            };
        }
    } catch (error) {
        console.error("Update Pricing Rule Error:", error);
        return {
            error: "Something went wrong",
        };
    }

    revalidatePath(`/properties/${propertyId}`);
    return { success: true };
}

export async function deletePricingRule(
    ruleId: string,
    propertyId: string
): Promise<{ success?: boolean; error?: string }> {
    try {
        const res = await serverApi(`/pricing-rules/${ruleId}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return {
                error: errorData.detail || "Failed to delete pricing rule",
            };
        }
    } catch (error) {
        console.error("Delete Pricing Rule Error:", error);
        return {
            error: "Something went wrong",
        };
    }

    revalidatePath(`/properties/${propertyId}`);
    return { success: true };
}
