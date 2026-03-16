"use client";

import { CalendarDay } from "@/types/api";
import { formatPrice, formatPriceCompact } from "@/lib/utils";

interface CalendarDayCellProps {
    day: CalendarDay;
    selectionStyle: string | null;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export default function CalendarDayCell({
    day,
    selectionStyle,
    onClick,
    onMouseEnter,
    onMouseLeave,
}: CalendarDayCellProps) {
    // Endpoint styles contain 'text-white'; range styles don't
    const isEndpointSelected = selectionStyle?.includes('text-white') ?? false;
    const isInRangeSelected = selectionStyle !== null && !isEndpointSelected;

    const baseStyle = selectionStyle
        ? selectionStyle
        : day.status === 'RESERVED'
            ? 'bg-domu-danger/8 border-domu-danger/20'
            : 'bg-white/[0.03] border-white/[0.08] hover:border-domu-primary/40';

    return (
        <button
            type="button"
            className={`min-h-20 p-2 border rounded-lg cursor-pointer transition-colors text-left w-full ${baseStyle}`}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className={`text-sm font-medium ${isEndpointSelected ? 'text-white' : 'text-white/75'}`}>
                {day.date.split('-')[2].replace(/^0/, '')}
            </div>
            <div className={`text-xs mt-1 font-semibold ${
                isEndpointSelected ? 'text-white'
                : isInRangeSelected ? 'text-domu-primary/80'
                : day.status === 'RESERVED' ? 'text-domu-danger/70'
                : 'text-domu-success/80'
            }`}>
                <span className="md:hidden">${formatPriceCompact(day.price)}</span>
                <span className="hidden md:inline">${formatPrice(day.price)}</span>
            </div>
            {day.rule_name && (
                <div
                    className={`text-xs mt-0.5 truncate ${isEndpointSelected ? 'text-white/70' : isInRangeSelected ? 'text-domu-primary/50' : 'text-white/30'}`}
                    title={day.rule_name}
                >
                    {day.rule_name}
                </div>
            )}
        </button>
    );
}
