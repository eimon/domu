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
            className="glass rounded-xl overflow-hidden hover:bg-white/[0.07] hover:shadow-[0_8px_32px_rgb(99_102_241_/_0.12)] transition-all duration-200 flex flex-col h-full cursor-pointer group"
        >
            <div className="h-44 relative overflow-hidden">
                {hasCoords ? (
                    <MapThumbnail lat={property.latitude!} lon={property.longitude!} />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500/60 to-violet-600/60 flex items-center justify-center">
                        <Home size={44} className="text-white/30 group-hover:text-white/40 transition-colors" />
                    </div>
                )}
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <div className="flex-1">
                    <h3 className="text-base font-semibold text-white/90 mb-1 leading-snug">{property.name}</h3>
                    <div className="flex items-start text-white/45 mb-3">
                        <MapPin size={13} className="mr-1 mt-0.5 flex-shrink-0" />
                        <span className="text-xs line-clamp-2">{property.address}</span>
                    </div>
                    {property.description && (
                        <p className="text-xs text-white/40 line-clamp-3 mb-3">
                            {property.description}
                        </p>
                    )}
                </div>

                <div className="mt-3 pt-3 border-t border-white/[0.06]">
                    <span className="text-xs font-medium px-2 py-1 bg-domu-success/10 text-domu-success rounded-full">
                        {tCommon('active')}
                    </span>
                </div>
            </div>
        </Link>
    );
}
