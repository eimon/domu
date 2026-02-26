"use client";

import { useState, useEffect, useActionState } from "react";
import { CalendarDay } from "@/types/api";
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { getCalendarData } from "@/actions/calendar";
import { createPricingRule, type PricingRuleFormState } from "@/actions/pricing";
import { useTranslations, useLocale } from "next-intl";

interface PropertyCalendarProps {
    propertyId: string;
    initialMonth?: Date;
}

export default function PropertyCalendar({ propertyId, initialMonth = new Date() }: PropertyCalendarProps) {
    const [currentDate, setCurrentDate] = useState(initialMonth);
    const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectionStart, setSelectionStart] = useState<string | null>(null);
    const [selectionEnd, setSelectionEnd] = useState<string | null>(null);
    const [hoverDate, setHoverDate] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const t = useTranslations("Calendar");
    const locale = useLocale();

    const createRuleWithId = createPricingRule.bind(null, propertyId);
    const [ruleState, ruleFormAction, isRulePending] = useActionState<PricingRuleFormState, FormData>(
        createRuleWithId,
        { error: "", success: false }
    );

    useEffect(() => {
        if (ruleState.success) {
            setSelectionStart(null);
            setSelectionEnd(null);
            setRefreshTrigger(t => t + 1);
        }
    }, [ruleState.success]);

    useEffect(() => {
        fetchCalendarData();
    }, [currentDate, propertyId, refreshTrigger]);

    const fetchCalendarData = async () => {
        setIsLoading(true);

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

    const handleDayClick = (dateStr: string) => {
        if (!selectionStart) {
            setSelectionStart(dateStr);
            setSelectionEnd(null);
        } else if (!selectionEnd) {
            if (dateStr === selectionStart) {
                setSelectionStart(null);
            } else if (dateStr < selectionStart) {
                setSelectionEnd(selectionStart);
                setSelectionStart(dateStr);
            } else {
                setSelectionEnd(dateStr);
            }
            setHoverDate(null);
        } else {
            setSelectionStart(dateStr);
            setSelectionEnd(null);
            setHoverDate(null);
        }
    };

    const getDaySelectionStyle = (dateStr: string): string | null => {
        const activeEnd = selectionEnd ?? (selectionStart ? hoverDate : null);
        const rangeStart = selectionStart && activeEnd
            ? (selectionStart <= activeEnd ? selectionStart : activeEnd)
            : selectionStart;
        const rangeEnd = selectionStart && activeEnd
            ? (selectionStart <= activeEnd ? activeEnd : selectionStart)
            : null;

        const isStart = dateStr === rangeStart;
        const isEnd = rangeEnd && dateStr === rangeEnd;
        const inRange = rangeStart && rangeEnd && dateStr > rangeStart && dateStr < rangeEnd;
        const isConfirmed = selectionEnd !== null;

        if (isStart || isEnd) return isConfirmed ? 'bg-blue-500 border-blue-500 text-white' : 'bg-blue-400 border-blue-400 text-white';
        if (inRange) return isConfirmed ? 'bg-blue-100 border-blue-200' : 'bg-blue-50 border-blue-100';
        return null;
    };

    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days: (CalendarDay | null)[] = [];

        const firstDayOfWeek = firstDay.getDay();
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(null);
        }

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
        const date = new Date(2024, 0, 7 + i);
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
                        {days.map((day, index) => {
                            if (day === null) {
                                return (
                                    <div
                                        key={index}
                                        className="min-h-20 p-2 border rounded-lg bg-gray-50 border-transparent"
                                    />
                                );
                            }

                            const selectionStyle = getDaySelectionStyle(day.date);
                            const isEndpointSelected = selectionStyle?.includes('bg-blue-500') || selectionStyle?.includes('bg-blue-400');
                            const isInRangeSelected = selectionStyle !== null && !isEndpointSelected;
                            const baseStyle = selectionStyle
                                ? selectionStyle
                                : day.status === 'RESERVED'
                                    ? 'bg-red-50 border-red-200'
                                    : 'bg-white border-gray-200 hover:border-blue-300';

                            return (
                                <div
                                    key={index}
                                    className={`min-h-20 p-2 border rounded-lg cursor-pointer transition-colors ${baseStyle}`}
                                    onClick={() => handleDayClick(day.date)}
                                    onMouseEnter={() => selectionStart && !selectionEnd && setHoverDate(day.date)}
                                    onMouseLeave={() => selectionStart && !selectionEnd && setHoverDate(null)}
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
                                        <div className={`text-xs mt-0.5 truncate ${isEndpointSelected ? 'text-blue-100' : isInRangeSelected ? 'text-blue-500' : 'text-gray-500'}`} title={day.rule_name}>
                                            {day.rule_name}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Selection in progress banner */}
                    {selectionStart && !selectionEnd && (
                        <div className="mt-3 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700">
                            <span>{t('selectingFrom', { date: selectionStart })}</span>
                            <button
                                onClick={() => { setSelectionStart(null); setHoverDate(null); }}
                                className="ml-2 p-1 hover:bg-blue-100 rounded transition-colors"
                                title={t('cancelSelection')}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {/* Inline rule creation form */}
                    {selectionStart && selectionEnd && (
                        <div className="mt-4 border border-blue-200 rounded-xl p-4 bg-blue-50">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-blue-900">{t('newRule')}</h4>
                                <button
                                    onClick={() => { setSelectionStart(null); setSelectionEnd(null); }}
                                    className="p-1 hover:bg-blue-100 rounded transition-colors text-blue-600"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                            <p className="text-xs text-blue-700 mb-3">
                                {t('selectedRange', { start: selectionStart, end: selectionEnd })}
                            </p>
                            <form action={ruleFormAction} className="space-y-3">
                                <input type="hidden" name="start_date" value={selectionStart} />
                                <input type="hidden" name="end_date" value={selectionEnd} />

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        {t('ruleName')}
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        placeholder={t('ruleNamePlaceholder')}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            {t('profitabilityPercent')}
                                        </label>
                                        <input
                                            type="number"
                                            name="profitability_percent"
                                            defaultValue={100}
                                            min={0}
                                            step={0.01}
                                            required
                                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        />
                                        <p className="text-xs text-gray-500 mt-0.5">{t('profitabilityHint')}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            {t('priority')}
                                        </label>
                                        <input
                                            type="number"
                                            name="priority"
                                            defaultValue={10}
                                            min={0}
                                            step={1}
                                            required
                                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        />
                                        <p className="text-xs text-gray-500 mt-0.5">{t('priorityHint')}</p>
                                    </div>
                                </div>

                                {ruleState.error && (
                                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-1.5">
                                        {ruleState.error}
                                    </p>
                                )}

                                <div className="flex gap-2 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => { setSelectionStart(null); setSelectionEnd(null); }}
                                        className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        {t('cancelSelection')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isRulePending}
                                        className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                                    >
                                        {isRulePending && <Loader2 size={13} className="animate-spin" />}
                                        {t('saveRule')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

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
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-500 border border-blue-500 rounded"></div>
                            <span className="text-gray-600">{t('selected')}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
