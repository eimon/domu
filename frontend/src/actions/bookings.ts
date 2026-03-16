"use server";

import { z } from "zod";
import { serverApi } from "@/lib/server-api";
import { revalidatePath } from "next/cache";
import { Booking, BookingStatus, BookingSource, PaymentMethod, PriceQuote } from "@/types/api";

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

export async function getPriceQuote(
    propertyId: string,
    checkIn: string,
    checkOut: string
): Promise<PriceQuote | null> {
    try {
        const res = await serverApi(`/properties/${propertyId}/price-quote`, {
            params: { check_in: checkIn, check_out: checkOut },
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
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

export async function acceptBooking(bookingId: string): Promise<{ success?: boolean; error?: string }> {
    try {
        const res = await serverApi(`/bookings/${bookingId}/accept`, { method: "POST" });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return { error: errorData.detail || "Failed to accept booking" };
        }
    } catch (error) {
        console.error("Accept Booking Error:", error);
        return { error: "Something went wrong" };
    }
    revalidatePath("/bookings");
    return { success: true };
}

export async function cancelBooking(bookingId: string): Promise<{ success?: boolean; error?: string }> {
    try {
        const res = await serverApi(`/bookings/${bookingId}/cancel`, { method: "POST" });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return { error: errorData.detail || "Failed to cancel booking" };
        }
    } catch (error) {
        console.error("Cancel Booking Error:", error);
        return { error: "Something went wrong" };
    }
    revalidatePath("/bookings");
    return { success: true };
}

export async function assignGuest(
    bookingId: string,
    prevState: BookingFormState,
    formData: FormData
): Promise<BookingFormState> {
    const guestId = formData.get("guest_id") as string;
    if (!guestId) return { error: "Seleccioná un huésped" };

    try {
        const res = await serverApi(`/bookings/${bookingId}`, {
            method: "PUT",
            body: JSON.stringify({ guest_id: guestId }),
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return { error: errorData.detail || "No se pudo asignar el huésped" };
        }
    } catch {
        return { error: "Something went wrong" };
    }

    revalidatePath("/bookings");
    return { success: true };
}

export async function payBooking(
    bookingId: string,
    prevState: BookingFormState,
    formData: FormData
): Promise<BookingFormState> {
    const paid_at = formData.get("paid_at") as string;
    const payment_method = formData.get("payment_method") as string;
    const paid_amount_raw = formData.get("paid_amount") as string;

    if (!paid_at) return { error: "La fecha de pago es obligatoria" };
    if (!payment_method) return { error: "El medio de pago es obligatorio" };

    const paid_amount = paid_amount_raw ? parseFloat(paid_amount_raw) : undefined;

    try {
        const res = await serverApi(`/bookings/${bookingId}/pay`, {
            method: "POST",
            body: JSON.stringify({ paid_at, payment_method, ...(paid_amount !== undefined && { paid_amount }) }),
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return { error: errorData.detail || "No se pudo registrar el pago" };
        }
    } catch (error) {
        console.error("Pay Booking Error:", error);
        return { error: "Something went wrong" };
    }

    revalidatePath("/bookings");
    return { success: true };
}

export async function revertPayment(bookingId: string): Promise<{ success?: boolean; error?: string }> {
    try {
        const res = await serverApi(`/bookings/${bookingId}/revert-payment`, { method: "POST" });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return { error: errorData.detail || "No se pudo revertir el pago" };
        }
    } catch (error) {
        console.error("Revert Payment Error:", error);
        return { error: "Something went wrong" };
    }
    revalidatePath("/bookings");
    return { success: true };
}

export async function deleteBooking(bookingId: string): Promise<{ success?: boolean; error?: string }> {
    try {
        const res = await serverApi(`/bookings/${bookingId}`, { method: "DELETE" });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return { error: errorData.detail || "Failed to delete booking" };
        }
    } catch (error) {
        console.error("Delete Booking Error:", error);
        return { error: "Something went wrong" };
    }
    revalidatePath("/bookings");
    return { success: true };
}
