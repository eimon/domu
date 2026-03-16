"use client";

import { useState, useEffect, useRef } from "react";
import { Booking, Property, Guest } from "@/types/api";
import { Trash2, ExternalLink, Check, X, Eye, BadgeDollarSign, MoreVertical, Loader2, Undo2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { acceptBooking, cancelBooking, deleteBooking, revertPayment } from "@/actions/bookings";
import { Link } from "@/i18n/routing";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";
import BookingDetailModal from "@/components/BookingDetailModal";
import PayBookingDialog from "@/components/PayBookingDialog";

const EMPTY_PROPERTIES: Property[] = [];
const EMPTY_GUESTS: Guest[] = [];

interface BookingsTableProps {
    bookings: Booking[];
    properties?: Property[];
    guests?: Guest[];
}

function BookingCardMenu({
    booking,
    isLoading,
    onViewDetails,
    onAccept,
    onCancel,
    onPay,
    onRevertPayment,
    onDelete,
}: {
    booking: Booking;
    isLoading: boolean;
    onViewDetails: () => void;
    onAccept: () => void;
    onCancel: () => void;
    onPay: () => void;
    onRevertPayment: () => void;
    onDelete: () => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const t = useTranslations("Common");
    const tBooking = useTranslations("Bookings");

    const isTentative = booking.status === "TENTATIVE";
    const isConfirmed = booking.status === "CONFIRMED";
    const isCancelled = booking.status === "CANCELLED";
    const isPaid = booking.status === "PAID";

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const item = (label: string, onClick: () => void, className = "") => (
        <button
            onClick={() => { setOpen(false); onClick(); }}
            disabled={isLoading}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-white/[0.06] transition-colors disabled:opacity-40 ${className}`}
        >
            {label}
        </button>
    );

    return (
        <div ref={ref} className="relative">
            <button
                onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
                className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/[0.06] rounded-lg transition-colors"
            >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <MoreVertical size={16} />}
            </button>

            {open && (
                <div className="absolute right-0 top-8 z-30 w-48 glass-modal rounded-xl shadow-2xl border border-white/[0.08] overflow-hidden py-1">
                    {item(tBooking("viewDetails"), onViewDetails, "text-white/60")}
                    {isTentative && item(tBooking("accept"), onAccept, "text-domu-success/80")}
                    {(isTentative || isConfirmed) && item(tBooking("markAsPaid"), onPay, "text-emerald-400/80")}
                    {isPaid && item(tBooking("revertPayment"), onRevertPayment, "text-domu-warning/80")}
                    {(isTentative || isConfirmed) && item(t("cancel"), onCancel, "text-domu-danger/80")}
                    {isCancelled && item(t("delete"), onDelete, "text-domu-danger/80")}
                </div>
            )}
        </div>
    );
}

export default function BookingsTable({ bookings, properties = EMPTY_PROPERTIES, guests = EMPTY_GUESTS }: BookingsTableProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
    const [payingBooking, setPayingBooking] = useState<Booking | null>(null);
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

    const handleRevertPayment = async (booking: Booking) => {
        if (!await confirm(tBooking('confirmRevertPayment'))) return;
        setLoadingId(booking.id);
        const result = await revertPayment(booking.id);
        if (result.error) showError(result.error);
        setLoadingId(null);
    };

    const statusBadgeClass = (status: string) => {
        if (status === 'PAID') return 'bg-emerald-500/15 text-emerald-400';
        if (status === 'CONFIRMED') return 'bg-domu-success/12 text-domu-success';
        if (status === 'TENTATIVE') return 'bg-domu-warning/12 text-domu-warning';
        return 'bg-domu-danger/12 text-domu-danger';
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
            {/* ── Mobile: cards ── */}
            <div className="flex flex-col gap-3 md:hidden">
                {bookings.map((booking) => {
                    const isLoading = loadingId === booking.id;
                    return (
                        <div key={booking.id} className="glass rounded-xl px-4 py-3.5">
                            {/* Row 1: property + status + menu */}
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <Link
                                        href={`/properties/${booking.property_id}`}
                                        className="text-sm font-semibold text-white/85 hover:text-domu-primary transition-colors flex items-center gap-1 truncate"
                                    >
                                        {getPropertyName(booking.property_id)}
                                        <ExternalLink size={10} className="opacity-40 shrink-0" />
                                    </Link>
                                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadgeClass(booking.status)}`}>
                                        {tEnums(`BookingStatus.${booking.status}`)}
                                    </span>
                                </div>
                                <BookingCardMenu
                                    booking={booking}
                                    isLoading={isLoading}
                                    onViewDetails={() => setDetailBooking(booking)}
                                    onAccept={() => handleAccept(booking)}
                                    onCancel={() => handleCancel(booking)}
                                    onPay={() => setPayingBooking(booking)}
                                    onRevertPayment={() => handleRevertPayment(booking)}
                                    onDelete={() => handleDelete(booking)}
                                />
                            </div>

                            {/* Row 2: guest */}
                            <div className="text-xs text-white/45 mb-2">
                                {getGuestName(booking.guest_id)}
                            </div>

                            {/* Row 3: dates + amount */}
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 text-xs text-white/40 font-mono">
                                    <span>
                                        <span className="text-white/25 mr-1 font-sans">{tBooking("checkIn")}</span>
                                        {booking.check_in}
                                    </span>
                                    <span className="text-white/20">→</span>
                                    <span>
                                        <span className="text-white/25 mr-1 font-sans">{tBooking("checkOut")}</span>
                                        {booking.check_out}
                                    </span>
                                </div>
                                <div className="text-xs font-mono shrink-0 flex flex-col items-end gap-0.5">
                                    {booking.total_amount != null && (
                                        <span className="text-white/40">
                                            ${Number(booking.total_amount).toLocaleString("es-AR", { minimumFractionDigits: 0 })}
                                        </span>
                                    )}
                                    {booking.status === "PAID" && booking.paid_amount != null && (
                                        <span className="text-emerald-400 font-semibold">
                                            ${Number(booking.paid_amount).toLocaleString("es-AR", { minimumFractionDigits: 0 })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Desktop: table ── */}
            <div className="hidden md:block glass rounded-xl overflow-hidden">
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
                                    {tBooking('totalAmount')}
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
                                const isPaid = booking.status === 'PAID';

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
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${isPaid ? 'bg-emerald-500/15 text-emerald-400' :
                                                    isConfirmed ? 'bg-domu-success/12 text-domu-success' :
                                                        isTentative ? 'bg-domu-warning/12 text-domu-warning' :
                                                            'bg-domu-danger/12 text-domu-danger'
                                                }`}>
                                                {tEnums(`BookingStatus.${booking.status}`)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">
                                            <div className="flex flex-col items-end gap-0.5">
                                                {booking.total_amount != null ? (
                                                    <span className="text-white/45">
                                                        ${Number(booking.total_amount).toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                                                    </span>
                                                ) : (
                                                    <span className="text-white/20">—</span>
                                                )}
                                                {isPaid && booking.paid_amount != null && (
                                                    <span className="text-emerald-400 font-semibold text-xs">
                                                        ${Number(booking.paid_amount).toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                                                    </span>
                                                )}
                                            </div>
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
                                                {(isConfirmed || isTentative) && (
                                                    <button
                                                        onClick={() => setPayingBooking(booking)}
                                                        disabled={isLoading}
                                                        className="p-1.5 text-emerald-400/70 hover:bg-emerald-400/10 hover:text-emerald-400 rounded-lg transition-colors disabled:opacity-40"
                                                        title={tBooking('markAsPaid')}
                                                    >
                                                        <BadgeDollarSign size={15} />
                                                    </button>
                                                )}
                                                {isPaid && (
                                                    <button
                                                        onClick={() => handleRevertPayment(booking)}
                                                        disabled={isLoading}
                                                        className="p-1.5 text-domu-warning/70 hover:bg-domu-warning/10 hover:text-domu-warning rounded-lg transition-colors disabled:opacity-40"
                                                        title={tBooking('revertPayment')}
                                                    >
                                                        <Undo2 size={15} />
                                                    </button>
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

            {payingBooking && (
                <PayBookingDialog
                    bookingId={payingBooking.id}
                    totalAmount={payingBooking.total_amount}
                    isOpen
                    onClose={() => setPayingBooking(null)}
                />
            )}
        </>
    );
}
