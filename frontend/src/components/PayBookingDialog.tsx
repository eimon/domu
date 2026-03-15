"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { X, Loader2 } from "lucide-react";
import { payBooking, BookingFormState } from "@/actions/bookings";
import { useTranslations } from "next-intl";

interface PayBookingDialogProps {
    bookingId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function PayBookingDialog({ bookingId, isOpen, onClose }: PayBookingDialogProps) {
    const initialState: BookingFormState = {};
    const t = useTranslations("Common");
    const tBooking = useTranslations("Bookings");
    const tEnums = useTranslations("Enums");

    const payWithId = payBooking.bind(null, bookingId);
    const [state, formAction, isPending] = useActionState(payWithId, initialState);

    const todayStr = new Date().toISOString().split("T")[0];

    useEffect(() => {
        if (state.success && isOpen) {
            onClose();
        }
    }, [state.success, isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="glass-modal rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
                    <h3 className="text-base font-semibold text-white/90">{tBooking("markAsPaid")}</h3>
                    <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form action={formAction} className="p-6 space-y-4">
                    {state?.error && (
                        <div className="bg-domu-danger/10 border border-domu-danger/20 text-domu-danger/90 p-3 rounded-lg text-sm">{state.error}</div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-white/55 mb-1.5 uppercase tracking-wider">
                            {tBooking("paidAt")}
                        </label>
                        <input
                            name="paid_at"
                            type="date"
                            required
                            defaultValue={todayStr}
                            className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.10] text-white/90 focus:border-domu-primary/60 focus:ring-2 focus:ring-domu-primary/15 outline-none transition-all text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-white/55 mb-1.5 uppercase tracking-wider">
                            {tBooking("paymentMethod")}
                        </label>
                        <select
                            name="payment_method"
                            required
                            className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.10] text-white/90 focus:border-domu-primary/60 focus:ring-2 focus:ring-domu-primary/15 outline-none transition-all text-sm"
                        >
                            <option value="">{t("select")}...</option>
                            {(["CASH", "TRANSFER", "CARD", "OTHER"] as const).map((m) => (
                                <option key={m} value={m}>{tEnums(`PaymentMethod.${m}`)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-2 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-white/55 hover:bg-white/[0.05] hover:text-white/75 rounded-lg transition-colors"
                        >
                            {t("cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-600/80 text-white rounded-lg disabled:opacity-60 flex items-center text-sm font-medium transition-colors"
                        >
                            {isPending ? <Loader2 className="animate-spin mr-2" size={15} /> : null}
                            {tBooking("confirmPayment")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
