"use client";

import { useState } from "react";
import { Property } from "@/types/api";
import { Pencil, Trash2 } from "lucide-react";
import { deleteProperty } from "@/actions/properties";
import { useRouter } from "next/navigation";
import EditPropertyDialog from "@/components/EditPropertyDialog";

interface PropertyActionsProps {
    property: Property;
}

import { useTranslations } from "next-intl";

export default function PropertyActions({ property }: PropertyActionsProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();
    const t = useTranslations("Common");
    const tProps = useTranslations("Properties.create"); // For reuse or create specific keys later, using Common for now for Edit/Delete

    const handleDelete = async () => {
        if (!confirm(t('confirmDelete'))) {
            return;
        }

        setIsDeleting(true);
        const result = await deleteProperty(property.id);

        if (result.error) {
            alert(result.error);
            setIsDeleting(false);
        } else {
            // Redirect to properties list on success
            router.push("/properties");
        }
    };

    return (
        <>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setIsEditOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                    <Pencil size={16} className="mr-2" />
                    {t('edit')}
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-70"
                >
                    <Trash2 size={16} className="mr-2" />
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
