"use client";

import { CalendarDay } from "@/types/api";

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
    const isEndpointSelected = selectionStyle?.includes('bg-blue-500') || selectionStyle?.includes('bg-blue-400');
    const isInRangeSelected = selectionStyle !== null && !isEndpointSelected;
    const baseStyle = selectionStyle
        ? selectionStyle
        : day.status === 'RESERVED'
            ? 'bg-red-50 border-red-200'
            : 'bg-white border-gray-200 hover:border-blue-300';

    return (
        <button
            type="button"
            className={`min-h-20 p-2 border rounded-lg cursor-pointer transition-colors text-left w-full ${baseStyle}`}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className={`text-sm font-medium ${isEndpointSelected ? 'text-white' : 'text-gray-900'}`}>
                {day.date.split('-')[2].replace(/^0/, '')}
            </div>
            <div className={`text-xs mt-1 font-semibold ${
                isEndpointSelected ? 'text-white'
                : isInRangeSelected ? 'text-blue-700'
                : day.status === 'RESERVED' ? 'text-red-600'
                : 'text-green-600'
            }`}>
                ${Number(day.price).toFixed(0)}
            </div>
            {day.rule_name && (
                <div
                    className={`text-xs mt-0.5 truncate ${isEndpointSelected ? 'text-blue-100' : isInRangeSelected ? 'text-blue-500' : 'text-gray-500'}`}
                    title={day.rule_name}
                >
                    {day.rule_name}
                </div>
            )}
        </button>
    );
}
