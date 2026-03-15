"use client";

import { Suspense, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface PropertyTabsProps {
    activeTab: string;
}

function PropertyTabsContent({ activeTab }: PropertyTabsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const t = useTranslations("Properties.tabs");
    const [isPending, startTransition] = useTransition();

    const tabs = [
        { id: "details", label: t("details") },
        { id: "calendar", label: t("calendar") },
        { id: "reports", label: t("reports") },
    ];

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tabId);

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        });
    };

    return (
        <div className="border-b border-white/[0.10]">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={cn(
                                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                                isActive
                                    ? "border-domu-primary text-domu-primary"
                                    : "border-transparent text-white/40 hover:text-white/65 hover:border-white/[0.20]",
                                isPending && "opacity-40 cursor-not-allowed"
                            )}
                            disabled={isPending}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}

export default function PropertyTabs(props: PropertyTabsProps) {
    return (
        <Suspense fallback={<div className="border-b border-white/[0.10] h-[53px]" />}>
            <PropertyTabsContent {...props} />
        </Suspense>
    );
}
