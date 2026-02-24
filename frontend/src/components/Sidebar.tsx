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
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden transition-opacity"
                    onClick={close}
                />
            )}

            {/* Sidebar Panel */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:flex-col lg:border-r lg:border-gray-200 lg:shadow-none ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                    <span className="text-xl font-bold text-blue-600">DOMU</span>
                    <button
                        type="button"
                        className="ml-auto flex-shrink-0 p-1 text-gray-400 rounded-md hover:text-gray-500 lg:hidden"
                        onClick={close}
                    >
                        <span className="sr-only">Close sidebar</span>
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <nav className="px-2 py-4 space-y-1">
                        {/* Always show Dashboard/Home */}
                        <Link
                            href="/"
                            onClick={close}
                            className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${pathname === "/"
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <Home
                                className={`mr-4 flex-shrink-0 h-6 w-6 ${pathname === "/" ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"}`}
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
                                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${isActive
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                >
                                    <item.icon
                                        className={`mr-4 flex-shrink-0 h-6 w-6 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                                            }`}
                                    />
                                    {t(item.name as any)}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="border-t border-gray-200 p-4">
                    <form action={logout}>
                        <button
                            type="submit"
                            className="group flex w-full items-center px-2 py-2 text-base font-medium text-red-600 rounded-md hover:bg-red-50"
                        >
                            <LogOut className="mr-4 flex-shrink-0 h-6 w-6 text-red-600" />
                            {t('logout')}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
