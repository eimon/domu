"use client";

import { useSidebar } from "@/context/SidebarContext";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";

export default function SidebarTrigger() {
    const { toggle } = useSidebar();
    const t = useTranslations("Common");

    return (
        <button
            type="button"
            onClick={toggle}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
        >
            <span className="sr-only">{t('openSidebar')}</span>
            <Menu size={24} />
        </button>
    );
}
