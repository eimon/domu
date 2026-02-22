"use client";

import { useState, useEffect } from "react";
import { CalendarDay } from "@/types/api";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { getCalendarData } from "@/actions/calendar";
import { useTranslations, useLocale } from "next-intl";

interface PropertyCalendarProps {
    propertyId: string;
    initialMonth?: Date;
}

export default function PropertyCalendar({ propertyId, initialMonth = new Date() }: PropertyCalendarProps) {
    const [currentDate, setCurrentDate] = useState(initialMonth);
    const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const t = useTranslations("Calendar");
    const locale = useLocale();

    useEffect(() => {
        fetchCalendarData();
    }, [currentDate, propertyId]);

    const fetchCalendarData = async () => {
        setIsLoading(true);

        // Get first and last day of the month
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const startStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const endStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        const data = await getCalendarData(propertyId, startStr, endStr);
        setCalendarData(data);
        setIsLoading(false);
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days: (CalendarDay | null)[] = [];

        // Add empty cells for days before the first of the month
        const firstDayOfWeek = firstDay.getDay();
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayData = calendarData.find(d => d.date === dateStr);
            days.push(dayData || {
                date: dateStr,
                price: 0,
                status: "AVAILABLE",
                floor_price: 0,
                profitability_percent: 100,
            });
        }

        return days;
    };

    const getMonthName = () => {
        return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(currentDate);
    };

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(2024, 0, 7 + i); // Jan 7, 2024 was a Sunday
        return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
    });

    const monthName = getMonthName();
    const days = getDaysInMonth();

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                <button
                    onClick={prevMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <h3 className="text-lg font-semibold text-gray-900 capitalize">{monthName}</h3>
                <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Calendar Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-gray-400" size={32} />
                </div>
            ) : (
                <div className="p-4">
                    <div className="grid grid-cols-7 gap-1">
                        {/* Week day headers */}
                        {weekDays.map(day => (
                            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                                {day}
                            </div>
                        ))}

                        {/* Calendar days */}
                        {days.map((day, index) => (
                            <div
                                key={index}
                                className={`min-h-20 p-2 border rounded-lg ${day === null
                                    ? 'bg-gray-50 border-transparent'
                                    : day.status === 'RESERVED'
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-white border-gray-200 hover:border-blue-300 cursor-pointer'
                                    }`}
                            >
                                {day && (
                                    <>
                                        <div className="text-sm font-medium text-gray-900">
                                            {day.date.split('-')[2].replace(/^0/, '')}
                                        </div>
                                        <div className={`text-xs mt-1 font-semibold ${day.status === 'RESERVED' ? 'text-red-600' : 'text-green-600'
                                            }`}>
                                            ${Number(day.price).toFixed(0)}
                                        </div>
                                        {day.rule_name && (
                                            <div className="text-xs text-gray-500 mt-0.5 truncate" title={day.rule_name}>
                                                {day.rule_name}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
                            <span className="text-gray-600">{t('available')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
                            <span className="text-gray-600">{t('reserved')}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
