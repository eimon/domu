"use client";

import { useState } from "react";
import { User, UserRole } from "@/types/api";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { deleteUser } from "@/actions/users";
import EditUserDialog from "@/components/EditUserDialog";

interface UsersTableProps {
    users: User[];
}

const roleBadgeClass: Record<string, string> = {
    [UserRole.ADMIN]: "bg-red-100 text-red-700",
    [UserRole.MANAGER]: "bg-blue-100 text-blue-700",
    [UserRole.OWNER]: "bg-green-100 text-green-700",
};

export default function UsersTable({ users }: UsersTableProps) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const t = useTranslations("Common");
    const tUsers = useTranslations("Users");
    const tEnums = useTranslations("Enums");

    const handleDelete = async (user: User) => {
        if (!confirm(tUsers("deleteConfirm"))) return;

        setIsDeleting(user.id);
        const result = await deleteUser(user.id);

        if (result.error) {
            alert(result.error);
        }
        setIsDeleting(null);
    };

    if (users.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">{tUsers("noUsers")}</p>
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
                                    {tUsers("fullName")}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {tUsers("email")}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {tUsers("username")}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {tUsers("role")}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {tUsers("status")}
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t("actions")}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {user.full_name || "—"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                        {user.username}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadgeClass[user.role] ?? "bg-gray-100 text-gray-700"}`}>
                                            {tEnums(`UserRole.${user.role}`)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                            {user.is_active ? tUsers("active") : tUsers("inactive")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => setEditingUser(user)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title={t("edit")}
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user)}
                                                disabled={isDeleting === user.id}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                                title={t("delete")}
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
