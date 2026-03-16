"use client";

import { useActionState, useEffect } from "react";
import { Booking, Guest, Property, BookingStatus } from "@/types/api";
import { X, Calendar, MapPin, User, Mail, Phone, CreditCard, Hash, Clock, Tag, UserPlus, Loader2, BadgeDollarSign, DollarSign } from "lucide-react";
import { useTranslations } from "next-intl";
import { assignGuest, BookingFormState } from "@/actions/bookings";

interface BookingDetailModalProps {
    booking: Booking;
    property?: Property;
    guest?: Guest;
    guests: Guest[];
    onClose: () => void;
}

const statusStyles: Record<string, string> = {
    [BookingStatus.CONFIRMED]: "bg-domu-success/12 text-domu-success border-domu-success/20",
    [BookingStatus.TENTATIVE]: "bg-domu-warning/12 text-domu-warning border-domu-warning/20",
    [BookingStatus.CANCELLED]: "bg-domu-danger/12 text-domu-danger border-domu-danger/20",
    [BookingStatus.PAID]: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
};

const inputCls = "w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.10] text-white/90 focus:border-domu-primary/60 focus:ring-2 focus:ring-domu-primary/15 outline-none transition-all text-sm";

function nights(checkIn: string, checkOut: string): number {
    return Math.round(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
    );
}

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-white/[0.05] last:border-0">
            <div className="p-1.5 bg-white/[0.04] rounded-lg shrink-0 mt-0.5">
                <Icon size={13} className="text-white/40" />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-medium text-white/35 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-sm text-white/80 break-words">{value}</p>
            </div>
        </div>
    );
}

