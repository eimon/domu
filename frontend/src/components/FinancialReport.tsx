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
            value: `$${summary.total_income.toLocaleString()}`,
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-50",
            detail: `${summary.total_bookings} ${t("totalBookings")}`
        },
        {
            title: t("costs"),
            value: `$${summary.costs.total.toLocaleString()}`,
            icon: DollarSign,
            color: "text-red-600",
            bg: "bg-red-50",
            detail: t("breakdown")
        },
        {
            title: t("netProfit"),
            value: `$${summary.net_profit.toLocaleString()}`,
            icon: Briefcase,
            color: summary.net_profit >= 0 ? "text-emerald-600" : "text-orange-600",
            bg: summary.net_profit >= 0 ? "bg-emerald-50" : "bg-orange-50",
            detail: `${summary.profit_margin_percent}% ${t("margin")}`
        },
        {
            title: t("occupancy"),
            value: `${summary.occupancy_rate}%`,
            icon: Calendar,
            color: "text-blue-600",
            bg: "bg-blue-50",
            detail: `${summary.occupied_days}/${summary.days_in_month} ${t("occupiedDays")}`
        },
    ] : [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & Month Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t("title")}</h2>
                    <p className="text-gray-500 mt-1">{t("details")}</p>
                </div>

                <div className="inline-flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="px-4 py-1 text-sm font-semibold text-gray-700 min-w-[140px] text-center capitalize">
                        {formatMonth()}
                    </span>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white/50 rounded-2xl border border-gray-100 italic text-gray-400 gap-4">
                    <Loader2 className="animate-spin text-blue-500" size={40} />
                    <p>{tCommon("loading")}</p>
                </div>
            ) : summary ? (
                <div className="space-y-8">
                    {/* Main Metric Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {mainCards.map((card) => (
                            <div key={card.title} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${card.bg} group-hover:scale-110 transition-transform`}>
                                        <card.icon className={card.color} size={24} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                                        Real Data
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center text-xs text-gray-400">
                                    {card.detail}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cost Breakdown Table */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-50 rounded-lg">
                                        <PieChart className="text-red-600" size={20} />
                                    </div>
                                    <h3 className="font-bold text-gray-900">{t("breakdown")}</h3>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-50">
                                <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                                    <span className="text-sm text-gray-600">{t("fixedMonthly")}</span>
                                    <span className="font-semibold text-gray-900">${summary.costs.fixed_monthly.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                                    <span className="text-sm text-gray-600">{t("fixedDaily")}</span>
                                    <span className="font-semibold text-gray-900">${summary.costs.fixed_daily.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                                    <span className="text-sm text-gray-600">{t("variableCosts")}</span>
                                    <span className="font-semibold text-gray-900">${summary.costs.variable_per_reservation.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors text-orange-600">
                                    <span className="text-sm">{t("commissions")} (OTA)</span>
                                    <span className="font-semibold">-${summary.costs.commissions.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between px-6 py-5 bg-gray-50/50">
                                    <span className="font-bold text-gray-900">{tCommon("value")} {t("costs")}</span>
                                    <span className="text-lg font-black text-red-600">${summary.costs.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Summary Summary */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <TrendingUp size={120} />
                            </div>

                            <div className="relative z-10">
                                <p className="text-blue-100 font-medium mb-1">{t("netProfit")}</p>
                                <h4 className="text-4xl font-extrabold">${summary.net_profit.toLocaleString()}</h4>
                                <div className="mt-4 flex items-center gap-2 text-sm bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                                    <ArrowUpRight size={16} />
                                    <span>{summary.profit_margin_percent}% {t("margin")}</span>
                                </div>
                            </div>

                            <div className="relative z-10 mt-12 grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-blue-200 text-xs font-medium uppercase tracking-wider">{t("occupiedDays")}</p>
                                    <p className="text-xl font-bold">{summary.occupied_days}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-blue-200 text-xs font-medium uppercase tracking-wider">{t("totalBookings")}</p>
                                    <p className="text-xl font-bold">{summary.total_bookings}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 gap-2">
                    <PieChart size={48} className="opacity-20 mb-2" />
                    <p className="font-medium">{t("noData")}</p>
                </div>
            )}
        </div>
    );
}
