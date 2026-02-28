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
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('loginTitle')}</h1>
                        <p className="text-gray-500">{t('loginSubtitle')}</p>
                    </div>

                    <form action={formAction} className="space-y-6">
                        {state?.error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                                {state.error}
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                {t('username')}
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder={t('username')}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                {t('password')}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={20} />
                                    {t('signingIn')}
                                </>
                            ) : (
                                t('signIn')
                            )}
                        </button>
                    </form>
                </div>
                <div className="bg-gray-50 px-8 py-4 text-center">
                    <p className="text-sm text-gray-500">
                        {t('noAccount')}{" "}
                        <span className="text-blue-600 font-medium">
                            {t('contactAdmin')}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
