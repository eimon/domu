"use client";

import { useActionState, useState } from "react";
import { createProperty, PropertyFormState } from "@/actions/properties";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import AddressAutocomplete from "@/components/AddressAutocomplete";

export default function NewPropertyPage() {
    const initialState: PropertyFormState = { error: "", success: false };
    const [state, formAction, isPending] = useActionState(createProperty, initialState);
    const [coords, setCoords] = useState<{ lat: string; lon: string } | null>(null);
    const t = useTranslations("Properties.create");
    const tCommon = useTranslations("Common");

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Link
                    href="/properties"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft size={16} className="mr-1" />
                    {tCommon('back')}
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                <p className="text-gray-500">{t('subtitle')}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                <form action={formAction} className="space-y-6">
                    {state?.error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                            {state.error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('name')}
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="e.g. Seaside Villa"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('address')}
                            </label>
                            <AddressAutocomplete
                                name="address"
                                required
                                placeholder="Av. Corrientes 1234, Buenos Aires"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                onSelect={(lat, lon) => setCoords({ lat, lon })}
                            />
                            <input type="hidden" name="latitude" value={coords?.lat ?? ""} />
                            <input type="hidden" name="longitude" value={coords?.lon ?? ""} />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('description')} <span className="text-gray-400 font-normal">({tCommon('optional')})</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                placeholder="Describe the property..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('basePrice')}
                                </label>
                                <input
                                    id="base_price"
                                    name="base_price"
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    placeholder="100.00"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">{t('basePriceHint')}</p>
                            </div>

                            <div>
                                <label htmlFor="avg_stay_days" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('avgStay')}
                                </label>
                                <input
                                    id="avg_stay_days"
                                    name="avg_stay_days"
                                    type="number"
                                    min="1"
                                    placeholder="3"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">{t('avgStayHint')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end space-x-3">
                        <Link
                            href="/properties"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            {tCommon('cancel')}
                        </Link>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center disabled:opacity-70"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={18} />
                                    {tCommon('loading')}
                                </>
                            ) : (
                                t('submit')
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
