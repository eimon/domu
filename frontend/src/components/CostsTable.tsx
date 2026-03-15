"use client";

import { useState } from "react";
import { Cost } from "@/types/api";
import { Pencil, Trash2, CalendarClock, RotateCcw } from "lucide-react";
import EditCostDialog from "./EditCostDialog";
import ModifyCostDialog from "./ModifyCostDialog";
import { deleteCost, revertCost } from "@/actions/costs";
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
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isReverting, setIsReverting] = useState<string | null>(null);
    const t = useTranslations("Properties");
    const tCommon = useTranslations("Common");
    const tEnums = useTranslations("Enums");
    const { showError } = useToast();
    const { confirm } = useConfirm();

    const handleDelete = async (cost: Cost) => {
        if (!await confirm(tCommon('confirmDelete'))) return;

        setIsDeleting(cost.id);
        const result = await deleteCost(cost.id, propertyId);
        if (result.error) showError(result.error);
        setIsDeleting(null);
    };

    const handleRevert = async (cost: Cost) => {
        if (!await confirm(t('confirmRevert'))) return;

        setIsReverting(cost.id);
        const result = await revertCost(cost.id, propertyId);
        if (result.error) showError(result.error);
        setIsReverting(null);
    };

    if (costs.length === 0) {
        return (
            <div className="text-center py-12 glass rounded-xl border-dashed border border-white/[0.08]">
                <p className="text-white/35 text-sm">{tCommon('noCosts')}</p>
            </div>
        );
    }

    return (
        <>
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
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white/35 uppercase tracking-wider">
                                    {tCommon('actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                            {costs.map((cost) => (
                                <tr key={cost.id} className="hover:bg-white/[0.03] transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white/80">
                                        {cost.name}
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                        <div className="flex items-center justify-end space-x-1">
                                            <button
                                                onClick={() => setModifyingCost(cost)}
                                                className="p-1.5 text-domu-warning/70 hover:bg-domu-warning/10 hover:text-domu-warning rounded-lg transition-colors"
                                                title={t('modifyCost')}
                                            >
                                                <CalendarClock size={15} />
                                            </button>
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
                            ))}
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
        </>
    );
}
