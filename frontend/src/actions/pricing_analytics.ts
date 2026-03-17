"use server";

import { z } from "zod";
import { serverApi } from "@/lib/server-api";
import { PricingOptimizationResponse } from "@/types/pricing_analytics";

const optimizationRequestSchema = z.object({
    property_id: z.string().uuid(),
    target_occupancy: z.coerce.number().min(0).max(100),
    priority: z.enum(["REVENUE", "OCCUPANCY", "BALANCED"]),
    date_range_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    date_range_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type OptimizationFormState = { error?: string; success?: boolean } & Partial<PricingOptimizationResponse>;

// Actions de solo lectura
export async function getPricingAnalytics(propertyId: string, analysisDate?: string) {
    try {
        const params = analysisDate ? { analysis_date: analysisDate } : {};
        const res = await serverApi(`/pricing-analytics/properties/${propertyId}/analytics`, { params });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

export async function getProfitabilityProjections(propertyId: string, monthsAhead: number = 12) {
    try {
        const res = await serverApi(`/pricing-analytics/properties/${propertyId}/projections`, {
            params: { months_ahead: monthsAhead.toString() }
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

export async function getMarketInsights(propertyId: string) {
    try {
        const res = await serverApi(`/pricing-analytics/properties/${propertyId}/market-insights`);
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

export async function getPriceSensitivity(propertyId: string, priceVariation: number = 20.0) {
    try {
        const res = await serverApi(`/pricing-analytics/properties/${propertyId}/price-sensitivity`, {
            params: { price_variation: priceVariation.toString() }
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

// Server Action para optimización de precios
export async function optimizePricing(
    prevState: OptimizationFormState,
    formData: FormData
): Promise<OptimizationFormState> {
    const validatedFields = optimizationRequestSchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) {
        return { error: "Campos inválidos" };
    }

    try {
        const res = await serverApi("/pricing-analytics/optimize", {
            method: "POST",
            body: JSON.stringify(validatedFields.data),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return { error: errorData.detail || "Error al optimizar precios" };
        }
        
        const result = await res.json();
        return { success: true, ...result };
    } catch {
        return { error: "Algo salió mal" };
    }
}