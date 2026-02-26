"use client";

import { useEffect } from "react";
import { modifyCost, CostModifyFormState } from "@/actions/costs";
import { X, Loader2 } from "lucide-react";
import { useActionState } from "react";
import { Cost } from "@/types/api";
import { useTranslations } from "next-intl";

interface ModifyCostDialogProps {
    cost: Cost;
    propertyId: string;
    isOpen: boolean;
    onClose: () => void;
}

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
            : `$${Number(cost.value).toFixed(2)}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">{tProp("modifyCost")}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form action={formAction} className="p-6 space-y-4">
                    {state?.error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{state.error}</div>
                    )}

                    <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm">
                        <span className="text-gray-500">{tProp("currentValue")}: </span>
                        <span className="font-semibold text-gray-900">{currentValueDisplay}</span>
                        <span className="text-gray-400 ml-2">— {cost.name}</span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{tProp("newValue")}</label>
                        <input
                            name="value"
                            type="number"
                            step="0.01"
                            min="0.01"
                            required
                            placeholder="0.00"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("startDate")}</label>
                        <input
                            name="start_date"
                            type="date"
                            required
                            defaultValue={tomorrowStr}
                            min={tomorrowStr}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <p className="text-xs text-gray-400 mt-1">{tProp("modifyDateHint")}</p>
                    </div>

                    <div className="pt-2 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                            {t("cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 flex items-center text-sm font-medium"
                        >
                            {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                            {tProp("applyChange")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
