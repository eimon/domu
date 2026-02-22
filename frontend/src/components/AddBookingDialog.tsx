"use client";

import { useState, useEffect } from "react";
import { createBooking, BookingFormState } from "@/actions/bookings";
import { Plus, X, Loader2, Calendar } from "lucide-react";
import { useActionState } from "react";
import { BookingStatus, BookingSource, Property, Guest } from "@/types/api";
import { useTranslations } from "next-intl";
import { getMyProperties } from "@/actions/properties";
import { getGuests } from "@/actions/guests";

export default function AddBookingDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [properties, setProperties] = useState<Property[]>([]);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const initialState: BookingFormState = { error: "", success: false };
    const t = useTranslations("Common");
    const tBooking = useTranslations("Navigation"); // Using navigation for 'bookings' key or we can add to Bookings section
    const tEnums = useTranslations("Enums");

    // Let's assume we have a Bookings translation section
    // I should check if I need to add one. For now I'll use keys I'll add later.
    const tBookings = useTranslations("Bookings");

    const [state, formAction, isPending] = useActionState(createBooking, initialState);

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                setIsLoadingData(true);
                const [props, gst] = await Promise.all([getMyProperties(), getGuests()]);
                setProperties(props);
                setGuests(gst);
                setIsLoadingData(false);
            };
            fetchData();
        }
    }, [isOpen]);

    if (state.success && isOpen) {
        setIsOpen(false);
        state.success = false;
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
                <Plus size={16} className="mr-2" />
                {t('add')} {t('bookings')}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">{t('add')} {t('bookings')}</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form action={formAction} className="p-6 space-y-4">
                            {state?.error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                    {state.error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('property')}</label>
                                <select
                                    name="property_id"
                                    required
                                    disabled={isLoadingData}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    <option value="">Select Property...</option>
                                    {properties.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('guest')}</label>
                                <select
                                    name="guest_id"
                                    disabled={isLoadingData}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    <option value="">Anonymous / Select Guest...</option>
                                    {guests.map((g) => (
                                        <option key={g.id} value={g.id}>{g.full_name} ({g.email})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{tBookings('checkIn')}</label>
                                    <input
                                        name="check_in"
                                        type="date"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{tBookings('checkOut')}</label>
                                    <input
                                        name="check_out"
                                        type="date"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{tBookings('summary')}</label>
                                <input
                                    name="summary"
                                    type="text"
                                    required
                                    placeholder="e.g. Family Vacation"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{tBookings('status')}</label>
                                    <select
                                        name="status"
                                        defaultValue={BookingStatus.CONFIRMED}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    >
                                        {Object.values(BookingStatus).map((s) => (
                                            <option key={s} value={s}>{tEnums(`BookingStatus.${s}`)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{tBookings('source')}</label>
                                    <select
                                        name="source"
                                        defaultValue={BookingSource.MANUAL}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    >
                                        {Object.values(BookingSource).map((s) => (
                                            <option key={s} value={s}>{tEnums(`BookingSource.${s}`)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending || isLoadingData}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 flex items-center text-sm font-medium"
                                >
                                    {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                                    {t('save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
