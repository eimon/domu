"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { X, Loader2 } from "lucide-react";
import { finalizeCost, CostFinalizeFormState } from "@/actions/costs";
import { Cost } from "@/types/api";
import { useTranslations } from "next-intl";

interface FinalizeCostDialogProps {
    cost: Cost;
    propertyId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function FinalizeCostDialog({ cost, propertyId, isOpen, onClose }: FinalizeCostDialogProps) {
    const initialState: CostFinalizeFormState = {};
    const t = useTranslations("Common");
    const tProp = useTranslations("Properties");

    const finalizeWithId = finalizeCost.bind(null, cost.id, propertyId);
    const [state, formAction, isPending] = useActionState(finalizeWithId, initialState);

    const isMonthly = cost.category === "RECURRING_MONTHLY";
    const todayStr = new Date().toISOString().split("T")[0];
    const todayMonth = todayStr.slice(0, 7);

    const minStr = (() => {
        if (!cost.start_date) return undefined;
        if (isMonthly) return cost.start_date.slice(0, 7);
        return cost.start_date;
    })();

    const defaultDateStr = isMonthly
        ? (minStr && minStr > todayMonth ? minStr : todayMonth)
        : (minStr && minStr > todayStr ? minStr : todayStr);

    useEffect(() => {
        if (state.success && isOpen) {
            onClose();
        }
    }, [state.success, isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="glass-modal rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
                    <h3 className="text-base font-semibold text-white/90">{tProp("finalizeCost")}</h3>
                    <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form action={formAction} className="p-6 space-y-4">
                    {state?.error && (
                        <div className="bg-domu-danger/10 border border-domu-danger/20 text-domu-danger/90 p-3 rounded-lg text-sm">{state.error}</div>
                    )}

                    <p className="text-sm text-white/50">{tProp("finalizeHint")}</p>

                    <div>
                        <label className="block text-xs font-medium text-white/55 mb-1.5 uppercase tracking-wider">
                            {tProp("finalizeEndDate")}
                        </label>
                        <input
                            name="end_date"
                            type={isMonthly ? "month" : "date"}
                            required
                            defaultValue={defaultDateStr}
                            min={minStr}
                            className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.10] text-white/90 focus:border-domu-primary/60 focus:ring-2 focus:ring-domu-primary/15 outline-none transition-all text-sm"
                        />
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
                            className="px-4 py-2 bg-domu-warning hover:bg-domu-warning/80 text-white rounded-lg disabled:opacity-60 flex items-center text-sm font-medium transition-colors"
                        >
                            {isPending ? <Loader2 className="animate-spin mr-2" size={15} /> : null}
                            {tProp("finalizeConfirm")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
