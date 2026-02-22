import Link from "next/link"; // Keep original Link for logo if desired, or switch to routed Link
import { Link as LocalizedLink } from "@/i18n/routing";
import SidebarTrigger from "@/components/SidebarTrigger";
import { serverApi } from "@/lib/server-api";
import { User } from "@/types/api";
import { Menu, User as UserIcon, LogOut, ChevronDown } from "lucide-react";
import { logout } from "@/actions/auth";
import LanguageSwitcher from "./LanguageSwitcher";
import { getTranslations } from "next-intl/server";

export default async function Navbar() {
    let user: User | null = null;
    const t = await getTranslations("Navigation");

    try {
        const res = await serverApi("/auth/perfil");
        if (res.ok) {
            user = await res.json();
        }
    } catch (error) {
        console.error("Failed to fetch user profile:", error);
    }

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">

                    {/* Left Side: Hamburger & Logo */}
                    <div className="flex items-center">
                        <SidebarTrigger />
                        <div className="flex-shrink-0 flex items-center ml-4 lg:ml-0">
                            <LocalizedLink href="/" className="text-xl font-bold text-blue-600 tracking-tight">
                                DOMU
                            </LocalizedLink>
                        </div>
                    </div>

                    {/* Right Side: User Profile & Actions */}
                    <div className="flex items-center space-x-4">
                        <LanguageSwitcher />

                        <div className="h-6 w-px bg-gray-200" aria-hidden="true" />

                        {user ? (
                            <div className="relative flex items-center space-x-4">
                                <div className="hidden md:flex flex-col items-end mr-2">
                                    <span className="text-sm font-medium text-gray-900">{user.full_name}</span>
                                    <span className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</span>
                                </div>

                                <div className="relative group">
                                    <button className="flex items-center space-x-2 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <UserIcon size={18} />
                                        </div>
                                        <ChevronDown size={14} className="text-gray-500" />
                                    </button>

                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 origin-top-right transform">
                                        <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                                            <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>

                                        <LocalizedLink
                                            href="/api/auth/perfil"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            {t('profile')}
                                        </LocalizedLink>

                                        <form action={logout} className="w-full">
                                            <button
                                                type="submit"
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center"
                                            >
                                                <LogOut size={16} className="mr-2" />
                                                {t('logout')}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">{t('login')}</div>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
}
