"use client";

import { useState, useEffect, useRef } from "react";
import { Guest } from "@/types/api";
import { Pencil, Trash2, MoreVertical, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { deleteGuest } from "@/actions/guests";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";

interface GuestsTableProps {
    guests: Guest[];
}

function GuestCardMenu({
    isDeleting,
    onEdit,
    onDelete,
}: {
    isDeleting: boolean;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const t = useTranslations("Common");

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const item = (label: string, onClick: () => void, className = "", disabled = false) => (
        <button
            onClick={() => { setOpen(false); onClick(); }}
            disabled={disabled}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-white/[0.06] transition-colors disabled:opacity-40 ${className}`}
        >
            {label}
        </button>
    );

    return (
        <div ref={ref} className="relative">
            <button
                onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
                className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/[0.06] rounded-lg transition-colors"
            >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <MoreVertical size={16} />}
            </button>

            {open && (
                <div className="absolute right-0 top-8 z-30 w-40 glass-modal rounded-xl shadow-2xl border border-white/[0.08] overflow-hidden py-1">
                    {item(t("edit"), onEdit, "text-domu-primary/80")}
                    {item(t("delete"), onDelete, "text-domu-danger/80", isDeleting)}
                </div>
            )}
        </div>
    );
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
        <>
            {/* ── Mobile: cards ── */}
            <div className="flex flex-col gap-3 md:hidden">
                {guests.map((guest) => (
                    <div key={guest.id} className="glass rounded-xl px-4 py-3.5">
                        {/* Row 1: name + menu */}
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-sm font-semibold text-white/85">{guest.full_name}</span>
                            <GuestCardMenu
                                isDeleting={isDeleting === guest.id}
                                onEdit={() => {}}
                                onDelete={() => handleDelete(guest)}
                            />
                        </div>

                        {/* Row 2: email */}
                        {guest.email && (
                            <div className="text-xs text-white/45 mb-2">{guest.email}</div>
                        )}

                        {/* Row 3: document */}
                        <div className="flex items-center gap-2 text-xs text-white/40">
                            <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-white/45">
                                {tEnums(`DocumentType.${guest.document_type}`)}
                            </span>
                            <span className="font-mono">{guest.document_number}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Desktop: table ── */}
            <div className="hidden md:block glass rounded-xl overflow-hidden">
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
        </>
    );
}
