"use client";

import { useReducer, useEffect, useState } from "react";
import { CalendarDay } from "@/types/api";
import { Loader2, X } from "lucide-react";
import { getCalendarData } from "@/actions/calendar";
import { createPricingRule, type PricingRuleFormState } from "@/actions/pricing";
import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import CalendarHeader from "@/components/CalendarHeader";
import CalendarDayCell from "@/components/CalendarDayCell";

// --- Selection state ---

type SelectionState = {
    currentDate: Date;
    selectionStart: string | null;
    selectionEnd: string | null;
    hoverDate: string | null;
};

type SelectionAction =
    | { type: 'PREV_MONTH' }
    | { type: 'NEXT_MONTH' }
    | { type: 'DAY_CLICK'; date: string }
    | { type: 'SET_HOVER'; date: string | null }
    | { type: 'RESET_SELECTION' };

function selectionReducer(state: SelectionState, action: SelectionAction): SelectionState {
    switch (action.type) {
        case 'PREV_MONTH':
            return { ...state, currentDate: new Date(state.currentDate.getFullYear(), state.currentDate.getMonth() - 1, 1) };
        case 'NEXT_MONTH':
            return { ...state, currentDate: new Date(state.currentDate.getFullYear(), state.currentDate.getMonth() + 1, 1) };
        case 'DAY_CLICK': {
            const { date } = action;
            if (!state.selectionStart) {
                return { ...state, selectionStart: date, selectionEnd: null };
            }
            if (!state.selectionEnd) {
                if (date === state.selectionStart) {
                    return { ...state, selectionStart: null };
                }
                if (date < state.selectionStart) {
                    return { ...state, selectionStart: date, selectionEnd: state.selectionStart, hoverDate: null };
                }
                return { ...state, selectionEnd: date, hoverDate: null };
            }
            return { ...state, selectionStart: date, selectionEnd: null, hoverDate: null };
        }
        case 'SET_HOVER':
            return { ...state, hoverDate: action.date };
        case 'RESET_SELECTION':
            return { ...state, selectionStart: null, selectionEnd: null, hoverDate: null };
        default:
            return state;
    }
}

// --- Data state ---

type DataState = {
    calendarData: CalendarDay[];
    isLoading: boolean;
    refreshTrigger: number;
};

type DataAction =
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; data: CalendarDay[] }
    | { type: 'TRIGGER_REFRESH' };

function dataReducer(state: DataState, action: DataAction): DataState {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, isLoading: true };
        case 'FETCH_SUCCESS':
            return { ...state, isLoading: false, calendarData: action.data };
        case 'TRIGGER_REFRESH':
            return { ...state, refreshTrigger: state.refreshTrigger + 1 };
        default:
            return state;
    }
}

// --- Component ---

interface PropertyCalendarProps {
    propertyId: string;
    basePrice?: number;
    // initialMonth is only used as the initial value (uncontrolled pattern)
    initialMonth?: Date;
}

