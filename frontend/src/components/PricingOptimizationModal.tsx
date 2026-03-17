"use client";

import { useState, useActionState } from "react";
import { X, Zap, Target, TrendingUp, Users, Calendar } from "lucide-react";
import { optimizePricing, type OptimizationFormState } from "@/actions/pricing_analytics";
import { PricingOptimizationResponse } from "@/types/pricing_analytics";
import { formatPrice } from "@/lib/utils";

interface PricingOptimizationModalProps {
    propertyId: string;
    isOpen: boolean;
    onClose: () => void;
    onOptimizationResult?: (result: PricingOptimizationResponse) => void;
}

const initialState: OptimizationFormState = {};

export default function PricingOptimizationModal({
    propertyId,
    isOpen,
    onClose,
    onOptimizationResult
}: PricingOptimizationModalProps) {
    const [priority, setPriority] = useState<"REVENUE" | "OCCUPANCY" | "BALANCED">("BALANCED");
    const [targetOccupancy, setTargetOccupancy] = useState(70);
    const [dateRange, setDateRange] = useState({
        start: new Date().toISOString().split('T')[0],
        end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    const [state, formAction, isPending] = useActionState(optimizePricing, initialState);

    const handleSubmit = async (formData: FormData) => {
        formData.set("property_id", propertyId);
        formData.set("target_occupancy", targetOccupancy.toString());
        formData.set("priority", priority);
        formData.set("date_range_start", dateRange.start);
        formData.set("date_range_end", dateRange.end);
        
        const result = await formAction(formData);
        
        if (result.success && onOptimizationResult) {
            onOptimizationResult(result as any);
            onClose();
        }
    };

    const priorities = [
        {
            value: "REVENUE" as const,
            label: "Maximizar Ingresos",
            description: "Optimiza para obtener el mayor revenue posible",
            icon: TrendingUp,
            color: "text-domu-success"
        },
        {
            value: "OCCUPANCY" as const,
            label: "Maximizar Ocupación",
            description: "Prioriza llenar todas las noches disponibles",
            icon: Users,
            color: "text-domu-primary"
        },
        {
            value: "BALANCED" as const,
            label: "Enfoque Balanceado",
            description: "Equilibrio entre ingresos y ocupación",
            icon: Target,
            color: "text-domu-warning"
        }
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-modal rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-domu-primary/20 rounded-lg">
                            <Zap size={20} className="text-domu-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white/90">Optimización Inteligente</h2>
                            <p className="text-sm text-white/50">Usa IA para optimizar tu estrategia de precios</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-white/50" />
                    </button>
                </div>

                <form action={handleSubmit} className="p-6 space-y-6">
                    {/* Estrategia de optimización */}
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-3">
                            Estrategia de Optimización
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                            {priorities.map((item) => (
                                <div key={item.value}>
                                    <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                                        priority === item.value
                                            ? 'border-domu-primary/40 bg-domu-primary/10'
                                            : 'border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.03]'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="priority"
                                            value={item.value}
                                            checked={priority === item.value}
                                            onChange={(e) => setPriority(e.target.value as any)}
                                            className="sr-only"
                                        />
                                        <div className={`p-2 rounded-lg ${
                                            priority === item.value ? 'bg-domu-primary/20' : 'bg-white/5'
                                        }`}>
                                            <item.icon size={18} className={item.color} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-white/80">{item.label}</div>
                                            <div className="text-xs text-white/50">{item.description}</div>
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Ocupación objetivo */}
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-3">
                            Ocupación Objetivo
                        </label>
                        <div className="space-y-3">
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="30"
                                    max="95"
                                    step="5"
                                    value={targetOccupancy}
                                    onChange={(e) => setTargetOccupancy(Number(e.target.value))}
                                    className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-domu-danger to-domu-success"
                                />
                                <div className="text-lg font-bold text-domu-primary min-w-[60px] text-center">
                                    {targetOccupancy}%
                                </div>
                            </div>
                            <div className="flex justify-between text-xs text-white/40">
                                <span>30% - Conservador</span>
                                <span>65% - Equilibrado</span>
                                <span>95% - Agresivo</span>
                            </div>
                        </div>
                    </div>

                    {/* Período de análisis */}
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-3">
                            Período de Análisis
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-white/50 mb-1">Fecha inicio</label>
                                <div className="relative">
                                    <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30" />
                                    <input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                        className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/[0.08] rounded-lg text-white/80 text-sm focus:border-domu-primary/50 focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-white/50 mb-1">Fecha fin</label>
                                <div className="relative">
                                    <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/30" />
                                    <input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                        className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/[0.08] rounded-lg text-white/80 text-sm focus:border-domu-primary/50 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error display */}
                    {state.error && (
                        <div className="bg-domu-danger/10 border border-domu-danger/20 rounded-lg p-3">
                            <p className="text-domu-danger text-sm">{state.error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-white/70 hover:text-white/90 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-6 py-2 bg-domu-primary hover:bg-domu-primary/80 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isPending ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Optimizando...
                                </>
                            ) : (
                                <>
                                    <Zap size={16} />
                                    Optimizar Precios
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}