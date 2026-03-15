"use client";

import { useState, useEffect } from "react";
import { Cost } from "@/types/api";
import { Pencil, Trash2, CalendarClock, RotateCcw, History, Ban } from "lucide-react";
import EditCostDialog from "./EditCostDialog";
import ModifyCostDialog from "./ModifyCostDialog";
import FinalizeCostDialog from "./FinalizeCostDialog";
import PriceHistoryDialog from "./PriceHistoryDialog";
import { deleteCost, revertCost, getCostHistory, fetchCosts } from "@/actions/costs";
import { useTranslations } from "next-intl";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";
import { formatPrice } from "@/lib/utils";

interface CostsTableProps {
    costs: Cost[];
    propertyId: string;
}

export default function CostsTable({ costs, propertyId }: CostsTableProps) {
    const [editingCost, setEditingCost] = useState<Cost | null>(null);
    const [modifyingCost, setModifyingCost] = useState<Cost | null>(null);
    const [finalizingCost, setFinalizingCost] = useState<Cost | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isReverting, setIsReverting] = useState<string | null>(null);
    const [historyFor, setHistoryFor] = useState<{ cost: Cost; entries: Cost[] } | null>(null);
    const [showAll, setShowAll] = useState(false);
    const [allCosts, setAllCosts] = useState<Cost[] | null>(null);
    const t = useTranslations("Properties");
    const tCommon = useTranslations("Common");
    const tEnums = useTranslations("Enums");
    const { showError } = useToast();
    const { confirm } = useConfirm();

    const todayStr = new Date().toISOString().split("T")[0];
    const displayedCosts = showAll && allCosts !== null ? allCosts : costs;

    // When costs prop changes (server re-render after mutation) and showAll=true, re-fetch
    useEffect(() => {
        if (showAll) {
            fetchCosts(propertyId, true).then(setAllCosts);
        }
    }, [costs, showAll, propertyId]);

    const handleToggleShowAll = async (checked: boolean) => {
        setShowAll(checked);
        if (checked) {
            const fetched = await fetchCosts(propertyId, true);
            setAllCosts(fetched);
        }
    };

    const handleDelete = async (cost: Cost) => {
        if (!await confirm(tCommon('confirmDelete'))) return;

        setIsDeleting(cost.id);
        const result = await deleteCost(cost.id, propertyId);
        if (result.error) showError(result.error);
        setIsDeleting(null);
    };

    const handleHistory = async (cost: Cost) => {
        const entries = await getCostHistory(cost.id);
        setHistoryFor({ cost, entries });
    };

    const handleRevert = async (cost: Cost) => {
        if (!await confirm(t('confirmRevert'))) return;

        setIsReverting(cost.id);
        const result = await revertCost(cost.id, propertyId);
        if (result.error) showError(result.error);
        setIsReverting(null);
    };

    if (displayedCosts.length === 0 && !showAll) {
        return (
            <div className="text-center py-12 glass rounded-xl border-dashed border border-white/[0.08]">
                <p className="text-white/35 text-sm">{tCommon('noCosts')}</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center justify-end mb-3">
                <label className="flex items-center gap-2 text-sm text-white/50 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={showAll}
                        onChange={(e) => handleToggleShowAll(e.target.checked)}
                        className="rounded border-white/20 bg-white/[0.06] accent-domu-primary"
                    />
                    {t("showAllCosts")}
                </label>
            </div>
            <div className="glass rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/[0.06]">
                        <thead className="bg-white/[0.03]">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/35 uppercase tracking-wider">
                                    {tCommon('name')}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/35 uppercase tracking-wider">
                                    {tCommon('category')}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/35 uppercase tracking-wider">
                                    {tCommon('type')}
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white/35 uppercase tracking-wider">
                                    {tCommon('value')}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/35 uppercase tracking-wider">
                                    {tCommon('startDate')}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/35 uppercase tracking-wider">
                                    {tCommon('endDate')}
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white/35 uppercase tracking-wider">
                                    {tCommon('actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                            {displayedCosts.map((cost) => {
                                const isFinalized = !!cost.end_date && cost.end_date < todayStr;
                                const isFuture = !!cost.start_date && cost.start_date > todayStr;
                                return (
                                <tr key={cost.id} className={`hover:bg-white/[0.03] transition-colors ${isFinalized ? "opacity-60" : ""}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white/80">
                                        <span className={isFinalized ? "line-through text-white/40" : ""}>{cost.name}</span>
                                        {isFinalized && (
                                            <span className="ml-2 text-xs text-white/35 font-normal">
                                                {t("finalized")}
                                            </span>
                                        )}
                                        {isFuture && (
                                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-domu-primary/15 text-domu-primary/80">
                                                {t("upcoming")}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50 capitalize">
                                        {tEnums(`CostCategory.${cost.category}`)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50 capitalize">
                                        {tEnums(`CostCalculationType.${cost.calculation_type}`)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80 text-right font-mono">
                                        {cost.calculation_type === "PERCENTAGE" ? `${cost.value}%` : `$${formatPrice(cost.value)}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/45">
                                        {cost.start_date
                                            ? cost.category === "RECURRING_MONTHLY"
                                                ? new Date(cost.start_date + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "short" })
                                                : new Date(cost.start_date + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
                                            : "—"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/45">
                                        {cost.end_date
                                            ? cost.category === "RECURRING_MONTHLY"
                                                ? new Date(cost.end_date + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "short" })
                                                : new Date(cost.end_date + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
                                            : "—"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                        <div className="flex items-center justify-end space-x-1">
                                            <button
                                                onClick={() => handleHistory(cost)}
                                                className="p-1.5 text-white/40 hover:bg-white/[0.06] hover:text-white/70 rounded-lg transition-colors"
                                                title={tCommon('history')}
                                            >
                                                <History size={15} />
                                            </button>
                                            {!isFinalized && !isFuture && (
                                                <button
                                                    onClick={() => setModifyingCost(cost)}
                                                    className="p-1.5 text-domu-warning/70 hover:bg-domu-warning/10 hover:text-domu-warning rounded-lg transition-colors"
                                                    title={t('modifyCost')}
                                                >
                                                    <CalendarClock size={15} />
                                                </button>
                                            )}
                                            {!isFinalized && !isFuture && (
                                                <button
                                                    onClick={() => setFinalizingCost(cost)}
                                                    className="p-1.5 text-orange-400/70 hover:bg-orange-400/10 hover:text-orange-400 rounded-lg transition-colors"
                                                    title={t('finalizeCost')}
                                                >
                                                    <Ban size={15} />
                                                </button>
                                            )}
                                            {cost.root_cost_id && (
                                                <button
                                                    onClick={() => handleRevert(cost)}
                                                    disabled={isReverting === cost.id}
                                                    className="p-1.5 text-violet-400/70 hover:bg-violet-400/10 hover:text-violet-400 rounded-lg transition-colors disabled:opacity-40"
                                                    title={t('revertCost')}
                                                >
                                                    <RotateCcw size={15} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setEditingCost(cost)}
                                                className="p-1.5 text-domu-primary/70 hover:bg-domu-primary/10 hover:text-domu-primary rounded-lg transition-colors"
                                                title={tCommon('edit')}
                                            >
                                                <Pencil size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cost)}
                                                disabled={isDeleting === cost.id}
                                                className="p-1.5 text-domu-danger/70 hover:bg-domu-danger/10 hover:text-domu-danger rounded-lg transition-colors disabled:opacity-40"
                                                title={tCommon('delete')}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {editingCost && (
                <EditCostDialog
                    cost={editingCost}
                    propertyId={propertyId}
                    isOpen={!!editingCost}
                    onClose={() => setEditingCost(null)}
                />
            )}

            {modifyingCost && (
                <ModifyCostDialog
                    cost={modifyingCost}
                    propertyId={propertyId}
                    isOpen={!!modifyingCost}
                    onClose={() => setModifyingCost(null)}
                />
            )}

            {finalizingCost && (
                <FinalizeCostDialog
                    cost={finalizingCost}
                    propertyId={propertyId}
                    isOpen={!!finalizingCost}
                    onClose={() => setFinalizingCost(null)}
                />
            )}

            {historyFor && (
                <PriceHistoryDialog
                    title={`${tCommon('history')} — ${historyFor.cost.name}`}
                    history={historyFor.entries}
                    formatValue={(v) =>
                        historyFor.cost.calculation_type === "PERCENTAGE"
                            ? `${v}%`
                            : `$${formatPrice(v)}`
                    }
                    isMonthly={historyFor.cost.category === "RECURRING_MONTHLY"}
                    isOpen
                    onClose={() => setHistoryFor(null)}
                />
            )}
        </>
    );
}
