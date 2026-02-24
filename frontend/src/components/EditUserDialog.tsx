"use client";

import { useEffect } from "react";
import { updateUser, UserFormState } from "@/actions/users";
import { X, Loader2 } from "lucide-react";
import { useActionState } from "react";
import { User, UserRole } from "@/types/api";
import { useTranslations } from "next-intl";

interface EditUserDialogProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditUserDialog({ user, isOpen, onClose }: EditUserDialogProps) {
    const initialState: UserFormState = { error: "", success: false };
    const t = useTranslations("Common");
    const tUsers = useTranslations("Users");
    const tEnums = useTranslations("Enums");

    const updateUserWithId = updateUser.bind(null, user.id);
    const [state, formAction, isPending] = useActionState(updateUserWithId, initialState);

    useEffect(() => {
        if (state.success && isOpen) {
            onClose();
        }
    }, [state.success, isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">{tUsers("editUser")}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form action={formAction} className="p-6 space-y-4">
                    {state?.error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                            {state.error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {tUsers("fullName")} <span className="text-gray-400 font-normal">(opcional)</span>
                        </label>
                        <input
                            name="full_name"
                            type="text"
                            defaultValue={user.full_name ?? ""}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{tUsers("role")}</label>
                        <select
                            name="role"
                            defaultValue={user.role}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                            {Object.values(UserRole).map((role) => (
                                <option key={role} value={role}>
                                    {tEnums(`UserRole.${role}`)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{tUsers("password")}</label>
                        <input
                            name="password"
                            type="password"
                            placeholder={tUsers("passwordHint")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="pt-2 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                            {t("cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 flex items-center text-sm font-medium"
                        >
                            {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                            {t("update")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
