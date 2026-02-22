"use server";

import { serverApi } from "@/lib/server-api";
import { CalendarDay } from "@/types/api";

export async function getCalendarData(
    propertyId: string,
    startDate: string,
    endDate: string
): Promise<CalendarDay[]> {
    try {
        const res = await serverApi(
            `/properties/${propertyId}/calendar?start_date=${startDate}&end_date=${endDate}`
        );

        if (!res.ok) {
            console.error("Failed to fetch calendar:", res.status);
            return [];
        }

        return res.json();
    } catch (error) {
        console.error("Calendar fetch error:", error);
        return [];
    }
}
