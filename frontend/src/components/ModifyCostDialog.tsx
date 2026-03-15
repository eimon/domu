"use client";

import { useEffect } from "react";
import { modifyCost, CostModifyFormState } from "@/actions/costs";
import { X, Loader2 } from "lucide-react";
import { useActionState } from "react";
import { Cost } from "@/types/api";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/utils";

interface ModifyCostDialogProps {
    cost: Cost;
    propertyId: string;
    isOpen: boolean;
    onClose: () => void;
}

const inputCls = "w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.10] text-white/90 focus:border-domu-primary/60 focus:ring-2 focus:ring-domu-primary/15 outline-none transition-all text-sm";
const labelCls = "block text-xs font-medium text-white/55 mb-1.5 uppercase tracking-wider";

export default function ModifyCostDialog({ cost, propertyId, isOpen, onClose }: ModifyCostDialogProps) {
    const initialState: CostModifyFormState = {};
    const t = useTranslations("Common");
    const tProp = useTranslations("Properties");

    const modifyCostWithIds = modifyCost.bind(null, cost.id, propertyId);
    const [state, formAction, isPending] = useActionState(modifyCostWithIds, initialState);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    useEffect(() => {
        if (state.success && isOpen) {
            onClose();
        }
    }, [state.success, isOpen, onClose]);

    if (!isOpen) return null;

    const currentValueDisplay =
        cost.calculation_type === "PERCENTAGE"
            ? `${Number(cost.value).toFixed(2)}%`
            : `$${formatPrice(cost.value)}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="glass-modal rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
                    <h3 className="text-base font-semibold text-white/90">{tProp("modifyCost")}</h3>
                    <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form action={formAction} className="p-6 space-y-4">
                    {state?.error && (
                        <div className="bg-domu-danger/10 border border-domu-danger/20 text-domu-danger/90 p-3 rounded-lg text-sm">{state.error}</div>
                    )}

                    <div className="bg-white/[0.05] rounded-lg px-4 py-3 text-sm border border-white/[0.07]">
                        <span className="text-white/40">{tProp("currentValue")}: </span>
                        <span className="font-semibold text-white/85">{currentValueDisplay}</span>
                        <span className="text-white/30 ml-2">— {cost.name}</span>
                    </div>

                    <div>
                        <label className={labelCls}>{tProp("newValue")}</label>
                        <input
                            name="value"
                            type="number"
                            step="0.01"
                            min="0.01"
                            required
                            placeholder="0.00"
                            className={inputCls}
                        />
                    </div>

                    <div>
                        <label className={labelCls}>{t("startDate")}</label>
                        <input
                            name="start_date"
                            type="date"
                            required
                            defaultValue={tomorrowStr}
                            min={tomorrowStr}
                            className={inputCls}
                        />
                        <p className="text-xs text-white/30 mt-1">{tProp("modifyDateHint")}</p>
                    </div>

                    <div className="pt-2 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-white/55 hover:bg-white/[0.05] hover:text-white/75 rounded-lg transition-colors"
                        >
                            {t("cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 bg-domu-primary hover:bg-domu-primary/80 text-white rounded-lg disabled:opacity-60 flex items-center text-sm font-medium transition-colors"
                        >
                            {isPending ? <Loader2 className="animate-spin mr-2" size={15} /> : null}
                            {tProp("applyChange")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
