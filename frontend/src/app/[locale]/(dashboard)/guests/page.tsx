import { getGuests } from "@/actions/guests";
import GuestsTable from "@/components/GuestsTable";
import AddGuestDialog from "@/components/AddGuestDialog";
import { getTranslations } from "next-intl/server";

export default async function GuestsPage() {
    const guests = await getGuests();
    const t = await getTranslations("Guests");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
                    <p className="text-gray-500 mt-1">Manage your guests and their contact information.</p>
                </div>
                <AddGuestDialog />
            </div>

            <GuestsTable guests={guests} />
        </div>
    );
}
