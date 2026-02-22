"use server";

import { z } from "zod";
import { serverApi } from "@/lib/server-api";
import { revalidatePath } from "next/cache";
import { Booking, BookingStatus, BookingSource } from "@/types/api";

const bookingSchema = z.object({
    property_id: z.string().uuid("Invalid property ID"),
    guest_id: z.string().uuid("Invalid guest ID").optional(),
    check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid check-in date"),
    check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid check-out date"),
    summary: z.string().min(1, "Summary is required"),
    description: z.string().optional(),
    status: z.nativeEnum(BookingStatus),
    source: z.nativeEnum(BookingSource),
});

export type BookingFormState = {
    error?: string;
    success?: boolean;
};

export async function getBookings(): Promise<Booking[]> {
    try {
        const res = await serverApi("/bookings");
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Get Bookings Error:", error);
        return [];
    }
}

export async function getPropertyBookings(propertyId: string): Promise<Booking[]> {
    try {
        const res = await serverApi(`/properties/${propertyId}/bookings`);
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Get Property Bookings Error:", error);
        return [];
    }
}

export async function createBooking(prevState: BookingFormState, formData: FormData): Promise<BookingFormState> {
    const validatedFields = bookingSchema.safeParse({
        property_id: formData.get("property_id"),
        guest_id: formData.get("guest_id") || undefined,
        check_in: formData.get("check_in"),
        check_out: formData.get("check_out"),
        summary: formData.get("summary"),
        description: formData.get("description") || undefined,
        status: formData.get("status"),
        source: formData.get("source"),
    });

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.issues[0].message,
        };
    }

    try {
        const res = await serverApi("/bookings", {
            method: "POST",
            body: JSON.stringify(validatedFields.data),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return {
                error: errorData.detail || "Failed to create booking",
            };
        }
    } catch (error) {
        console.error("Create Booking Error:", error);
        return {
            error: "Something went wrong",
        };
    }

    revalidatePath("/bookings");
    revalidatePath(`/properties/${validatedFields.data.property_id}`);
    return { success: true };
}

export async function updateBooking(
    bookingId: string,
    prevState: BookingFormState,
    formData: FormData
): Promise<BookingFormState> {
    const validatedFields = bookingSchema.partial().safeParse({
        guest_id: formData.get("guest_id") || undefined,
        check_in: formData.get("check_in") || undefined,
        check_out: formData.get("check_out") || undefined,
        summary: formData.get("summary") || undefined,
        description: formData.get("description") || undefined,
        status: formData.get("status") || undefined,
    });

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.issues[0].message,
        };
    }

    try {
        const res = await serverApi(`/bookings/${bookingId}`, {
            method: "PUT",
            body: JSON.stringify(validatedFields.data),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return {
                error: errorData.detail || "Failed to update booking",
            };
        }
    } catch (error) {
        console.error("Update Booking Error:", error);
        return {
            error: "Something went wrong",
        };
    }

    revalidatePath("/bookings");
    return { success: true };
}

export async function deleteBooking(bookingId: string): Promise<{ success?: boolean; error?: string }> {
    try {
        const res = await serverApi(`/bookings/${bookingId}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return {
                error: errorData.detail || "Failed to cancel booking",
            };
        }
    } catch (error) {
        console.error("Delete Booking Error:", error);
        return {
            error: "Something went wrong",
        };
    }

    revalidatePath("/bookings");
    return { success: true };
}
