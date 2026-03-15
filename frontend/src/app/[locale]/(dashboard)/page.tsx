import { serverApi } from "@/lib/server-api";
import { getMyProperties } from "@/actions/properties";
import { getFinancialSummary } from "@/actions/reports";
import { getBookings } from "@/actions/bookings";
import { User, Property, Booking, FinancialSummary } from "@/types/api";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import {
    Building2, TrendingUp, Calendar, Wallet,
    ChevronRight, Plus, ArrowUpRight, ArrowDownRight,
    BedDouble, Percent
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

function nights(checkIn: string, checkOut: string) {
    return Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
}

export default async function DashboardHome() {
    const [t, tEnums, locale] = await Promise.all([
        getTranslations("Home"),
        getTranslations("Enums"),
        getLocale(),
    ]);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Fetch user, properties and bookings in parallel
    const [user, properties, bookings]: [User | null, Property[], Booking[]] = await Promise.all([
        serverApi("/auth/perfil").then(r => r.ok ? r.json() : null).catch(() => null),
        getMyProperties(),
        getBookings(),
    ]);

    // Fetch financial summaries for all properties in parallel
    const summaries: (FinancialSummary | null)[] = await Promise.all(
        properties.map(p => getFinancialSummary(p.id, year, month))
    );

    // Aggregate KPIs
    const validSummaries = summaries.filter(Boolean) as FinancialSummary[];
    const totalIncome = validSummaries.reduce((s, r) => s + r.total_income, 0);
    const totalNetProfit = validSummaries.reduce((s, r) => s + r.net_profit, 0);
    const avgOccupancy = validSummaries.length > 0
        ? validSummaries.reduce((s, r) => s + r.occupancy_rate, 0) / validSummaries.length
        : 0;

    // Upcoming check-ins (next 7 days, non-cancelled)
    const todayStr = now.toISOString().split("T")[0];
    const in7 = new Date(now);
    in7.setDate(in7.getDate() + 7);
    const in7Str = in7.toISOString().split("T")[0];
    const upcoming = bookings
        .filter(b => b.status !== "CANCELLED" && b.check_in >= todayStr && b.check_in <= in7Str)
        .sort((a, b) => a.check_in.localeCompare(b.check_in))
        .slice(0, 6);

    const firstName = (user?.full_name?.split(" ")[0]) || user?.username || "";
    const monthName = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(now);
    const propertyMap = Object.fromEntries(properties.map(p => [p.id, p]));

    const kpis = [
        {
            label: t("totalProperties"),
            value: properties.length.toString(),
            icon: Building2,
            color: "text-domu-primary",
            bg: "bg-domu-primary/10",
        },
        {
            label: t("monthlyIncome"),
            value: `$${formatPrice(totalIncome)}`,
            icon: Wallet,
            color: "text-domu-success",
            bg: "bg-domu-success/10",
        },
        {
            label: t("netProfit"),
            value: `$${formatPrice(totalNetProfit)}`,
            icon: totalNetProfit >= 0 ? TrendingUp : ArrowDownRight,
            color: totalNetProfit >= 0 ? "text-domu-success" : "text-domu-warning",
            bg: totalNetProfit >= 0 ? "bg-domu-success/10" : "bg-domu-warning/10",
        },
        {
            label: t("avgOccupancy"),
            value: `${Math.round(avgOccupancy)}%`,
            icon: Percent,
            color: "text-domu-primary",
            bg: "bg-domu-primary/10",
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

            {/* Welcome header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white/90">
                        {firstName ? t("welcome", { name: firstName }) : t("welcomeGeneric")}
                    </h1>
                    <p className="text-white/40 mt-1 text-sm capitalize">{t("subtitle", { month: monthName })}</p>
                </div>
                {user && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-domu-primary/10 text-domu-primary border border-domu-primary/20 capitalize self-start sm:self-auto">
                        {user.role}
                    </span>
                )}
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="glass rounded-2xl p-5 hover:bg-white/[0.07] transition-all group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${kpi.bg} group-hover:scale-110 transition-transform`}>
                            <kpi.icon size={18} className={kpi.color} />
                        </div>
                        <p className="text-xs font-medium text-white/40 uppercase tracking-wider">{kpi.label}</p>
                        <p className="text-2xl font-bold text-white/90 mt-1">{kpi.value}</p>
                    </div>
                ))}
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Properties list */}
                <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">{t("propertySummary")}</h2>
                        <Link href="/properties" className="text-xs text-domu-primary/70 hover:text-domu-primary transition-colors flex items-center gap-1">
                            {t("viewAll")} <ChevronRight size={12} />
                        </Link>
                    </div>

                    {properties.length === 0 ? (
                        <div className="glass rounded-2xl p-8 text-center border-dashed border border-white/[0.08]">
                            <Building2 size={32} className="text-white/15 mx-auto mb-3" />
                            <p className="text-sm text-white/40 mb-4">{t("noProperties")}</p>
                            <Link
                                href="/properties/new"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-domu-primary hover:bg-domu-primary/80 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                <Plus size={14} />
                                {t("addFirstProperty")}
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {properties.map((property, i) => {
                                const summary = summaries[i];
                                return (
                                    <Link
                                        key={property.id}
                                        href={`/properties/${property.id}`}
                                        className="glass rounded-2xl p-5 hover:bg-white/[0.07] transition-all group flex items-center gap-5 cursor-pointer block"
                                    >
                                        <div className="p-2.5 bg-domu-primary/8 rounded-xl group-hover:bg-domu-primary/15 transition-colors shrink-0">
                                            <BedDouble size={18} className="text-domu-primary/70" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-white/85 truncate group-hover:text-white transition-colors">
                                                {property.name}
                                            </p>
                                            <p className="text-xs text-white/35 truncate mt-0.5">{property.address}</p>
                                        </div>

                                        {summary ? (
                                            <div className="hidden sm:flex items-center gap-6 shrink-0">
                                                <div className="text-right">
                                                    <p className="text-[10px] text-white/30 uppercase tracking-wider">{t("occupancy")}</p>
                                                    <p className="text-sm font-semibold text-white/70">{Math.round(summary.occupancy_rate)}%</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-white/30 uppercase tracking-wider">{t("income")}</p>
                                                    <p className="text-sm font-semibold text-domu-success/80">${formatPrice(summary.total_income)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-white/30 uppercase tracking-wider">{t("profit")}</p>
                                                    <p className={`text-sm font-semibold ${summary.net_profit >= 0 ? "text-domu-success/80" : "text-domu-warning/80"}`}>
                                                        ${formatPrice(summary.net_profit)}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="hidden sm:flex items-center gap-6 shrink-0 opacity-30">
                                                <div className="text-right">
                                                    <p className="text-[10px] text-white/30 uppercase tracking-wider">{t("occupancy")}</p>
                                                    <p className="text-sm font-semibold text-white/50">—</p>
                                                </div>
                                            </div>
                                        )}

                                        <ChevronRight size={15} className="text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Upcoming check-ins */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">{t("upcomingCheckIns")}</h2>
                        <Link href="/bookings" className="text-xs text-domu-primary/70 hover:text-domu-primary transition-colors flex items-center gap-1">
                            {t("viewAll")} <ChevronRight size={12} />
                        </Link>
                    </div>

                    <div className="glass rounded-2xl overflow-hidden">
                        {upcoming.length === 0 ? (
                            <div className="p-6 text-center">
                                <Calendar size={28} className="text-white/15 mx-auto mb-2" />
                                <p className="text-xs text-white/35">{t("noUpcoming")}</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/[0.05]">
                                {upcoming.map(booking => {
                                    const property = propertyMap[booking.property_id];
                                    const n = nights(booking.check_in, booking.check_out);
                                    const isToday = booking.check_in === todayStr;
                                    return (
                                        <div key={booking.id} className="px-4 py-3.5 hover:bg-white/[0.03] transition-colors">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-white/75 truncate">
                                                        {property?.name ?? booking.property_id.substring(0, 8)}
                                                    </p>
                                                    <p className="text-[11px] text-white/35 mt-0.5 truncate">{booking.summary}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className={`text-xs font-semibold font-mono ${isToday ? "text-domu-warning" : "text-white/55"}`}>
                                                        {booking.check_in}
                                                    </p>
                                                    <p className="text-[10px] text-white/30 mt-0.5">{n} {t("nights")}</p>
                                                </div>
                                            </div>
                                            <div className="mt-1.5">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                                    booking.status === "CONFIRMED"
                                                        ? "bg-domu-success/10 text-domu-success/80"
                                                        : "bg-domu-warning/10 text-domu-warning/80"
                                                }`}>
                                                    {tEnums(`BookingStatus.${booking.status}`)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
