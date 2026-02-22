"use client";

import { useState, useEffect } from "react";
import { updateCost, CostFormState } from "@/actions/costs";
import { X, Loader2 } from "lucide-react";
import { useActionState } from "react";
import { Cost, CostCategory, CostCalculationType } from "@/types/api";
import { useTranslations } from "next-intl";

interface EditCostDialogProps {
    cost: Cost;
    propertyId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditCostDialog({ cost, propertyId, isOpen, onClose }: EditCostDialogProps) {
    const initialState: CostFormState = { error: "", success: false };
    const t = useTranslations("Common");
    const tProp = useTranslations("Properties");
    const tEnums = useTranslations("Enums");

    const updateCostWithIds = updateCost.bind(null, cost.id, propertyId);
    const [state, formAction, isPending] = useActionState(updateCostWithIds, initialState);

    // Close on success
    useEffect(() => {
        if (state.success && isOpen) {
            onClose();
        }
    }, [state.success, isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">{t('edit')} {tProp('costs')}</h3>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')}</label>
                        <input
                            name="name"
                            type="text"
                            required
                            defaultValue={cost.name}
                            placeholder="e.g. Cleaning Fee"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('category')}</label>
                            <select
                                name="category"
                                defaultValue={cost.category}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                {Object.values(CostCategory).map((cat) => (
                                    <option key={cat} value={cat}>
                                        {tEnums(`CostCategory.${cat}`)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('type')}</label>
                            <select
                                name="calculation_type"
                                defaultValue={cost.calculation_type}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                {Object.values(CostCalculationType).map((type) => (
                                    <option key={type} value={type}>
                                        {tEnums(`CostCalculationType.${type}`)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('value')}</label>
                        <div className="relative">
                            <input
                                name="value"
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                defaultValue={cost.value}
                                placeholder="0.00"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 flex items-center text-sm font-medium"
                        >
                            {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                            {t('update')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
