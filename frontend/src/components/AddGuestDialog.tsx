"use client";

import { useState } from "react";
import { createGuest, GuestFormState } from "@/actions/guests";
import { Plus, X, Loader2 } from "lucide-react";
import { useActionState } from "react";
import { DocumentType } from "@/types/api";
import { useTranslations } from "next-intl";

export default function AddGuestDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const initialState: GuestFormState = { error: "", success: false };
    const t = useTranslations("Common");
    const tGuest = useTranslations("Guests");
    const tEnums = useTranslations("Enums");

    const [state, formAction, isPending] = useActionState(createGuest, initialState);

    if (state.success && isOpen) {
        setIsOpen(false);
        state.success = false;
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
                <Plus size={16} className="mr-2" />
                {tGuest('addNew')}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">{tGuest('addNew')}</h3>
                            <button
                                onClick={() => setIsOpen(false)}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">{tGuest('fullName')}</label>
                                <input
                                    name="full_name"
                                    type="text"
                                    required
                                    placeholder="e.g. John Doe"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{tGuest('email')}</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="john@example.com"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{tGuest('phone')}</label>
                                <input
                                    name="phone"
                                    type="tel"
                                    placeholder="+1 234 567 890"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{tGuest('documentType')}</label>
                                    <select
                                        name="document_type"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    >
                                        {Object.values(DocumentType).map((type) => (
                                            <option key={type} value={type}>
                                                {tEnums(`DocumentType.${type}`)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{tGuest('documentNumber')}</label>
                                    <input
                                        name="document_number"
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 flex items-center text-sm font-medium"
                                >
                                    {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                                    {t('save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
