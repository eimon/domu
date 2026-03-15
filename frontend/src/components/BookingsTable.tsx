"use client";

import { useState } from "react";
import { Booking, Property, Guest } from "@/types/api";
import { Trash2, ExternalLink, Check, X, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { acceptBooking, cancelBooking, deleteBooking } from "@/actions/bookings";
import { Link } from "@/i18n/routing";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";
import BookingDetailModal from "@/components/BookingDetailModal";

const EMPTY_PROPERTIES: Property[] = [];
const EMPTY_GUESTS: Guest[] = [];

interface BookingsTableProps {
    bookings: Booking[];
    properties?: Property[];
    guests?: Guest[];
}

export default function BookingsTable({ bookings, properties = EMPTY_PROPERTIES, guests = EMPTY_GUESTS }: BookingsTableProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
    const t = useTranslations("Common");
    const tBooking = useTranslations("Bookings");
    const tEnums = useTranslations("Enums");
    const { showError } = useToast();
    const { confirm } = useConfirm();

    const getPropertyName = (id: string) => properties.find(p => p.id === id)?.name || id.substring(0, 8);
    const getProperty = (id: string) => properties.find(p => p.id === id);
    const getGuest = (id: string | undefined) => id ? guests.find(g => g.id === id) : undefined;
    const getGuestName = (id: string | undefined) => {
        if (!id) return "—";
        return guests.find(g => g.id === id)?.full_name || t('anonymous');
    };

    const handleAccept = async (booking: Booking) => {
        setLoadingId(booking.id);
        const result = await acceptBooking(booking.id);
        if (result.error) showError(result.error);
        setLoadingId(null);
    };

    const handleCancel = async (booking: Booking) => {
        if (!await confirm(tBooking('confirmCancel'))) return;
        setLoadingId(booking.id);
        const result = await cancelBooking(booking.id);
        if (result.error) showError(result.error);
        setLoadingId(null);
    };

    const handleDelete = async (booking: Booking) => {
        if (!await confirm(t('confirmDelete'))) return;
        setLoadingId(booking.id);
        const result = await deleteBooking(booking.id);
        if (result.error) showError(result.error);
        setLoadingId(null);
    };

    if (bookings.length === 0) {
        return (
            <div className="text-center py-12 glass rounded-lg border-dashed border border-white/[0.08]">
                <p className="text-white/35 text-sm">{tBooking('noBookings')}</p>
            </div>
        );
    }

    return (
        <>
        <div className="glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/[0.06]">
                    <thead className="bg-white/[0.03]">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/35 uppercase tracking-wider">
                                {t('property')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/35 uppercase tracking-wider">
                                {t('guest')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/35 uppercase tracking-wider">
                                {tBooking('checkIn')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/35 uppercase tracking-wider">
                                {tBooking('checkOut')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/35 uppercase tracking-wider">
                                {tBooking('status')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white/35 uppercase tracking-wider">
                                {t('actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                        {bookings.map((booking) => {
                            const isLoading = loadingId === booking.id;
                            const isTentative = booking.status === 'TENTATIVE';
                            const isConfirmed = booking.status === 'CONFIRMED';
                            const isCancelled = booking.status === 'CANCELLED';

                            return (
                                <tr key={booking.id} className="hover:bg-white/[0.03] transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white/80">
                                        <Link href={`/properties/${booking.property_id}`} className="hover:text-domu-primary flex items-center transition-colors">
                                            {getPropertyName(booking.property_id)}
                                            <ExternalLink size={11} className="ml-1 opacity-40" />
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50">
                                        {getGuestName(booking.guest_id)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50 font-mono">
                                        {booking.check_in}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50 font-mono">
                                        {booking.check_out}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            isConfirmed ? 'bg-domu-success/12 text-domu-success' :
                                            isTentative ? 'bg-domu-warning/12 text-domu-warning' :
                                            'bg-domu-danger/12 text-domu-danger'
                                        }`}>
                                            {tEnums(`BookingStatus.${booking.status}`)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                        <div className="flex items-center justify-end space-x-1">
                                            <button
                                                onClick={() => setDetailBooking(booking)}
                                                className="p-1.5 text-white/40 hover:bg-white/[0.06] hover:text-white/70 rounded-lg transition-colors"
                                                title={tBooking('viewDetails')}
                                            >
                                                <Eye size={15} />
                                            </button>
                                            {isTentative && (
                                                <>
                                                    <button
                                                        onClick={() => handleAccept(booking)}
                                                        disabled={isLoading}
                                                        className="p-1.5 text-domu-success/70 hover:bg-domu-success/10 hover:text-domu-success rounded-lg transition-colors disabled:opacity-40"
                                                        title={tBooking('accept')}
                                                    >
                                                        <Check size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancel(booking)}
                                                        disabled={isLoading}
                                                        className="p-1.5 text-domu-warning/70 hover:bg-domu-warning/10 hover:text-domu-warning rounded-lg transition-colors disabled:opacity-40"
                                                        title={t('cancel')}
                                                    >
                                                        <X size={15} />
                                                    </button>
                                                </>
                                            )}
                                            {isConfirmed && (
                                                <button
                                                    onClick={() => handleCancel(booking)}
                                                    disabled={isLoading}
                                                    className="p-1.5 text-domu-danger/70 hover:bg-domu-danger/10 hover:text-domu-danger rounded-lg transition-colors disabled:opacity-40"
                                                    title={t('cancel')}
                                                >
                                                    <X size={15} />
                                                </button>
                                            )}
                                            {isCancelled && (
                                                <button
                                                    onClick={() => handleDelete(booking)}
                                                    disabled={isLoading}
                                                    className="p-1.5 text-domu-danger/70 hover:bg-domu-danger/10 hover:text-domu-danger rounded-lg transition-colors disabled:opacity-40"
                                                    title={t('delete')}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>

        {detailBooking && (
            <BookingDetailModal
                booking={detailBooking}
                property={getProperty(detailBooking.property_id)}
                guest={getGuest(detailBooking.guest_id)}
                guests={guests}
                onClose={() => setDetailBooking(null)}
            />
        )}
        </>
    );
}
