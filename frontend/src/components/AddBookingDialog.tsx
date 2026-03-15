"use client";

import { useState, useCallback } from "react";
import { createBooking, BookingFormState } from "@/actions/bookings";
import { Plus, X, Loader2, ChevronLeft, CalendarDays } from "lucide-react";
import { useActionState } from "react";
import { BookingStatus, BookingSource, Property, Guest } from "@/types/api";
import { useTranslations } from "next-intl";
import { getMyProperties } from "@/actions/properties";
import { getGuests } from "@/actions/guests";
import PropertyCalendar from "@/components/PropertyCalendar";

type Step = "property" | "calendar";

const INITIAL_STATE: BookingFormState = { error: "", success: false };

export default function AddBookingDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<Step>("property");
    const [properties, setProperties] = useState<Property[]>([]);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [selectedPropertyId, setSelectedPropertyId] = useState("");
    const [selectedDates, setSelectedDates] = useState<{ start: string; end: string } | null>(null);

    const t = useTranslations("Common");
    const tEnums = useTranslations("Enums");
    const tBookings = useTranslations("Bookings");

    const selectedProperty = properties.find((p) => p.id === selectedPropertyId) ?? null;

    const wrappedCreateBooking = async (prevState: BookingFormState, formData: FormData): Promise<BookingFormState> => {
        const result = await createBooking(prevState, formData);
        if (result.success) handleClose();
        return result;
    };

    const [state, formAction, isPending] = useActionState(wrappedCreateBooking, INITIAL_STATE);

    const handleOpen = async () => {
        setIsOpen(true);
        setStep("property");
        setSelectedPropertyId("");
        setSelectedDates(null);
        setIsLoadingData(true);
        const [props, gst] = await Promise.all([getMyProperties(), getGuests()]);
        setProperties(props);
        setGuests(gst);
        setIsLoadingData(false);
    };

    const handleClose = () => {
        setIsOpen(false);
        setStep("property");
        setSelectedPropertyId("");
        setSelectedDates(null);
    };

    const handleContinue = () => {
        if (!selectedPropertyId) return;
        setSelectedDates(null);
        setStep("calendar");
    };

    const handleRangeSelected = useCallback((start: string | null, end: string | null) => {
        if (start && end) setSelectedDates({ start, end });
        else setSelectedDates(null);
    }, []);

    return (
        <>
            <button
                onClick={handleOpen}
                className="inline-flex items-center px-4 py-2 bg-domu-primary hover:bg-domu-primary/80 text-white rounded-lg transition-colors text-sm font-medium"
            >
                <Plus size={15} className="mr-2" />
                {t("add")} {t("bookings")}
            </button>

            {/* ── Step 1: property selector ── */}
            {isOpen && step === "property" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="glass-modal rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
                            <h3 className="text-base font-semibold text-white/90">
                                {t("add")} {t("bookings")}
                            </h3>
                            <button onClick={handleClose} className="text-white/40 hover:text-white/70 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-white/55 mb-1.5 uppercase tracking-wider">
                                    {t("property")}
                                </label>
                                <select
                                    value={selectedPropertyId}
                                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                                    disabled={isLoadingData}
                                    className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.10] text-white/90 focus:border-domu-primary/60 focus:ring-2 focus:ring-domu-primary/15 outline-none text-sm transition-all"
                                >
                                    <option value="">
                                        {isLoadingData ? t("loading") : t("selectProperty")}
                                    </option>
                                    {properties.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 pt-1">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-4 py-2 text-sm font-medium text-white/55 hover:bg-white/[0.05] hover:text-white/75 rounded-lg transition-colors"
                                >
                                    {t("cancel")}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleContinue}
                                    disabled={!selectedPropertyId || isLoadingData}
                                    className="px-4 py-2 bg-domu-primary hover:bg-domu-primary/80 text-white rounded-lg disabled:opacity-40 text-sm font-medium transition-colors"
                                >
                                    {tBookings("next")} →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Step 2: calendar + booking form ── */}
            {isOpen && step === "calendar" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="glass-modal rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] shrink-0">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setStep("property")}
                                    className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/[0.06] rounded-lg transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <div>
                                    <h3 className="text-base font-semibold text-white/90">
                                        {t("add")} {t("bookings")}
                                    </h3>
                                    {selectedProperty && (
                                        <p className="text-xs text-white/40">{selectedProperty.name}</p>
                                    )}
                                </div>
                            </div>
                            <button onClick={handleClose} className="text-white/40 hover:text-white/70 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex flex-col lg:flex-row gap-0 overflow-hidden flex-1 min-h-0">
                            {/* Calendar panel */}
                            <div className="flex-1 min-w-0 overflow-y-auto p-6 border-b border-white/[0.07] lg:border-b-0 lg:border-r">
                                <PropertyCalendar
                                    propertyId={selectedPropertyId}
                                    basePrice={selectedProperty?.base_price ?? 0}
                                    onRangeSelected={handleRangeSelected}
                                />
                            </div>

                            {/* Booking form panel */}
                            <div className="w-full lg:w-80 shrink-0 overflow-y-auto p-6">
                                {!selectedDates ? (
                                    <div className="flex flex-col items-center justify-center h-full min-h-48 text-center text-white/30 border-2 border-dashed border-white/[0.07] rounded-xl p-6 gap-3">
                                        <CalendarDays size={28} className="text-white/20" />
                                        <p className="text-sm">{tBookings("selectDatesHint")}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-semibold text-white/55 uppercase tracking-wider">{tBookings("bookingDetails")}</h4>

                                        {/* Selected date range */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-xs font-medium text-white/40 mb-1">{tBookings("checkIn")}</p>
                                                <p className="text-sm font-semibold text-white/80 bg-domu-primary/10 rounded-lg px-3 py-2 font-mono">
                                                    {selectedDates.start}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-white/40 mb-1">{tBookings("checkOut")}</p>
                                                <p className="text-sm font-semibold text-white/80 bg-domu-primary/10 rounded-lg px-3 py-2 font-mono">
                                                    {selectedDates.end}
                                                </p>
                                            </div>
                                        </div>

                                        <form action={formAction} className="space-y-3">
                                            <input type="hidden" name="property_id" value={selectedPropertyId} />
                                            <input type="hidden" name="check_in" value={selectedDates.start} />
                                            <input type="hidden" name="check_out" value={selectedDates.end} />

                                            {state?.error && (
                                                <div className="bg-domu-danger/10 border border-domu-danger/20 text-domu-danger/90 p-3 rounded-lg text-sm">
                                                    {state.error}
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-xs font-medium text-white/50 mb-1 uppercase tracking-wider">{t("guest")}</label>
                                                <select
                                                    name="guest_id"
                                                    className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.06] border border-white/[0.10] text-white/90 focus:border-domu-primary/60 focus:ring-2 focus:ring-domu-primary/15 outline-none transition-all"
                                                >
                                                    <option value="">{t("anonymous")}</option>
                                                    {guests.map((g) => (
                                                        <option key={g.id} value={g.id}>
                                                            {g.full_name} ({g.email})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-white/50 mb-1 uppercase tracking-wider">{tBookings("summary")}</label>
                                                <input
                                                    name="summary"
                                                    type="text"
                                                    required
                                                    placeholder="e.g. Family Vacation"
                                                    className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.06] border border-white/[0.10] text-white/90 focus:border-domu-primary/60 focus:ring-2 focus:ring-domu-primary/15 outline-none transition-all"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-white/50 mb-1 uppercase tracking-wider">{tBookings("status")}</label>
                                                    <select
                                                        name="status"
                                                        defaultValue={BookingStatus.CONFIRMED}
                                                        className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.06] border border-white/[0.10] text-white/90 focus:border-domu-primary/60 focus:ring-2 focus:ring-domu-primary/15 outline-none transition-all"
                                                    >
                                                        {[BookingStatus.CONFIRMED, BookingStatus.TENTATIVE].map((s) => (
                                                            <option key={s} value={s}>{tEnums(`BookingStatus.${s}`)}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-white/50 mb-1 uppercase tracking-wider">{tBookings("source")}</label>
                                                    <select
                                                        name="source"
                                                        defaultValue={BookingSource.MANUAL}
                                                        className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.06] border border-white/[0.10] text-white/90 focus:border-domu-primary/60 focus:ring-2 focus:ring-domu-primary/15 outline-none transition-all"
                                                    >
                                                        {Object.values(BookingSource).map((s) => (
                                                            <option key={s} value={s}>{tEnums(`BookingSource.${s}`)}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isPending}
                                                className="w-full py-2.5 bg-domu-primary hover:bg-domu-primary/80 text-white rounded-lg disabled:opacity-60 flex items-center justify-center text-sm font-medium transition-colors"
                                            >
                                                {isPending ? <Loader2 className="animate-spin mr-2" size={15} /> : null}
                                                {t("save")}
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
