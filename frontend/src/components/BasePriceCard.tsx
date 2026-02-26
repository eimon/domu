"use client";

import { useState, useEffect } from "react";
import { modifyBasePrice, revertBasePrice, BasePriceFormState } from "@/actions/base_price";
import { X, Loader2, TrendingUp, RotateCcw } from "lucide-react";
import { useActionState } from "react";
import { Property, PropertyBasePrice } from "@/types/api";
import { useTranslations } from "next-intl";

interface BasePriceCardProps {
    property: Property;
    currentBasePrice: PropertyBasePrice | null;
}

function ModifyBasePriceDialog({
    property,
    isOpen,
    onClose,
}: {
    property: Property;
    isOpen: boolean;
    onClose: () => void;
}) {
    const initialState: BasePriceFormState = {};
    const t = useTranslations("Common");
    const tProp = useTranslations("Properties");

    const modifyWithId = modifyBasePrice.bind(null, property.id);
    const [state, formAction, isPending] = useActionState(modifyWithId, initialState);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

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
                    <h3 className="text-lg font-semibold text-gray-900">{tProp("modifyBasePrice")}</h3>
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
                        <span className="font-semibold text-gray-900">
                            ${Number(property.base_price).toFixed(2)}
                        </span>
                        <span className="text-gray-400 ml-1">/ noche</span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{tProp("newValue")}</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">$</span>
                            <input
                                name="value"
                                type="number"
                                step="0.01"
                                min="0.01"
                                required
                                placeholder="0.00"
                                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
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

export default function BasePriceCard({ property, currentBasePrice }: BasePriceCardProps) {
    const [isModifyOpen, setIsModifyOpen] = useState(false);
    const [isReverting, setIsReverting] = useState(false);
    const tProp = useTranslations("Properties");

    const handleRevert = async () => {
        if (!confirm(tProp("confirmRevert"))) return;

        setIsReverting(true);
        const result = await revertBasePrice(property.id);
        if (result.error) alert(result.error);
        setIsReverting(false);
    };

    return (
        <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <TrendingUp size={18} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                                {tProp("basePriceLabel")}
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                ${Number(property.base_price).toFixed(2)}
                                <span className="text-sm font-normal text-gray-400 ml-1">/ noche</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {currentBasePrice?.root_price_id && (
                            <button
                                onClick={handleRevert}
                                disabled={isReverting}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
                                title={tProp("revertBasePrice")}
                            >
                                <RotateCcw size={14} className={`mr-1.5 ${isReverting ? "animate-spin" : ""}`} />
                                {tProp("revertBasePrice")}
                            </button>
                        )}
                        <button
                            onClick={() => setIsModifyOpen(true)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            {tProp("modifyBasePrice")}
                        </button>
                    </div>
                </div>
            </div>

            <ModifyBasePriceDialog
                property={property}
                isOpen={isModifyOpen}
                onClose={() => setIsModifyOpen(false)}
            />
        </>
    );
}
