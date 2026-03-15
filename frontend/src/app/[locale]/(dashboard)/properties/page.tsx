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
                    <h1 className="text-2xl font-bold text-white/90">{t('myManaged')}</h1>
                    <p className="text-white/40 text-sm">{t('title')}</p>
                </div>

                <Link
                    href="/properties/new"
                    className="inline-flex items-center justify-center px-4 py-2 bg-domu-primary hover:bg-domu-primary/80 text-white rounded-lg font-medium transition-colors text-sm"
                >
                    <Plus size={16} className="mr-2" />
                    {t('addNew')}
                </Link>
            </div>

            {properties.length === 0 ? (
                <div className="text-center py-20 glass rounded-xl border-dashed border border-white/[0.08]">
                    <Plus size={40} className="mx-auto mb-3 text-white/15" />
                    <h3 className="text-sm font-semibold text-white/40">{t('noProperties')}</h3>
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
