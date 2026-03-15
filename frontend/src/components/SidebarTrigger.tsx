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
            className="p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-domu-primary/30 transition-colors lg:hidden"
        >
            <span className="sr-only">{t('openSidebar')}</span>
            <Menu size={22} />
        </button>
    );
}
