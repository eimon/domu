"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";

type ConfirmOptions = { message: string; confirmLabel?: string };

type ConfirmContextType = {
    confirm: (options: ConfirmOptions | string) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType>({
    confirm: async () => false,
});

type DialogState = {
    message: string;
    confirmLabel?: string;
    resolve: (value: boolean) => void;
};

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
    const [dialog, setDialog] = useState<DialogState | null>(null);
    const t = useTranslations("Common");

    const confirm = useCallback((options: ConfirmOptions | string): Promise<boolean> => {
        const message = typeof options === "string" ? options : options.message;
        const confirmLabel = typeof options === "string" ? undefined : options.confirmLabel;
        return new Promise((resolve) => setDialog({ message, confirmLabel, resolve }));
    }, []);

    const handleConfirm = () => {
        dialog?.resolve(true);
        setDialog(null);
    };

    const handleCancel = () => {
        dialog?.resolve(false);
        setDialog(null);
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {dialog && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-red-50 rounded-lg shrink-0">
                                    <AlertTriangle size={20} className="text-red-600" />
                                </div>
                                <p className="text-sm text-gray-700 pt-1.5">{dialog.message}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 px-6 pb-6">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                {t("cancel")}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                            >
                                {dialog.confirmLabel ?? t("confirm")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}

export const useConfirm = () => useContext(ConfirmContext);
