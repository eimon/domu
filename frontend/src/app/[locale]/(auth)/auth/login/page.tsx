"use client";

import { useActionState } from "react";
import { login, LoginState } from "@/actions/auth";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function LoginPage() {
    const initialState: LoginState = { error: "", success: false };
    const [state, formAction, isPending] = useActionState(login, initialState);
    const t = useTranslations("Auth");

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md glass-modal rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-domu-primary/15 text-domu-primary mb-4">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white/90 mb-1 tracking-tight">DOMU</h1>
                        <p className="text-white/45 text-sm">{t('loginSubtitle')}</p>
                    </div>

                    <form action={formAction} className="space-y-5">
                        {state?.error && (
                            <div className="bg-domu-danger/10 border border-domu-danger/20 text-domu-danger/90 p-3 rounded-lg text-sm text-center">
                                {state.error}
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="username"
                                className="block text-xs font-medium text-white/55 mb-1.5 uppercase tracking-wider"
                            >
                                {t('username')}
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="w-full px-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.10] text-white/90 focus:border-domu-primary/60 focus:ring-2 focus:ring-domu-primary/15 outline-none transition-all text-sm"
                                placeholder={t('username')}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-xs font-medium text-white/55 mb-1.5 uppercase tracking-wider"
                            >
                                {t('password')}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full px-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.10] text-white/90 focus:border-domu-primary/60 focus:ring-2 focus:ring-domu-primary/15 outline-none transition-all text-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-domu-primary hover:bg-domu-primary/80 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center text-sm mt-2"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={16} />
                                    {t('signingIn')}
                                </>
                            ) : (
                                t('signIn')
                            )}
                        </button>
                    </form>
                </div>

                <div className="bg-white/[0.02] border-t border-white/[0.06] px-8 py-4 text-center">
                    <p className="text-xs text-white/35">
                        {t('noAccount')}{" "}
                        <span className="text-domu-primary/80 font-medium">
                            {t('contactAdmin')}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
