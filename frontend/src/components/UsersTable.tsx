"use client";

import { useState } from "react";
import { User, UserRole } from "@/types/api";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { deleteUser } from "@/actions/users";
import EditUserDialog from "@/components/EditUserDialog";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";

interface UsersTableProps {
    users: User[];
}

const roleBadgeClass: Record<string, string> = {
    [UserRole.ADMIN]:   "bg-domu-danger/12 text-domu-danger",
    [UserRole.MANAGER]: "bg-domu-primary/12 text-domu-primary",
    [UserRole.OWNER]:   "bg-domu-success/12 text-domu-success",
};

export default function UsersTable({ users }: UsersTableProps) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const t = useTranslations("Common");
    const tUsers = useTranslations("Users");
    const tEnums = useTranslations("Enums");
    const { showError } = useToast();
    const { confirm } = useConfirm();

    const handleDelete = async (user: User) => {
        if (!await confirm(tUsers("deleteConfirm"))) return;

        setIsDeleting(user.id);
        const result = await deleteUser(user.id);

        if (result.error) showError(result.error);
        setIsDeleting(null);
    };

    if (users.length === 0) {
        return (
            <div className="text-center py-12 glass rounded-xl border-dashed border border-white/[0.08]">
                <p className="text-white/35 text-sm">{tUsers("noUsers")}</p>
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
                                    {tUsers("fullName")}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/35 uppercase tracking-wider">
                                    {tUsers("email")}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/35 uppercase tracking-wider">
                                    {tUsers("username")}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/35 uppercase tracking-wider">
                                    {tUsers("role")}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/35 uppercase tracking-wider">
                                    {tUsers("status")}
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white/35 uppercase tracking-wider">
                                    {t("actions")}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/[0.03] transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white/80">
                                        {user.full_name || "—"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50 font-mono">
                                        {user.username}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadgeClass[user.role] ?? "bg-white/[0.06] text-white/45"}`}>
                                            {tEnums(`UserRole.${user.role}`)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            user.is_active
                                                ? "bg-domu-success/12 text-domu-success"
                                                : "bg-white/[0.05] text-white/35"
                                        }`}>
                                            {user.is_active ? tUsers("active") : tUsers("inactive")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                        <div className="flex items-center justify-end space-x-1">
                                            <button
                                                onClick={() => setEditingUser(user)}
                                                className="p-1.5 text-domu-primary/70 hover:bg-domu-primary/10 hover:text-domu-primary rounded-lg transition-colors"
                                                title={t("edit")}
                                            >
                                                <Pencil size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user)}
                                                disabled={isDeleting === user.id}
                                                className="p-1.5 text-domu-danger/70 hover:bg-domu-danger/10 hover:text-domu-danger rounded-lg transition-colors disabled:opacity-40"
                                                title={t("delete")}
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

            {editingUser && (
                <EditUserDialog
                    user={editingUser}
                    isOpen={true}
                    onClose={() => setEditingUser(null)}
                />
            )}
        </>
    );
}
