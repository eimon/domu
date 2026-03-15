import { getBookings } from "@/actions/bookings";
import { getMyProperties } from "@/actions/properties";
import { getGuests } from "@/actions/guests";
import BookingsTable from "@/components/BookingsTable";
import AddBookingDialog from "@/components/AddBookingDialog";
import { getTranslations } from "next-intl/server";

export default async function BookingsPage() {
    const [bookings, properties, guests] = await Promise.all([
        getBookings(),
        getMyProperties(),
        getGuests()
    ]);
    const t = await getTranslations("Bookings");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white/90">{t('title')}</h1>
                    <p className="text-white/40 mt-1 text-sm">Monitor and manage all reservations across your properties.</p>
                </div>
                <AddBookingDialog />
            </div>

            <BookingsTable
                bookings={bookings}
                properties={properties}
                guests={guests}
            />
        </div>
    );
}
