"use client";

import { Property } from "@/types/api";
import { MapPin, Home } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

interface PropertyCardProps {
    property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
    const t = useTranslations("Properties");
    const tCommon = useTranslations("Common");

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
            {/* Image Placeholder - In real app this would be an <Image /> */}
            <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white">
                <Home size={48} className="opacity-50" />
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{property.name}</h3>
                    <div className="flex items-start text-gray-500 mb-4">
                        <MapPin size={16} className="mr-1 mt-0.5 flex-shrink-0" />
                        <span className="text-sm line-clamp-2">{property.address}</span>
                    </div>
                    {property.description && (
                        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                            {property.description}
                        </p>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded-full">
                        {tCommon('active')}
                    </span>
                    <Link
                        href={`/properties/${property.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                        {t('details')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
