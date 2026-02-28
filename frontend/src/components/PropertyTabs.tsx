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
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={cn(
                                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                                isActive
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                                isPending && "opacity-50 cursor-not-allowed"
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
        <Suspense fallback={<div className="border-b border-gray-200 h-[53px]" />}>
            <PropertyTabsContent {...props} />
        </Suspense>
    );
}
