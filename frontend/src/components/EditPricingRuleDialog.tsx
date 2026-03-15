"use client";

import { useState, useEffect } from "react";
import { PricingRule } from "@/types/api";
import { updatePricingRule, PricingRuleFormState } from "@/actions/pricing";
import { X, Loader2 } from "lucide-react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/utils";

interface EditPricingRuleDialogProps {
    rule: PricingRule;
    propertyId: string;
    basePrice: number;
    onClose: () => void;
}

const inputCls = "w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.10] text-white/90 focus:border-domu-primary/60 focus:ring-2 focus:ring-domu-primary/15 outline-none transition-all text-sm";
const labelCls = "block text-xs font-medium text-white/55 mb-1.5 uppercase tracking-wider";

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
    const estimatedPrice = formatPrice(basePrice * profitability / 100);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="glass-modal rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
                    <h3 className="text-base font-semibold text-white/90">{t('edit')} {tProp('rules')}</h3>
                    <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form action={formAction} className="p-6 space-y-4">
                    {state?.error && (
                        <div className="bg-domu-danger/10 border border-domu-danger/20 text-domu-danger/90 p-3 rounded-lg text-sm">
                            {state.error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="edit_rule_name" className={labelCls}>
                            {t('name')}
                        </label>
                        <input
                            id="edit_rule_name"
                            name="name"
                            type="text"
                            required
                            defaultValue={rule.name}
                            className={inputCls}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="edit_rule_start_date" className={labelCls}>{t('dateFrom')}</label>
                            <input
                                id="edit_rule_start_date"
                                name="start_date"
                                type="date"
                                required
                                defaultValue={rule.start_date}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label htmlFor="edit_rule_end_date" className={labelCls}>{t('dateTo')}</label>
                            <input
                                id="edit_rule_end_date"
                                name="end_date"
                                type="date"
                                required
                                defaultValue={rule.end_date}
                                className={inputCls}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label htmlFor="edit_rule_profitability_percent" className={labelCls}>
                                {t('profitabilityPercent')}
                            </label>
                            <span className="text-xs font-semibold text-domu-primary/80">
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
                            className={`${inputCls} mb-3`}
                        />
                        <input
                            type="range"
                            min={0}
                            max={100}
                            step={1}
                            value={sliderValue}
                            onChange={(e) => setProfitability(parseFloat(e.target.value))}
                            className="w-full h-2 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-domu-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-domu-primary [&::-moz-range-thumb]:border-0"
                            style={{
                                background: `linear-gradient(to right, #818cf8 0%, #818cf8 ${sliderValue}%, rgba(255,255,255,0.10) ${sliderValue}%, rgba(255,255,255,0.10) 100%)`
                            }}
                        />
                        <div className="flex justify-between text-xs text-white/25 mt-1">
                            <span>{tProp('pricingFloorLabel')}</span>
                            <span>{tProp('pricingBaseLabel', { price: formatPrice(basePrice) })}</span>
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-white/55 hover:bg-white/[0.05] hover:text-white/75 rounded-lg transition-colors"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 bg-domu-primary hover:bg-domu-primary/80 text-white rounded-lg disabled:opacity-60 flex items-center text-sm font-medium transition-colors"
                        >
                            {isPending ? <Loader2 className="animate-spin mr-2" size={15} /> : null}
                            {t('save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
