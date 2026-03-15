"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
    monthName: string;
    onPrevMonth: () => void;
    onNextMonth: () => void;
}

export default function CalendarHeader({ monthName, onPrevMonth, onNextMonth }: CalendarHeaderProps) {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.03]">
            <button
                onClick={onPrevMonth}
                className="p-2 text-white/45 hover:text-white/80 hover:bg-white/[0.06] rounded-lg transition-colors"
            >
                <ChevronLeft size={18} />
            </button>
            <h3 className="text-sm font-semibold text-white/80 capitalize">{monthName}</h3>
            <button
                onClick={onNextMonth}
                className="p-2 text-white/45 hover:text-white/80 hover:bg-white/[0.06] rounded-lg transition-colors"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
}
