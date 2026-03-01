import { serverApi } from "@/lib/server-api";
import { Property, Cost, PropertyBasePrice } from "@/types/api";
import { notFound } from "next/navigation";
import { MapPin, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import CostsTable from "@/components/CostsTable";
import AddCostDialog from "@/components/AddCostDialog";
import PropertyCalendar from "@/components/PropertyCalendar";
import PricingRulesTable from "@/components/PricingRulesTable";
import PropertyTabs from "@/components/PropertyTabs";
import FinancialReport from "@/components/FinancialReport";
import { PricingRule } from "@/types/api";
import PropertyActions from "./PropertyActions";
import BasePriceCard from "@/components/BasePriceCard";
import { getTranslations } from "next-intl/server";

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ tab?: string }>;
}

async function getProperty(id: string): Promise<Property | null> {
    const res = await serverApi(`/properties/${id}`);
    if (!res.ok) return null;
    return res.json();
}

async function getPropertyCosts(id: string): Promise<Cost[]> {
    const res = await serverApi(`/properties/${id}/costs`);
    if (!res.ok) return [];
    return res.json();
}

async function getPropertyPricingRules(id: string): Promise<PricingRule[]> {
    const res = await serverApi(`/properties/${id}/pricing-rules`);
    if (!res.ok) return [];
    return res.json();
}

async function getBasePriceHistory(id: string): Promise<PropertyBasePrice[]> {
    const res = await serverApi(`/properties/${id}/base-price/history`);
    if (!res.ok) return [];
    return res.json();
}

export default async function PropertyDetailsPage({ params, searchParams }: PageProps) {
    const [{ id }, { tab: rawTab }, t, tCommon] = await Promise.all([
        params,
        searchParams,
        getTranslations("Properties"),
        getTranslations("Common"),
    ]);
    const tab = rawTab ?? "details";

    const [property, costs, pricingRules, basePriceHistory] = await Promise.all([
        getProperty(id),
        getPropertyCosts(id),
        getPropertyPricingRules(id),
        getBasePriceHistory(id),
    ]);

    if (!property) {
        notFound();
    }
    const currentBasePrice = basePriceHistory.at(-1) ?? null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link
                    href="/properties"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft size={16} className="mr-1" />
                    {tCommon('back')}
                </Link>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
                        <div className="flex items-center text-gray-500 mt-2">
                            <MapPin size={18} className="mr-1" />
                            <span>{property.address}</span>
                        </div>
                    </div>
                    <PropertyActions property={property} />
                </div>
            </div>

            {/* Tabs Navigation */}
            <PropertyTabs activeTab={tab} />

            {/* Tab Content */}
            <div className="mt-6">
                {tab === "details" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Description */}
                        {property.description && (
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('create.description')}</h3>
                                <p className="text-gray-600 leading-relaxed">{property.description}</p>
                            </div>
                        )}

                        {/* Base Price Section */}
                        <section>
                            <div className="mb-3">
                                <h2 className="text-xl font-bold text-gray-900">{t('basePriceLabel')}</h2>
                                <p className="text-sm text-gray-500">{t('basePriceDescription')}</p>
                            </div>
                            <BasePriceCard property={property} currentBasePrice={currentBasePrice} />
                        </section>

                        {/* Costs Section */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{t('costs')}</h2>
                                    <p className="text-sm text-gray-500">{t('costsDescription')}</p>
                                </div>
                                <AddCostDialog propertyId={property.id} />
                            </div>

                            <CostsTable costs={costs} propertyId={property.id} />
                        </section>
                    </div>
                )}

                {tab === "calendar" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Calendar Section */}
                        <section>
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-gray-900">{t('calendar')}</h2>
                                <p className="text-sm text-gray-500">{t('calendarDescription')}</p>
                            </div>
                            <PropertyCalendar propertyId={property.id} basePrice={property.base_price} />
                        </section>

                        {/* Pricing Rules Section */}
                        <section>
                            <PricingRulesTable rules={pricingRules} propertyId={property.id} basePrice={property.base_price} />
                        </section>
                    </div>
                )}

                {tab === "reports" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <FinancialReport propertyId={property.id} />
                    </div>
                )}
            </div>
        </div>
    );
}
