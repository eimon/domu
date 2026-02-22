"use client";

import { useState } from "react";
import { Cost } from "@/types/api";
import { Pencil, Trash2 } from "lucide-react";
import EditCostDialog from "./EditCostDialog";
import { deleteCost } from "@/actions/costs";
import { useTranslations } from "next-intl";

interface CostsTableProps {
    costs: Cost[];
    propertyId: string;
}

export default function CostsTable({ costs, propertyId }: CostsTableProps) {
    const [editingCost, setEditingCost] = useState<Cost | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const t = useTranslations("Properties");
    const tCommon = useTranslations("Common");
    const tEnums = useTranslations("Enums");

    const handleDelete = async (cost: Cost) => {
        if (!confirm(tCommon('confirmDelete'))) {
            return;
        }

        setIsDeleting(cost.id);
        const result = await deleteCost(cost.id, propertyId);

        if (result.error) {
            alert(result.error);
        }
        setIsDeleting(null);
    };

    if (costs.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">No costs added yet.</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Value
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {costs.map((cost) => (
                                <tr key={cost.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {cost.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                        {tEnums(`CostCategory.${cost.category}`)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                        {tEnums(`CostCalculationType.${cost.calculation_type}`)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                                        {cost.calculation_type === "PERCENTAGE" ? `${cost.value}%` : `$${Number(cost.value).toFixed(2)}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => setEditingCost(cost)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title={tCommon('edit')}
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cost)}
                                                disabled={isDeleting === cost.id}
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

            {editingCost && (
                <EditCostDialog
                    cost={editingCost}
                    propertyId={propertyId}
                    isOpen={!!editingCost}
                    onClose={() => setEditingCost(null)}
                />
            )}
        </>
    );
}
