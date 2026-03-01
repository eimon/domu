"use client";

import { useState } from "react";
import { PricingRule } from "@/types/api";
import { Pencil, Trash2 } from "lucide-react";
import { deletePricingRule } from "@/actions/pricing";
import AddPricingRuleDialog from "./AddPricingRuleDialog";
import EditPricingRuleDialog from "./EditPricingRuleDialog";
import { useTranslations } from "next-intl";

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

    const formatDate = (dateStr: string) => {
        // Fix for timezone shift: parse as local date by appending time if missing, 
        // or just split and use components to avoid Date constructor UTC assumptions.
        const [year, month, day] = dateStr.split('-');
        return `${year}-${month}-${day}`;
    };

    const handleDelete = async (rule: PricingRule) => {
        if (!confirm(tCommon('confirmDelete'))) {
            return;
        }

        setIsDeleting(rule.id);
        const result = await deletePricingRule(rule.id, propertyId);

        if (result.error) {
            alert(result.error);
        }
        setIsDeleting(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('rules')}</h3>
                    <p className="text-sm text-gray-500">{t('rulesDescription')}</p>
                </div>
                <AddPricingRuleDialog propertyId={propertyId} basePrice={basePrice} />
            </div>

            {rules.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm">{t('noRules')}</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {tCommon('name')}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('rulePeriod')}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('ruleProfitability')}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {tCommon('actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {rules.map((rule) => (
                                    <tr key={rule.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {rule.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                            {formatDate(rule.start_date)} - {formatDate(rule.end_date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                                            {Number(rule.profitability_percent).toFixed(1)}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => setEditingRule(rule)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title={tCommon('edit')}
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(rule)}
                                                    disabled={isDeleting === rule.id}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                                    title={tCommon('delete')}
                                                >
                                                    <Trash2 size={16} />
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
