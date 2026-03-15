"use client";

import { useState, useEffect } from "react";
import { Property } from "@/types/api";
import { updateProperty, PropertyFormState } from "@/actions/properties";
import { X, Loader2 } from "lucide-react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import AddressAutocomplete from "@/components/AddressAutocomplete";

interface EditPropertyDialogProps {
    property: Property;
    onClose: () => void;
}

const inputCls = "w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.10] text-white/90 focus:border-domu-primary/60 focus:ring-2 focus:ring-domu-primary/15 outline-none transition-all text-sm";
const labelCls = "block text-xs font-medium text-white/55 mb-1.5 uppercase tracking-wider";

export default function EditPropertyDialog({ property, onClose }: EditPropertyDialogProps) {
    const initialState: PropertyFormState = { error: "", success: false };
    const t = useTranslations("Properties.create");
    const tCommon = useTranslations("Common");

    const existingCoords =
        property.latitude != null && property.longitude != null
            ? { lat: String(property.latitude), lon: String(property.longitude) }
            : null;
    const [coords, setCoords] = useState<{ lat: string; lon: string } | null>(existingCoords);

    const updateWithId = updateProperty.bind(null, property.id);
    const [state, formAction, isPending] = useActionState(updateWithId, initialState);

    useEffect(() => {
        if (state.success) {
            onClose();
        }
    }, [state.success, onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="glass-modal rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] shrink-0">
                    <h3 className="text-base font-semibold text-white/90">{tCommon('edit')}</h3>
                    <button
                        onClick={onClose}
                        className="text-white/40 hover:text-white/70 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form action={formAction} className="flex flex-col flex-1 min-h-0">
                    <div className="p-6 space-y-4 overflow-y-auto flex-1">
                        {state?.error && (
                            <div className="bg-domu-danger/10 border border-domu-danger/20 text-domu-danger/90 p-3 rounded-lg text-sm">
                                {state.error}
                            </div>
                        )}

                        <div>
                            <label className={labelCls}>{t('name')}</label>
                            <input
                                name="name"
                                type="text"
                                required
                                defaultValue={property.name}
                                className={inputCls}
                            />
                        </div>

                        <div>
                            <label className={labelCls}>{t('address')}</label>
                            <AddressAutocomplete
                                name="address"
                                required
                                defaultValue={property.address}
                                className={inputCls}
                                onSelect={(lat, lon) => setCoords({ lat, lon })}
                            />
                            <input type="hidden" name="latitude" value={coords?.lat ?? ""} />
                            <input type="hidden" name="longitude" value={coords?.lon ?? ""} />
                        </div>

                        <div>
                            <label className={labelCls}>{t('description')}</label>
                            <textarea
                                name="description"
                                rows={4}
                                defaultValue={property.description || ""}
                                className={`${inputCls} resize-y`}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>{t('basePrice')}</label>
                                <input
                                    name="base_price"
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    required
                                    defaultValue={property.base_price}
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>{t('avgStay')}</label>
                                <input
                                    name="avg_stay_days"
                                    type="number"
                                    min="1"
                                    required
                                    defaultValue={property.avg_stay_days}
                                    className={inputCls}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-white/[0.08] flex justify-end space-x-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-white/55 hover:bg-white/[0.05] hover:text-white/75 rounded-lg transition-colors"
                        >
                            {tCommon('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 bg-domu-primary hover:bg-domu-primary/80 text-white rounded-lg disabled:opacity-60 flex items-center text-sm font-medium transition-colors"
                        >
                            {isPending ? <Loader2 className="animate-spin mr-2" size={15} /> : null}
                            {tCommon('save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
