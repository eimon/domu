import { ArrowRight, LayoutDashboard, Database, Shield } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

export default async function Home() {
    const t = await getTranslations("Home");

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 p-8 font-[family-name:var(--font-geist-sans)]">
            <main className="max-w-4xl w-full text-center space-y-12">

                {/* Hero Section */}
                <div className="space-y-6">
                    <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-blue-600">
                        {t('heroTitle')}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {t('heroSubtitle')}
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                            <LayoutDashboard size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{t('feature1Title')}</h3>
                        <p className="text-gray-500">
                            {t('feature1Desc')}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
                            <Database size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{t('feature2Title')}</h3>
                        <p className="text-gray-500">
                            {t('feature2Desc')}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                            <Shield size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{t('feature3Title')}</h3>
                        <p className="text-gray-500">
                            {t('feature3Desc')}
                        </p>
                    </div>

                </div>

                {/* Status Check / Actions */}
                <div className="pt-8">
                    <Link href="/properties" className="inline-flex items-center space-x-2 bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
                        <span>{t('cta')}</span>
                        <ArrowRight size={18} />
                    </Link>
                    <p className="mt-4 text-sm text-gray-400">
                        {t('devServerNote')}
                    </p>
                </div>

            </main>
        </div>
    );
}
