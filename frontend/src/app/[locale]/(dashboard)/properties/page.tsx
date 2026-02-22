import PropertyCard from "@/components/PropertyCard";
import { Plus } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { getMyProperties } from "@/actions/properties";

export default async function PropertiesPage() {
    const properties = await getMyProperties();
    const t = await getTranslations("Properties");

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('myManaged')}</h1>
                    <p className="text-gray-500">{t('title')}</p>
                </div>

                <Link
                    href="/properties/new"
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus size={20} className="mr-2" />
                    {t('addNew')}
                </Link>
            </div>

            {properties.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <Plus size={48} className="mx-auto mb-4 opacity-20" />
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">{t('noProperties')}</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                </div>
            )}
        </div>
    );
}
