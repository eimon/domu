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
                    <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
                    <p className="text-gray-500 mt-1">Monitor and manage all reservations across your properties.</p>
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