export default function BookingDetailModal({ booking, property, guest, guests, onClose }: BookingDetailModalProps) {
    const t = useTranslations("Bookings");
    const tCommon = useTranslations("Common");
    const tEnums = useTranslations("Enums");
    const tGuest = useTranslations("Guests");

    const initialState: BookingFormState = {};
    const assignGuestWithId = assignGuest.bind(null, booking.id);
    const [state, formAction, isPending] = useActionState(assignGuestWithId, initialState);

    useEffect(() => {
        if (state.success) onClose();
    }, [state.success, onClose]);

    const nightCount = nights(booking.check_in, booking.check_out);
    const statusCls = statusStyles[booking.status as string] ?? "bg-white/[0.06] text-white/45 border-white/[0.10]";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="glass-modal rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex items-start justify-between px-6 py-5 border-b border-white/[0.08]">
                    <div>
                        <h3 className="text-base font-semibold text-white/90">{t('bookingDetails')}</h3>
                        <p className="text-xs text-white/35 mt-0.5 font-mono">{booking.id.substring(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusCls}`}>
                            {tEnums(`BookingStatus.${booking.status}`)}
                        </span>
                        <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto max-h-[70vh]">
                    {/* Date banner */}
                    <div className="mx-6 mt-5 mb-1 grid grid-cols-3 bg-white/[0.04] rounded-xl border border-white/[0.07] overflow-hidden">
                        <div className="px-4 py-3 text-center border-r border-white/[0.07]">
                            <p className="text-[10px] font-medium text-white/35 uppercase tracking-wider mb-1">{t('checkIn')}</p>
                            <p className="text-sm font-semibold text-white/85 font-mono">{booking.check_in}</p>
                        </div>
                        <div className="px-4 py-3 text-center border-r border-white/[0.07] flex flex-col items-center justify-center">
                            <Calendar size={14} className="text-domu-primary/60 mb-1" />
                            <p className="text-sm font-bold text-domu-primary/80">{nightCount}</p>
                            <p className="text-[10px] text-white/35">{t('nights')}</p>
                        </div>
                        <div className="px-4 py-3 text-center">
                            <p className="text-[10px] font-medium text-white/35 uppercase tracking-wider mb-1">{t('checkOut')}</p>
                            <p className="text-sm font-semibold text-white/85 font-mono">{booking.check_out}</p>
                        </div>
                    </div>

                    {/* Booking info */}
                    <div className="px-6 pt-4 pb-2">
                        <p className="text-[10px] font-medium text-white/35 uppercase tracking-wider mb-1">{t('bookingDetails')}</p>
                        <div>
                            {property && (
                                <Row icon={MapPin} label={tCommon('property')} value={property.name} />
                            )}
                            <Row icon={Tag} label={t('source')} value={tEnums(`BookingSource.${booking.source}`)} />
                            {booking.summary && (
                                <Row icon={Hash} label={t('summary')} value={booking.summary} />
                            )}
                            {booking.description && (
                                <Row icon={Clock} label={t('description')} value={booking.description} />
                            )}
                            {booking.total_amount != null && (
                                <Row icon={DollarSign} label={t('totalAmount')} value={
                                    <span className="font-mono text-white/70">
                                        ${Number(booking.total_amount).toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                                    </span>
                                } />
                            )}
                            {booking.paid_at && (
                                <Row icon={BadgeDollarSign} label={t('paidAt')} value={
                                    <span className="font-mono">{booking.paid_at}</span>
                                } />
                            )}
                            {booking.payment_method && (
                                <Row icon={CreditCard} label={t('paymentMethod')} value={
                                    tEnums(`PaymentMethod.${booking.payment_method}`)
                                } />
                            )}
                            {booking.paid_amount != null && (
                                <Row icon={BadgeDollarSign} label={t('paidAmount')} value={
                                    <span className="font-mono font-semibold text-emerald-400">
                                        ${Number(booking.paid_amount).toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                                    </span>
                                } />
                            )}
                        </div>
                    </div>

                    {/* Guest contact */}
                    <div className="px-6 pb-5 pt-2">
                        <p className="text-[10px] font-medium text-white/35 uppercase tracking-wider mb-1">{t('contactInfo')}</p>
                        {guest ? (
                            <div>
                                <Row icon={User} label={tGuest('fullName')} value={guest.full_name} />
                                <Row icon={Mail} label={tGuest('email')} value={
                                    <a href={`mailto:${guest.email}`} className="text-domu-primary/80 hover:text-domu-primary transition-colors">
                                        {guest.email}
                                    </a>
                                } />
                                {guest.phone && (
                                    <Row icon={Phone} label={tGuest('phone')} value={
                                        <a href={`tel:${guest.phone}`} className="text-domu-primary/80 hover:text-domu-primary transition-colors">
                                            {guest.phone}
                                        </a>
                                    } />
                                )}
                                <Row icon={CreditCard} label={tGuest('documentType')} value={tEnums(`DocumentType.${guest.document_type}`)} />
                                <Row icon={Hash} label={tGuest('documentNumber')} value={
                                    <span className="font-mono">{guest.document_number}</span>
                                } />
                            </div>
                        ) : (
                            <form action={formAction} className="space-y-3 pt-1">
                                <div className="flex items-center gap-2 text-white/35 text-sm pb-1">
                                    <UserPlus size={14} />
                                    <span>{t('noGuest')}</span>
                                </div>

                                {state?.error && (
                                    <div className="bg-domu-danger/10 border border-domu-danger/20 text-domu-danger/90 p-3 rounded-lg text-sm">
                                        {state.error}
                                    </div>
                                )}

                                <select name="guest_id" required className={inputCls}>
                                    <option value="">{t('selectGuest')}</option>
                                    {guests.map((g) => (
                                        <option key={g.id} value={g.id}>
                                            {g.full_name} — {g.email}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-domu-primary hover:bg-domu-primary/80 text-white rounded-lg disabled:opacity-60 text-sm font-medium transition-colors"
                                >
                                    {isPending
                                        ? <Loader2 size={14} className="animate-spin" />
                                        : <UserPlus size={14} />
                                    }
                                    {t('assignGuest')}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/[0.08] flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-white/55 hover:bg-white/[0.05] hover:text-white/75 rounded-lg transition-colors"
                    >
                        {tCommon('cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
}
