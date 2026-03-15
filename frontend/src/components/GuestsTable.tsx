"use client";

import { useState } from "react";
import { Guest } from "@/types/api";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { deleteGuest } from "@/actions/guests";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";

interface GuestsTableProps {
    guests: Guest[];
}

export default function GuestsTable({ guests }: GuestsTableProps) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const t = useTranslations("Common");
    const tGuest = useTranslations("Guests");
    const tEnums = useTranslations("Enums");
    const { showError } = useToast();
    const { confirm } = useConfirm();

    const handleDelete = async (guest: Guest) => {
        if (!await confirm(t('confirmDelete'))) return;

        setIsDeleting(guest.id);
        const result = await deleteGuest(guest.id);

        if (result.error) showError(result.error);
        setIsDeleting(null);
    };

    if (guests.length === 0) {
        return (
            <div className="text-center py-12 glass rounded-xl border-dashed border border-white/[0.08]">
                <p className="text-white/35 text-sm">{tGuest('noGuests')}</p>
            </div>
        );
    }

    return (
        <div className="glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/[0.06]">
                    <thead className="bg-white/[0.03]">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/35 uppercase tracking-wider">
                                {tGuest('fullName')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/35 uppercase tracking-wider">
                                {tGuest('email')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/35 uppercase tracking-wider">
                                {tGuest('documentType')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/35 uppercase tracking-wider">
                                {tGuest('documentNumber')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white/35 uppercase tracking-wider">
                                {t('actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                        {guests.map((guest) => (
                            <tr key={guest.id} className="hover:bg-white/[0.03] transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white/80">
                                    {guest.full_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50">
                                    {guest.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50">
                                    {tEnums(`DocumentType.${guest.document_type}`)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50 font-mono">
                                    {guest.document_number}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                    <div className="flex items-center justify-end space-x-1">
                                        <button
                                            className="p-1.5 text-domu-primary/70 hover:bg-domu-primary/10 hover:text-domu-primary rounded-lg transition-colors"
                                            title={t('edit')}
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(guest)}
                                            disabled={isDeleting === guest.id}
                                            className="p-1.5 text-domu-danger/70 hover:bg-domu-danger/10 hover:text-domu-danger rounded-lg transition-colors disabled:opacity-40"
                                            title={t('delete')}
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
    );
}
