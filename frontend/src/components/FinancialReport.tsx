"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
    TrendingUp,
    DollarSign,
    Percent,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Loader2,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Briefcase
} from "lucide-react";
import { getFinancialSummary } from "@/actions/reports";
import { FinancialSummary } from "@/types/api";
import { formatPrice } from "@/lib/utils";

interface FinancialReportProps {
    propertyId: string;
}

export default function FinancialReport({ propertyId }: FinancialReportProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const t = useTranslations("Reports");
    const tCommon = useTranslations("Common");
    const locale = useLocale();

    useEffect(() => {
        fetchData();
    }, [currentDate, propertyId]);

    const fetchData = async () => {
        setIsLoading(true);
        const data = await getFinancialSummary(
            propertyId,
            currentDate.getFullYear(),
            currentDate.getMonth() + 1
        );
        setSummary(data);
        setIsLoading(false);
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const formatMonth = () => {
        return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(currentDate);
    };

    const mainCards = summary ? [
        {
            title: t("income"),
            value: `$${formatPrice(summary.total_income)}`,
            icon: TrendingUp,
            color: "text-domu-success",
            bg: "bg-domu-success/10",
            detail: `${summary.total_bookings} ${t("totalBookings")}`
        },
        {
            title: t("costs"),
            value: `$${formatPrice(summary.costs.total)}`,
            icon: DollarSign,
            color: "text-domu-danger",
            bg: "bg-domu-danger/10",
            detail: t("breakdown")
        },
        {
            title: t("netProfit"),
            value: `$${formatPrice(summary.net_profit)}`,
            icon: Briefcase,
            color: summary.net_profit >= 0 ? "text-domu-success" : "text-domu-warning",
            bg: summary.net_profit >= 0 ? "bg-domu-success/10" : "bg-domu-warning/10",
            detail: `${summary.profit_margin_percent}% ${t("margin")}`
        },
        {
            title: t("occupancy"),
            value: `${summary.occupancy_rate}%`,
            icon: Calendar,
            color: "text-domu-primary",
            bg: "bg-domu-primary/10",
            detail: `${summary.occupied_days}/${summary.days_in_month} ${t("occupiedDays")}`
        },
    ] : [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & Month Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white/90">{t("title")}</h2>
                    <p className="text-white/45 mt-1 text-sm">{t("details")}</p>
                </div>

                <div className="inline-flex items-center glass rounded-xl p-1">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors text-white/50 hover:text-white/80"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className="px-4 py-1 text-sm font-semibold text-white/75 min-w-[140px] text-center capitalize">
                        {formatMonth()}
                    </span>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors text-white/50 hover:text-white/80"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 glass rounded-2xl gap-4">
                    <Loader2 className="animate-spin text-domu-primary/60" size={36} />
                    <p className="text-white/35 text-sm italic">{tCommon("loading")}</p>
                </div>
            ) : summary ? (
                <div className="space-y-8">
                    {/* Main Metric Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {mainCards.map((card) => (
                            <div key={card.title} className="glass rounded-2xl p-6 hover:bg-white/[0.07] transition-all group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2.5 rounded-xl ${card.bg} group-hover:scale-110 transition-transform`}>
                                        <card.icon className={card.color} size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/25 bg-white/[0.05] px-2 py-1 rounded-md">
                                        Real Data
                                    </span>
                                </div>
                                <p className="text-xs font-medium text-white/45 uppercase tracking-wider">{card.title}</p>
                                <p className="text-2xl font-bold text-white/90 mt-1">{card.value}</p>
                                <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center text-xs text-white/35">
                                    {card.detail}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Cost Breakdown Table */}
                        <div className="lg:col-span-2 glass rounded-2xl overflow-hidden">
                            <div className="px-6 py-5 border-b border-white/[0.07] flex items-center gap-3">
                                <div className="p-2 bg-domu-danger/10 rounded-lg">
                                    <PieChart className="text-domu-danger" size={18} />
                                </div>
                                <h3 className="font-bold text-white/80">{t("breakdown")}</h3>
                            </div>
                            <div className="divide-y divide-white/[0.05]">
                                <div className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.03] transition-colors">
                                    <span className="text-sm text-white/55">{t("fixedMonthly")}</span>
                                    <span className="font-semibold text-white/80">${formatPrice(summary.costs.fixed_monthly)}</span>
                                </div>
                                <div className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.03] transition-colors">
                                    <span className="text-sm text-white/55">{t("fixedDaily")}</span>
                                    <span className="font-semibold text-white/80">${formatPrice(summary.costs.fixed_daily)}</span>
                                </div>
                                <div className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.03] transition-colors">
                                    <span className="text-sm text-white/55">{t("variableCosts")}</span>
                                    <span className="font-semibold text-white/80">${formatPrice(summary.costs.variable_per_reservation)}</span>
                                </div>
                                <div className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.03] transition-colors">
                                    <span className="text-sm text-domu-warning/80">{t("commissions")} (OTA)</span>
                                    <span className="font-semibold text-domu-warning/80">-${formatPrice(summary.costs.commissions)}</span>
                                </div>
                                <div className="flex items-center justify-between px-6 py-5 bg-white/[0.03]">
                                    <span className="font-bold text-white/80">{tCommon("value")} {t("costs")}</span>
                                    <span className="text-lg font-black text-domu-danger">${formatPrice(summary.costs.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Net Profit Summary Card */}
                        <div className="bg-gradient-to-br from-domu-primary/70 to-violet-600/70 rounded-2xl p-8 text-white shadow-[0_16px_48px_rgba(99,102,241,0.20)] relative overflow-hidden flex flex-col justify-between border border-white/10">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <TrendingUp size={110} />
                            </div>

                            <div className="relative z-10">
                                <p className="text-white/70 font-medium mb-1 text-sm">{t("netProfit")}</p>
                                <h4 className="text-4xl font-extrabold">${formatPrice(summary.net_profit)}</h4>
                                <div className="mt-4 flex items-center gap-2 text-sm bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                                    <ArrowUpRight size={15} />
                                    <span>{summary.profit_margin_percent}% {t("margin")}</span>
                                </div>
                            </div>

                            <div className="relative z-10 mt-12 grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-white/55 text-xs font-medium uppercase tracking-wider">{t("occupiedDays")}</p>
                                    <p className="text-xl font-bold">{summary.occupied_days}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-white/55 text-xs font-medium uppercase tracking-wider">{t("totalBookings")}</p>
                                    <p className="text-xl font-bold">{summary.total_bookings}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 glass rounded-2xl border-dashed border border-white/[0.08] gap-2">
                    <PieChart size={40} className="text-white/15 mb-2" />
                    <p className="font-medium text-white/35">{t("noData")}</p>
                </div>
            )}
        </div>
    );
}
