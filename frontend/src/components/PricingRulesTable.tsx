"use client";

import { useState } from "react";
import { PricingRule } from "@/types/api";
import { Pencil, Trash2 } from "lucide-react";
import { deletePricingRule } from "@/actions/pricing";
import AddPricingRuleDialog from "./AddPricingRuleDialog";
import EditPricingRuleDialog from "./EditPricingRuleDialog";
import { useTranslations } from "next-intl";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";

interface PricingRulesTableProps {
    rules: PricingRule[];
    propertyId: string;
    basePrice: number;
}

export default function PricingRulesTable({ rules, propertyId, basePrice }: PricingRulesTableProps) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
    const t = useTranslations("Properties");
    const tCommon = useTranslations("Common");
    const { showError } = useToast();
    const { confirm } = useConfirm();

    const formatDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        return `${year}-${month}-${day}`;
    };

    const handleDelete = async (rule: PricingRule) => {
        if (!await confirm(tCommon('confirmDelete'))) return;

        setIsDeleting(rule.id);
        const result = await deletePricingRule(rule.id, propertyId);

        if (result.error) showError(result.error);
        setIsDeleting(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white/85">{t('rules')}</h3>
                    <p className="text-sm text-white/40">{t('rulesDescription')}</p>
                </div>
                <AddPricingRuleDialog propertyId={propertyId} basePrice={basePrice} />
            </div>

            {rules.length === 0 ? (
                <div className="text-center py-12 glass rounded-xl border-dashed border border-white/[0.08]">
                    <p className="text-white/35 text-sm">{t('noRules')}</p>
                </div>
            ) : (
                <div className="glass rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/[0.06]">
                            <thead className="bg-white/[0.03]">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/35 uppercase tracking-wider">
                                        {tCommon('name')}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/35 uppercase tracking-wider">
                                        {t('rulePeriod')}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white/35 uppercase tracking-wider">
                                        {t('ruleProfitability')}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white/35 uppercase tracking-wider">
                                        {tCommon('actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.05]">
                                {rules.map((rule) => (
                                    <tr key={rule.id} className="hover:bg-white/[0.03] transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white/80">
                                            {rule.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50 font-mono">
                                            {formatDate(rule.start_date)} — {formatDate(rule.end_date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80 text-right font-mono">
                                            {Number(rule.profitability_percent).toFixed(1)}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                            <div className="flex items-center justify-end space-x-1">
                                                <button
                                                    onClick={() => setEditingRule(rule)}
                                                    className="p-1.5 text-domu-primary/70 hover:bg-domu-primary/10 hover:text-domu-primary rounded-lg transition-colors"
                                                    title={tCommon('edit')}
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(rule)}
                                                    disabled={isDeleting === rule.id}
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
            )}

            {editingRule && (
                <EditPricingRuleDialog
                    rule={editingRule}
                    propertyId={propertyId}
                    basePrice={basePrice}
                    onClose={() => setEditingRule(null)}
                />
            )}
        </div>
    );
}