export default function PropertyCalendar({ propertyId, basePrice = 0, initialMonth = new Date() }: PropertyCalendarProps) {
    const [selection, dispatchSelection] = useReducer(selectionReducer, {
        currentDate: initialMonth,
        selectionStart: null,
        selectionEnd: null,
        hoverDate: null,
    });

    const [data, dispatchData] = useReducer(dataReducer, {
        calendarData: [],
        isLoading: true,
        refreshTrigger: 0,
    });

    const [calendarProfitability, setCalendarProfitability] = useState(100);

    const t = useTranslations("Calendar");
    const locale = useLocale();

    // Wrap the server action to handle post-success side effects inline
    const createRuleWithId = createPricingRule.bind(null, propertyId);
    const handleRuleAction = async (prevState: PricingRuleFormState, formData: FormData): Promise<PricingRuleFormState> => {
        const result = await createRuleWithId(prevState, formData);
        if (result.success) {
            dispatchSelection({ type: 'RESET_SELECTION' });
            dispatchData({ type: 'TRIGGER_REFRESH' });
            setCalendarProfitability(100);
        }
        return result;
    };

    const [ruleState, ruleFormAction, isRulePending] = useActionState<PricingRuleFormState, FormData>(
        handleRuleAction,
        { error: "", success: false }
    );

    useEffect(() => {
        const year = selection.currentDate.getFullYear();
        const month = selection.currentDate.getMonth();
        const startStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const endStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        dispatchData({ type: 'FETCH_START' });
        getCalendarData(propertyId, startStr, endStr).then(d => {
            dispatchData({ type: 'FETCH_SUCCESS', data: d });
        });
    }, [selection.currentDate, propertyId, data.refreshTrigger]);

    const getDaySelectionStyle = (dateStr: string): string | null => {
        const { selectionStart, selectionEnd, hoverDate } = selection;
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

    type CalendarDayCell = CalendarDay & { isPad?: true };

    const getDaysInMonth = (): CalendarDayCell[] => {
        const year = selection.currentDate.getFullYear();
        const month = selection.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days: CalendarDayCell[] = [];

        // Pad cells use the actual prev-month date as a stable unique key
        const firstDayOfWeek = firstDay.getDay();
        for (let i = 0; i < firstDayOfWeek; i++) {
            const d = new Date(year, month, i - firstDayOfWeek + 1);
            const dateStr = `pad-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            days.push({ date: dateStr, price: 0, status: "AVAILABLE", floor_price: 0, profitability_percent: 0, isPad: true });
        }

        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayData = data.calendarData.find(d => d.date === dateStr);
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

    const monthName = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(selection.currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(2024, 0, 7 + i);
        return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
    });
    const days = getDaysInMonth();

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <CalendarHeader
                monthName={monthName}
                onPrevMonth={() => dispatchSelection({ type: 'PREV_MONTH' })}
                onNextMonth={() => dispatchSelection({ type: 'NEXT_MONTH' })}
            />

            {data.isLoading ? (
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
                        {days.map((day) => {
                            if (day.isPad) {
                                return (
                                    <div
                                        key={day.date}
                                        className="min-h-20 p-2 border rounded-lg bg-gray-50 border-transparent"
                                    />
                                );
                            }

                            return (
                                <CalendarDayCell
                                    key={day.date}
                                    day={day}
                                    selectionStyle={getDaySelectionStyle(day.date)}
                                    onClick={() => dispatchSelection({ type: 'DAY_CLICK', date: day.date })}
                                    onMouseEnter={() => {
                                        if (selection.selectionStart && !selection.selectionEnd) {
                                            dispatchSelection({ type: 'SET_HOVER', date: day.date });
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        if (selection.selectionStart && !selection.selectionEnd) {
                                            dispatchSelection({ type: 'SET_HOVER', date: null });
                                        }
                                    }}
                                />
                            );
                        })}
                    </div>

                    {/* Selection in progress banner */}
                    {selection.selectionStart && !selection.selectionEnd && (
                        <div className="mt-3 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700">
                            <span>{t('selectingFrom', { date: selection.selectionStart })}</span>
                            <button
                                onClick={() => dispatchSelection({ type: 'RESET_SELECTION' })}
                                className="ml-2 p-1 hover:bg-blue-100 rounded transition-colors"
                                title={t('cancelSelection')}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {/* Inline rule creation form */}
                    {selection.selectionStart && selection.selectionEnd && (
                        <div className="mt-4 border border-blue-200 rounded-xl p-4 bg-blue-50">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-blue-900">{t('newRule')}</h4>
                                <button
                                    onClick={() => { dispatchSelection({ type: 'RESET_SELECTION' }); setCalendarProfitability(100); }}
                                    className="p-1 hover:bg-blue-100 rounded transition-colors text-blue-600"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                            <p className="text-xs text-blue-700 mb-3">
                                {t('selectedRange', { start: selection.selectionStart, end: selection.selectionEnd })}
                            </p>
                            <form action={ruleFormAction} className="space-y-3">
                                <input type="hidden" name="start_date" value={selection.selectionStart} />
                                <input type="hidden" name="end_date" value={selection.selectionEnd} />

                                <div>
                                    <label htmlFor="calendar_rule_name" className="block text-xs font-medium text-gray-700 mb-1">
                                        {t('ruleName')}
                                    </label>
                                    <input
                                        id="calendar_rule_name"
                                        type="text"
                                        name="name"
                                        required
                                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        placeholder={t('ruleNamePlaceholder')}
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label htmlFor="calendar_rule_profitability" className="block text-xs font-medium text-gray-700">
                                            {t('profitabilityPercent')}
                                        </label>
                                        {(() => {
                                            const floorPrice = data.calendarData.find(d => d.date === selection.selectionStart)?.floor_price ?? 0;
                                            const price = floorPrice + (basePrice - floorPrice) * calendarProfitability / 100;
                                            return (
                                                <span className="text-xs font-semibold text-blue-700">
                                                    ${price.toFixed(2)} / night
                                                </span>
                                            );
                                        })()}
                                    </div>
                                    <input
                                        id="calendar_rule_profitability"
                                        type="number"
                                        name="profitability_percent"
                                        value={calendarProfitability}
                                        onChange={(e) => setCalendarProfitability(parseFloat(e.target.value) || 0)}
                                        min={0}
                                        step={0.1}
                                        required
                                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white mb-2"
                                    />
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        step={1}
                                        value={Math.min(Math.max(calendarProfitability, 0), 100)}
                                        onChange={(e) => setCalendarProfitability(parseFloat(e.target.value))}
                                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:border-0"
                                        style={{
                                            background: `linear-gradient(to right, #2563eb 0%, #2563eb ${Math.min(Math.max(calendarProfitability, 0), 100)}%, #e5e7eb ${Math.min(Math.max(calendarProfitability, 0), 100)}%, #e5e7eb 100%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                                        <span>0%</span>
                                        <span>100% = ${basePrice}</span>
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
                                        onClick={() => { dispatchSelection({ type: 'RESET_SELECTION' }); setCalendarProfitability(100); }}
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
