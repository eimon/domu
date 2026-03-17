"use client";

import { useState } from "react";
import { Property } from "@/types/api";
import { Pencil, Trash2 } from "lucide-react";
import { deleteProperty } from "@/actions/properties";
import { useRouter } from "@/i18n/routing";
import EditPropertyDialog from "@/components/EditPropertyDialog";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";

interface PropertyActionsProps {
    property: Property;
}

import { useTranslations } from "next-intl";

export default function PropertyActions({ property }: PropertyActionsProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();
    const t = useTranslations("Common");
    const { showError } = useToast();
    const { confirm } = useConfirm();

    const handleDelete = async () => {
        if (!await confirm(t('confirmDelete'))) return;

        setIsDeleting(true);
        const result = await deleteProperty(property.id);

        if (result.error) {
            showError(result.error);
            setIsDeleting(false);
        } else {
            router.push("/properties");
        }
    };

    return (
        <>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setIsEditOpen(true)}
                    className="inline-flex items-center px-4 py-2 glass hover:bg-white/[0.08] text-white/70 hover:text-white/90 rounded-lg transition-all text-sm font-medium"
                >
                    <Pencil size={14} className="mr-2" />
                    {t('edit')}
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="inline-flex items-center px-4 py-2 bg-domu-danger/10 hover:bg-domu-danger/20 text-domu-danger rounded-lg transition-colors text-sm font-medium disabled:opacity-50 border border-domu-danger/20"
                >
                    <Trash2 size={14} className="mr-2" />
                    {isDeleting ? t('loading') : t('delete')}
                </button>
            </div>

            {isEditOpen && (
                <EditPropertyDialog
                    property={property}
                    onClose={() => setIsEditOpen(false)}
                />
            )}
        </>
    );
}
