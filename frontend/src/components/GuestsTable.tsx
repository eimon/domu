"use client";

import { useState } from "react";
import { Guest } from "@/types/api";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { deleteGuest } from "@/actions/guests";

interface GuestsTableProps {
    guests: Guest[];
}

export default function GuestsTable({ guests }: GuestsTableProps) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const t = useTranslations("Common");
    const tGuest = useTranslations("Guests");
    const tEnums = useTranslations("Enums");

    const handleDelete = async (guest: Guest) => {
        if (!confirm(t('confirmDelete'))) {
            return;
        }

        setIsDeleting(guest.id);
        const result = await deleteGuest(guest.id);

        if (result.error) {
            alert(result.error);
        }
        setIsDeleting(null);
    };

    if (guests.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">{tGuest('noGuests')}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {tGuest('fullName')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {tGuest('email')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {tGuest('documentType')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {tGuest('documentNumber')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t('actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {guests.map((guest) => (
                            <tr key={guest.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {guest.full_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {guest.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {tEnums(`DocumentType.${guest.document_type}`)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                    {guest.document_number}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title={t('edit')}
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(guest)}
                                            disabled={isDeleting === guest.id}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                            title={t('delete')}
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
    );
}
