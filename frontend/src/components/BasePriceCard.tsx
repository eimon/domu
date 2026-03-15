"use client";

import { useState, useEffect } from "react";
import { modifyBasePrice, revertBasePrice, BasePriceFormState } from "@/actions/base_price";
import { X, Loader2, TrendingUp, RotateCcw } from "lucide-react";
import { useActionState } from "react";
import { Property, PropertyBasePrice } from "@/types/api";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";

interface BasePriceCardProps {
    property: Property;
    currentBasePrice: PropertyBasePrice | null;
}

function ModifyBasePriceDialog({
    property,
    currentBasePrice,
    isOpen,
    onClose,
}: {
    property: Property;
    currentBasePrice: PropertyBasePrice | null;
    isOpen: boolean;
    onClose: () => void;
}) {
    const initialState: BasePriceFormState = {};
    const t = useTranslations("Common");
    const tProp = useTranslations("Properties");

    const modifyWithId = modifyBasePrice.bind(null, property.id);
    const [state, formAction, isPending] = useActionState(modifyWithId, initialState);

    const todayStr = new Date().toISOString().split("T")[0];
    const minStr = (() => {
        const start = currentBasePrice?.start_date;
        if (!start) return undefined;
        const d = new Date(start);
        d.setDate(d.getDate() + 1);
        return d.toISOString().split("T")[0];
    })();
    const defaultDateStr = minStr && minStr > todayStr ? minStr : todayStr;

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
                    <h3 className="text-base font-semibold text-white/90">{tProp("modifyBasePrice")}</h3>
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
                        <span className="font-semibold text-white/85">
                            ${formatPrice(property.base_price)}
                        </span>
                        <span className="text-white/30 ml-1">/ noche</span>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-white/55 mb-1.5 uppercase tracking-wider">{tProp("newValue")}</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-white/35 text-sm">$</span>
                            <input
                                name="value"
                                type="number"
                                step="0.01"
                                min="0.01"
                                required
                                placeholder="0.00"
                                className="w-full pl-7 pr-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.10] text-white/90 focus:border-domu-primary/60 focus:ring-2 focus:ring-domu-primary/15 outline-none transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-white/55 mb-1.5 uppercase tracking-wider">{t("startDate")}</label>
                        <input
                            name="start_date"
                            type="date"
                            required
                            defaultValue={defaultDateStr}
                            min={minStr}
                            className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.10] text-white/90 focus:border-domu-primary/60 focus:ring-2 focus:ring-domu-primary/15 outline-none transition-all text-sm"
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

export default function BasePriceCard({ property, currentBasePrice }: BasePriceCardProps) {
    const [isModifyOpen, setIsModifyOpen] = useState(false);
    const [isReverting, setIsReverting] = useState(false);
    const tProp = useTranslations("Properties");
    const { showError } = useToast();
    const { confirm } = useConfirm();

    const handleRevert = async () => {
        if (!await confirm(tProp("confirmRevert"))) return;

        setIsReverting(true);
        const result = await revertBasePrice(property.id);
        if (result.error) showError(result.error);
        setIsReverting(false);
    };

    return (
        <>
            <div className="glass rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-domu-primary/10 rounded-xl">
                            <TrendingUp size={18} className="text-domu-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-0.5">
                                {tProp("basePriceLabel")}
                            </p>
                            <p className="text-2xl font-bold text-white/90">
                                ${formatPrice(property.base_price)}
                                <span className="text-sm font-normal text-white/30 ml-1">/ noche</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {currentBasePrice?.root_price_id && (
                            <button
                                onClick={handleRevert}
                                disabled={isReverting}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-violet-400 border border-violet-400/25 rounded-lg hover:bg-violet-400/10 transition-colors disabled:opacity-40"
                                title={tProp("revertBasePrice")}
                            >
                                <RotateCcw size={13} className={`mr-1.5 ${isReverting ? "animate-spin" : ""}`} />
                                {tProp("revertBasePrice")}
                            </button>
                        )}
                        <button
                            onClick={() => setIsModifyOpen(true)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-domu-primary/80 border border-domu-primary/25 rounded-lg hover:bg-domu-primary/10 transition-colors"
                        >
                            {tProp("modifyBasePrice")}
                        </button>
                    </div>
                </div>
            </div>

            <ModifyBasePriceDialog
                property={property}
                currentBasePrice={currentBasePrice}
                isOpen={isModifyOpen}
                onClose={() => setIsModifyOpen(false)}
            />
        </>
    );
}
