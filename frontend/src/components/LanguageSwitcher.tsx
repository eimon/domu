"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLocale = e.target.value as "en" | "es";
        router.replace(pathname, { locale: newLocale });
    };

    return (
        <div className="flex items-center space-x-1.5 text-sm text-white/45">
            <Globe size={14} />
            <select
                value={locale}
                onChange={handleChange}
                className="bg-transparent border-none focus:ring-0 cursor-pointer font-medium text-white/50 outline-none hover:text-white/75 transition-colors"
            >
                <option value="en">EN</option>
                <option value="es">ES</option>
            </select>
        </div>
    );
}
