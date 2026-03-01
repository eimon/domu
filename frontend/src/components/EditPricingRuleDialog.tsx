"use client";

import { useState, useEffect } from "react";
import { PricingRule } from "@/types/api";
import { updatePricingRule, PricingRuleFormState } from "@/actions/pricing";
import { X, Loader2 } from "lucide-react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";

interface EditPricingRuleDialogProps {
    rule: PricingRule;
    propertyId: string;
    basePrice: number;
    onClose: () => void;
}

export default function EditPricingRuleDialog({ rule, propertyId, basePrice, onClose }: EditPricingRuleDialogProps) {
    const [profitability, setProfitability] = useState(Number(rule.profitability_percent));
    const initialState: PricingRuleFormState = { error: "", success: false };
    const t = useTranslations("Common");
    const tProp = useTranslations("Properties");

    const updateWithId = updatePricingRule.bind(null, rule.id, propertyId);
    const [state, formAction, isPending] = useActionState(updateWithId, initialState);

    useEffect(() => {
        if (state.success) {
            onClose();
        }
    }, [state.success, onClose]);

    const sliderValue = Math.min(Math.max(profitability, 0), 100);
    const estimatedPrice = (basePrice * profitability / 100).toFixed(2);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">{t('edit')} {tProp('rules')}</h3>
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
                        <label htmlFor="edit_rule_name" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('name')}
                        </label>
                        <input
                            id="edit_rule_name"
                            name="name"
                            type="text"
                            required
                            defaultValue={rule.name}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="edit_rule_start_date" className="block text-sm font-medium text-gray-700 mb-1">{t('dateFrom')}</label>
                            <input
                                id="edit_rule_start_date"
                                name="start_date"
                                type="date"
                                required
                                defaultValue={rule.start_date}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label htmlFor="edit_rule_end_date" className="block text-sm font-medium text-gray-700 mb-1">{t('dateTo')}</label>
                            <input
                                id="edit_rule_end_date"
                                name="end_date"
                                type="date"
                                required
                                defaultValue={rule.end_date}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label htmlFor="edit_rule_profitability_percent" className="block text-sm font-medium text-gray-700">
                                {t('profitabilityPercent')}
                            </label>
                            <span className="text-sm font-semibold text-blue-700">
                                {tProp('estimatedPrice', { price: estimatedPrice })}
                            </span>
                        </div>
                        <input
                            id="edit_rule_profitability_percent"
                            name="profitability_percent"
                            type="number"
                            step="0.1"
                            min="0"
                            required
                            value={profitability}
                            onChange={(e) => setProfitability(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-3"
                        />
                        <input
                            type="range"
                            min={0}
                            max={100}
                            step={1}
                            value={sliderValue}
                            onChange={(e) => setProfitability(parseFloat(e.target.value))}
                            className="w-full h-2 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:border-0"
                            style={{
                                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${sliderValue}%, #e5e7eb ${sliderValue}%, #e5e7eb 100%)`
                            }}
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>{tProp('pricingFloorLabel')}</span>
                            <span>{tProp('pricingBaseLabel', { price: basePrice })}</span>
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
                            {t('save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
