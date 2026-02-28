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
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
                <Plus size={16} className="mr-2" />
                {t("add")} {t("bookings")}
            </button>

            {/* ── Step 1: property selector ── */}
            {isOpen && step === "property" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {t("add")} {t("bookings")}
                            </h3>
                            <button onClick={handleClose} className="text-gray-400 hover:text-gray-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t("property")}
                                </label>
                                <select
                                    value={selectedPropertyId}
                                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                                    disabled={isLoadingData}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    <option value="">
                                        {isLoadingData ? t("loading") : "Select property..."}
                                    </option>
                                    {properties.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                                >
                                    {t("cancel")}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleContinue}
                                    disabled={!selectedPropertyId || isLoadingData}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[92vh] flex flex-col animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setStep("property")}
                                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {t("add")} {t("bookings")}
                                    </h3>
                                    {selectedProperty && (
                                        <p className="text-sm text-gray-500">{selectedProperty.name}</p>
                                    )}
                                </div>
                            </div>
                            <button onClick={handleClose} className="text-gray-400 hover:text-gray-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex flex-col lg:flex-row gap-0 overflow-hidden flex-1 min-h-0">
                            {/* Calendar panel */}
                            <div className="flex-1 min-w-0 overflow-y-auto p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
                                <PropertyCalendar
                                    propertyId={selectedPropertyId}
                                    basePrice={selectedProperty?.base_price ?? 0}
                                    onRangeSelected={handleRangeSelected}
                                />
                            </div>

                            {/* Booking form panel */}
                            <div className="w-full lg:w-80 shrink-0 overflow-y-auto p-6">
                                {!selectedDates ? (
                                    <div className="flex flex-col items-center justify-center h-full min-h-48 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl p-6 gap-3">
                                        <CalendarDays size={32} className="text-gray-300" />
                                        <p className="text-sm">{tBookings("selectDatesHint")}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold text-gray-700">{tBookings("bookingDetails")}</h4>

                                        {/* Selected date range */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 mb-1">{tBookings("checkIn")}</p>
                                                <p className="text-sm font-semibold text-gray-900 bg-blue-50 rounded-lg px-3 py-2 font-mono">
                                                    {selectedDates.start}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 mb-1">{tBookings("checkOut")}</p>
                                                <p className="text-sm font-semibold text-gray-900 bg-blue-50 rounded-lg px-3 py-2 font-mono">
                                                    {selectedDates.end}
                                                </p>
                                            </div>
                                        </div>

                                        <form action={formAction} className="space-y-3">
                                            <input type="hidden" name="property_id" value={selectedPropertyId} />
                                            <input type="hidden" name="check_in" value={selectedDates.start} />
                                            <input type="hidden" name="check_out" value={selectedDates.end} />

                                            {state?.error && (
                                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                                    {state.error}
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">{t("guest")}</label>
                                                <select
                                                    name="guest_id"
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                                >
                                                    <option value="">Anonymous</option>
                                                    {guests.map((g) => (
                                                        <option key={g.id} value={g.id}>
                                                            {g.full_name} ({g.email})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">{tBookings("summary")}</label>
                                                <input
                                                    name="summary"
                                                    type="text"
                                                    required
                                                    placeholder="e.g. Family Vacation"
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">{tBookings("status")}</label>
                                                    <select
                                                        name="status"
                                                        defaultValue={BookingStatus.CONFIRMED}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                                    >
                                                        {[BookingStatus.CONFIRMED, BookingStatus.TENTATIVE].map((s) => (
                                                            <option key={s} value={s}>{tEnums(`BookingStatus.${s}`)}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">{tBookings("source")}</label>
                                                    <select
                                                        name="source"
                                                        defaultValue={BookingSource.MANUAL}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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
                                                className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center text-sm font-medium transition-colors"
                                            >
                                                {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
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
