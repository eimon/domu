"use client";

import { useActionState, useState } from "react";
import { createProperty, PropertyFormState } from "@/actions/properties";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import AddressAutocomplete from "@/components/AddressAutocomplete";

const inputCls = "w-full px-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.10] text-white/90 focus:border-domu-primary/60 focus:ring-2 focus:ring-domu-primary/15 outline-none transition-all text-sm";
const labelCls = "block text-xs font-medium text-white/55 mb-1.5 uppercase tracking-wider";

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
                    className="inline-flex items-center text-sm text-white/40 hover:text-white/70 mb-4 transition-colors"
                >
                    <ArrowLeft size={15} className="mr-1" />
                    {tCommon('back')}
                </Link>
                <h1 className="text-2xl font-bold text-white/90">{t('title')}</h1>
                <p className="text-white/40 text-sm mt-1">{t('subtitle')}</p>
            </div>

            <div className="glass rounded-2xl p-6 md:p-8">
                <form action={formAction} className="space-y-5">
                    {state?.error && (
                        <div className="bg-domu-danger/10 border border-domu-danger/20 text-domu-danger/90 p-3 rounded-lg text-sm">
                            {state.error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className={labelCls}>{t('name')}</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="e.g. Seaside Villa"
                                required
                                className={inputCls}
                            />
                        </div>

                        <div>
                            <label htmlFor="address" className={labelCls}>{t('address')}</label>
                            <AddressAutocomplete
                                name="address"
                                required
                                placeholder="Av. Corrientes 1234, Buenos Aires"
                                className={inputCls}
                                onSelect={(lat, lon) => setCoords({ lat, lon })}
                            />
                            <input type="hidden" name="latitude" value={coords?.lat ?? ""} />
                            <input type="hidden" name="longitude" value={coords?.lon ?? ""} />
                        </div>

                        <div>
                            <label htmlFor="description" className={labelCls}>
                                {t('description')} <span className="text-white/25 normal-case tracking-normal">({tCommon('optional')})</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                placeholder="Describe the property..."
                                className={`${inputCls} resize-y`}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="base_price" className={labelCls}>{t('basePrice')}</label>
                                <input
                                    id="base_price"
                                    name="base_price"
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    placeholder="100.00"
                                    required
                                    className={inputCls}
                                />
                                <p className="text-xs text-white/25 mt-1">{t('basePriceHint')}</p>
                            </div>

                            <div>
                                <label htmlFor="avg_stay_days" className={labelCls}>{t('avgStay')}</label>
                                <input
                                    id="avg_stay_days"
                                    name="avg_stay_days"
                                    type="number"
                                    min="1"
                                    placeholder="3"
                                    required
                                    className={inputCls}
                                />
                                <p className="text-xs text-white/25 mt-1">{t('avgStayHint')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end space-x-3 border-t border-white/[0.07]">
                        <Link
                            href="/properties"
                            className="px-4 py-2 text-sm font-medium text-white/55 hover:bg-white/[0.05] hover:text-white/75 rounded-lg transition-colors"
                        >
                            {tCommon('cancel')}
                        </Link>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-6 py-2 bg-domu-primary hover:bg-domu-primary/80 text-white font-medium rounded-lg transition-colors flex items-center disabled:opacity-60 text-sm"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={15} />
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
