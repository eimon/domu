"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";

interface HistoryEntry {
    value: number;
    start_date?: string | null;
    end_date?: string | null;
}

interface PriceHistoryDialogProps {
    title: string;
    history: HistoryEntry[];
    formatValue: (value: number) => string;
    isMonthly?: boolean;
    isOpen: boolean;
    onClose: () => void;
}

function formatDate(dateStr: string | null | undefined, monthly: boolean): string {
    if (!dateStr) return "—";
    const d = new Date(dateStr + "T00:00:00");
    if (monthly) return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function PriceHistoryDialog({
    title,
    history,
    formatValue,
    isMonthly = false,
    isOpen,
    onClose,
}: PriceHistoryDialogProps) {
    const tCommon = useTranslations("Common");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="glass-modal rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
                    <h3 className="text-base font-semibold text-white/90">{title}</h3>
                    <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="overflow-y-auto max-h-96">
                    {history.length === 0 ? (
                        <p className="text-center text-sm text-white/35 py-10">{tCommon("noData")}</p>
                    ) : (
                        <table className="min-w-full divide-y divide-white/[0.06]">
                            <thead className="bg-white/[0.03]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white/35 uppercase tracking-wider">
                                        {tCommon("value")}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white/35 uppercase tracking-wider">
                                        {tCommon("from")}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white/35 uppercase tracking-wider">
                                        {tCommon("until")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.05]">
                                {[...history].reverse().map((entry, i) => {
                                    const isCurrent = !entry.end_date;
                                    return (
                                        <tr key={i} className={isCurrent ? "bg-domu-primary/5" : ""}>
                                            <td className={`px-6 py-3 text-sm font-mono ${isCurrent ? "text-white/90 font-semibold" : "text-white/55"}`}>
                                                {formatValue(entry.value)}
                                            </td>
                                            <td className={`px-6 py-3 text-sm ${isCurrent ? "text-white/75" : "text-white/45"}`}>
                                                {formatDate(entry.start_date, isMonthly)}
                                            </td>
                                            <td className={`px-6 py-3 text-sm ${isCurrent ? "text-domu-primary/80 font-medium" : "text-white/45"}`}>
                                                {isCurrent ? tCommon("current") : formatDate(entry.end_date, isMonthly)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
