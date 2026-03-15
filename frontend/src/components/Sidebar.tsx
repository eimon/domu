"use client";

import { useSidebar } from "@/context/SidebarContext";
import { X, Home, Building2, Users, CalendarDays, LogOut, UserCog } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { logout } from "@/actions/auth";

const navigation = [
    { name: "properties", href: "/properties", icon: Building2, adminOnly: false },
    { name: "bookings", href: "/bookings", icon: CalendarDays, adminOnly: false },
    { name: "guests", href: "/guests", icon: Users, adminOnly: false },
    { name: "users", href: "/users", icon: UserCog, adminOnly: true },
];

export default function Sidebar({ userRole }: { userRole: string | null }) {
    const { isOpen, close } = useSidebar();
    const visibleNavigation = navigation.filter(item => !item.adminOnly || userRole === "admin");
    const pathname = usePathname();
    const t = useTranslations("Navigation");

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <button
                    type="button"
                    aria-label={t('closeSidebar')}
                    className="fixed inset-0 z-40 w-full bg-black/70 backdrop-blur-sm lg:hidden transition-opacity cursor-default"
                    onClick={close}
                />
            )}

            {/* Sidebar Panel */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 glass-sidebar shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:flex-col lg:border-r lg:shadow-none ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Logo header */}
                <div className="flex items-center justify-between h-16 px-5 border-b border-white/[0.07]">
                    {/* <span className="text-xl font-bold text-domu-primary tracking-tight">DOMU</span> */}
                    <button
                        type="button"
                        className="ml-auto flex-shrink-0 p-1.5 text-white/40 rounded-md hover:text-white/70 hover:bg-white/[0.06] transition-colors lg:hidden"
                        onClick={close}
                    >
                        <span className="sr-only">{t('closeSidebar')}</span>
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <nav className="px-3 py-4 space-y-0.5">
                        {/* Dashboard / Home */}
                        <Link
                            href="/"
                            onClick={close}
                            className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${pathname === "/"
                                ? "bg-domu-primary/10 text-domu-primary"
                                : "text-white/50 hover:bg-white/[0.05] hover:text-white/80"
                                }`}
                        >
                            <Home
                                className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors ${pathname === "/" ? "text-domu-primary" : "text-white/35 group-hover:text-white/60"}`}
                            />
                            {t('dashboard')}
                        </Link>

                        {visibleNavigation.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={close}
                                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${isActive
                                        ? "bg-domu-primary/10 text-domu-primary"
                                        : "text-white/50 hover:bg-white/[0.05] hover:text-white/80"
                                        }`}
                                >
                                    <item.icon
                                        className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors ${isActive ? "text-domu-primary" : "text-white/35 group-hover:text-white/60"
                                            }`}
                                    />
                                    {t(item.name as any)}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="border-t border-white/[0.07] p-3">
                    <form action={logout}>
                        <button
                            type="submit"
                            className="group flex w-full items-center px-3 py-2.5 text-sm font-medium text-domu-danger/70 rounded-lg hover:bg-domu-danger/[0.08] hover:text-domu-danger transition-all"
                        >
                            <LogOut className="mr-3 flex-shrink-0 h-5 w-5" />
                            {t('logout')}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
