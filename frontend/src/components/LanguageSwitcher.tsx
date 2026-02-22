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
        <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Globe size={16} />
            <select
                value={locale}
                onChange={handleChange}
                className="bg-transparent border-none focus:ring-0 cursor-pointer font-medium text-gray-700 outline-none"
            >
                <option value="en">English</option>
                <option value="es">Español</option>
            </select>
        </div>
    );
}
