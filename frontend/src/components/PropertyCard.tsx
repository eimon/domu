"use client";

import { Property } from "@/types/api";
import { MapPin, Home } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import MapThumbnail from "@/components/MapThumbnail";

interface PropertyCardProps {
    property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
    const tCommon = useTranslations("Common");

    const hasCoords = property.latitude != null && property.longitude != null;

    return (
        <Link
            href={`/properties/${property.id}`}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col h-full cursor-pointer"
        >
            <div className="h-48 relative">
                {hasCoords ? (
                    <MapThumbnail lat={property.latitude!} lon={property.longitude!} />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white">
                        <Home size={48} className="opacity-50" />
                    </div>
                )}
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

                <div className="mt-4 pt-4 border-t border-gray-50">
                    <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded-full">
                        {tCommon('active')}
                    </span>
                </div>
            </div>
        </Link>
    );
}
