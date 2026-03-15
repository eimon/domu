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

const inputCls = "w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.10] text-white/90 focus:border-domu-primary/60 focus:ring-2 focus:ring-domu-primary/15 outline-none transition-all text-sm";
const labelCls = "block text-xs font-medium text-white/55 mb-1.5 uppercase tracking-wider";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="glass-modal rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
                    <h3 className="text-base font-semibold text-white/90">{tUsers("editUser")}</h3>
                    <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form action={formAction} className="p-6 space-y-4">
                    {state?.error && (
                        <div className="bg-domu-danger/10 border border-domu-danger/20 text-domu-danger/90 p-3 rounded-lg text-sm">
                            {state.error}
                        </div>
                    )}

                    <div>
                        <label className={labelCls}>
                            {tUsers("fullName")} <span className="text-white/25 normal-case tracking-normal">(opcional)</span>
                        </label>
                        <input
                            name="full_name"
                            type="text"
                            defaultValue={user.full_name ?? ""}
                            className={inputCls}
                        />
                    </div>

                    <div>
                        <label className={labelCls}>{tUsers("role")}</label>
                        <select name="role" defaultValue={user.role} className={inputCls}>
                            {Object.values(UserRole).map((role) => (
                                <option key={role} value={role}>
                                    {tEnums(`UserRole.${role}`)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelCls}>{tUsers("password")}</label>
                        <input
                            name="password"
                            type="password"
                            placeholder={tUsers("passwordHint")}
                            className={inputCls}
                        />
                    </div>

                    <div className="pt-2 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-white/55 hover:bg-white/[0.05] hover:text-white/75 rounded-lg transition-colors"
                        >
                            {t("cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 bg-domu-primary hover:bg-domu-primary/80 text-white rounded-lg disabled:opacity-60 flex items-center text-sm font-medium transition-colors"
                        >
                            {isPending ? <Loader2 className="animate-spin mr-2" size={15} /> : null}
                            {t("update")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
