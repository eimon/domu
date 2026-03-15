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
                    <h1 className="text-2xl font-bold text-white/90">{t('title')}</h1>
                    <p className="text-white/40 mt-1 text-sm">Manage your guests and their contact information.</p>
                </div>
                <AddGuestDialog />
            </div>

            <GuestsTable guests={guests} />
        </div>
    );
}
