"use client";

import { useActionState } from "react";
import { changePassword, ChangePasswordState } from "@/actions/profile";
import { Loader2, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";

const inputCls =
    "w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.10] text-white/90 focus:border-domu-primary/60 focus:ring-2 focus:ring-domu-primary/15 outline-none transition-all text-sm";
const labelCls = "block text-xs font-medium text-white/55 mb-1.5 uppercase tracking-wider";

export default function ChangePasswordForm() {
    const t = useTranslations("Profile");
    const tCommon = useTranslations("Common");
    const initialState: ChangePasswordState = {};
    const [state, formAction, isPending] = useActionState(changePassword, initialState);

    const errorMessage =
        state.error === "passwordMismatch" ? t("passwordMismatch") : state.error;

    return (
        <form action={formAction} className="space-y-4">
            {errorMessage && (
                <div className="bg-domu-danger/10 border border-domu-danger/20 text-domu-danger/90 p-3 rounded-lg text-sm">
                    {errorMessage}
                </div>
            )}

            {state.success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-sm flex items-center gap-2">
                    <CheckCircle size={15} />
                    {t("passwordSuccess")}
                </div>
            )}

            <div>
                <label className={labelCls}>{t("currentPassword")}</label>
                <input
                    name="current_password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className={inputCls}
                />
            </div>

            <div>
                <label className={labelCls}>{t("newPassword")}</label>
                <input
                    name="new_password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className={inputCls}
                />
            </div>

            <div>
                <label className={labelCls}>{t("confirmPassword")}</label>
                <input
                    name="confirm_password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className={inputCls}
                />
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-2 bg-domu-primary hover:bg-domu-primary/80 text-white rounded-lg disabled:opacity-60 flex items-center text-sm font-medium transition-colors"
                >
                    {isPending && <Loader2 className="animate-spin mr-2" size={15} />}
                    {isPending ? t("saving") : tCommon("save")}
                </button>
            </div>
        </form>
    );
}
