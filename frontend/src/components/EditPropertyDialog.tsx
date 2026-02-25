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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
                    <h3 className="text-lg font-semibold text-gray-900">{tCommon('edit')}</h3>
                    <button
                        onClick={onClose}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('name')}
                        </label>
                        <input
                            name="name"
                            type="text"
                            required
                            defaultValue={property.name}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('address')}
                        </label>
                        <AddressAutocomplete
                            name="address"
                            required
                            defaultValue={property.address}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            onSelect={(lat, lon) => setCoords({ lat, lon })}
                        />
                        <input type="hidden" name="latitude" value={coords?.lat ?? ""} />
                        <input type="hidden" name="longitude" value={coords?.lon ?? ""} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('description')}
                        </label>
                        <textarea
                            name="description"
                            rows={4}
                            defaultValue={property.description || ""}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('basePrice')}
                            </label>
                            <input
                                name="base_price"
                                type="number"
                                step="0.01"
                                min="1"
                                required
                                defaultValue={property.base_price}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('avgStay')}
                            </label>
                            <input
                                name="avg_stay_days"
                                type="number"
                                min="1"
                                required
                                defaultValue={property.avg_stay_days}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end space-x-3 sticky bottom-0 bg-white pb-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                            {tCommon('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 flex items-center text-sm font-medium"
                        >
                            {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                            {tCommon('save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
