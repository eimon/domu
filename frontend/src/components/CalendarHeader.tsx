"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
    monthName: string;
    onPrevMonth: () => void;
    onNextMonth: () => void;
}

export default function CalendarHeader({ monthName, onPrevMonth, onNextMonth }: CalendarHeaderProps) {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <button
                onClick={onPrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <ChevronLeft size={20} />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 capitalize">{monthName}</h3>
            <button
                onClick={onNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
}
