"use server";

import { serverApi } from "@/lib/server-api";
import { FinancialSummary } from "@/types/api";

/**
 * Fetches the financial summary for a specific property and month/year.
 * 
 * @param propertyId The UUID of the property
 * @param year The year (YYYY)
 * @param month The month (1-12)
 * @returns FinancialSummary object or null if failed
 */
export async function getFinancialSummary(
    propertyId: string,
    year: number,
    month: number
): Promise<FinancialSummary | null> {
    try {
        const res = await serverApi(
            `/properties/${propertyId}/financial-summary?year=${year}&month=${month}`
        );

        if (!res.ok) {
            console.error(`Failed to fetch financial summary for property ${propertyId}:`, res.statusText);
            return null;
        }

        return await res.json();
    } catch (error) {
        console.error("Get Financial Summary Error:", error);
        return null;
    }
}
