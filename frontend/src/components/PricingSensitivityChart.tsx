"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Users, BarChart3 } from "lucide-react";
import { PriceSensitivityAnalysis } from "@/types/pricing_analytics";
import { formatPrice } from "@/lib/utils";

interface PricingSensitivityChartProps {
    analysis: PriceSensitivityAnalysis | null;
    isLoading?: boolean;
}

export default function PricingSensitivityChart({ 
    analysis, 
    isLoading = false 
}: PricingSensitivityChartProps) {
    const [selectedScenario, setSelectedScenario] = useState<string>("CURRENT");

    useEffect(() => {
        if (analysis) {
            setSelectedScenario("CURRENT");
        }
    }, [analysis]);

    if (isLoading) {
        return (
            <div className="glass rounded-2xl p-6">
                <div className="animate-pulse">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-5 h-5 bg-white/10 rounded"></div>
                        <div className="w-40 h-5 bg-white/10 rounded"></div>
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-full h-16 bg-white/5 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="glass rounded-2xl p-6">
                <div className="text-center py-8 text-white/40">
                    <BarChart3 size={24} className="mx-auto mb-2" />
                    <p className="text-sm">No hay datos de sensibilidad disponibles</p>
                </div>
            </div>
        );
    }

    const getScenarioIcon = (scenarioType: string) => {
        switch (scenarioType) {
            case "INCREASE":
                return <TrendingUp size={16} className="text-domu-success" />;
            case "DECREASE":
                return <TrendingDown size={16} className="text-domu-warning" />;
            default:
                return <DollarSign size={16} className="text-domu-primary" />;
        }
    };

    const getScenarioColor = (scenarioType: string, isSelected: boolean) => {
        if (isSelected) {
            switch (scenarioType) {
                case "INCREASE":
                    return "border-domu-success/40 bg-domu-success/10";
                case "DECREASE":
                    return "border-domu-warning/40 bg-domu-warning/10";
                default:
                    return "border-domu-primary/40 bg-domu-primary/10";
            }
        }
        return "border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.03]";
    };

    const getScenarioLabel = (scenarioType: string) => {
        switch (scenarioType) {
            case "INCREASE":
                return "Precio Alto";
            case "DECREASE":
                return "Precio Bajo";
            default:
                return "Precio Actual";
        }
    };

    const selectedData = analysis.price_scenarios.find(s => s.scenario_type === selectedScenario) 
                        || analysis.price_scenarios[1]; // fallback to current

    // Find best scenario for revenue
    const bestRevenueScenario = analysis.price_scenarios.reduce((best, current) => 
        current.estimated_monthly_revenue > best.estimated_monthly_revenue ? current : best
    );

    return (
        <div className="glass rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2">
                <BarChart3 size={20} className="text-domu-primary" />
                <h3 className="font-bold text-white/85">Análisis de Sensibilidad de Precios</h3>
            </div>

            {/* Escenarios de precio */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-white/70">Escenarios</h4>
                <div className="grid grid-cols-1 gap-2">
                    {analysis.price_scenarios.map((scenario, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedScenario(scenario.scenario_type)}
                            className={`flex items-center justify-between p-4 rounded-lg border transition-all text-left ${
                                getScenarioColor(scenario.scenario_type, selectedScenario === scenario.scenario_type)
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                {getScenarioIcon(scenario.scenario_type)}
                                <div>
                                    <div className="font-medium text-white/80">
                                        {getScenarioLabel(scenario.scenario_type)}
                                    </div>
                                    <div className="text-xs text-white/50">
                                        {scenario.profitability_percent.toFixed(1)}% rentabilidad
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <div className="font-bold text-white/90">
                                    {formatPrice(scenario.estimated_monthly_revenue)}
                                </div>
                                <div className="text-xs text-white/50">
                                    {scenario.expected_occupancy.toFixed(0)}% ocupación
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Detalles del escenario seleccionado */}
            <div className="glass-elevated rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-white/70">
                        Detalles: {getScenarioLabel(selectedData.scenario_type)}
                    </h4>
                    {selectedData === bestRevenueScenario && (
                        <div className="px-2 py-1 bg-domu-success/20 text-domu-success text-xs rounded-full">
                            Mejor Revenue
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <DollarSign size={14} className="text-domu-primary" />
                            <span className="text-xs text-white/50">Revenue Mensual</span>
                        </div>
                        <div className="text-lg font-bold text-domu-success">
                            {formatPrice(selectedData.estimated_monthly_revenue)}
                        </div>
                    </div>
                    
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Users size={14} className="text-domu-primary" />
                            <span className="text-xs text-white/50">Ocupación</span>
                        </div>
                        <div className="text-lg font-bold text-domu-primary">
                            {selectedData.expected_occupancy.toFixed(1)}%
                        </div>
                    </div>
                </div>

                {/* Barra de progreso visual */}
                <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs text-white/50">
                        <span>Revenue</span>
                        <span>{((selectedData.estimated_monthly_revenue / Math.max(...analysis.price_scenarios.map(s => s.estimated_monthly_revenue))) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                        <div 
                            className="bg-gradient-to-r from-domu-success to-domu-primary h-2 rounded-full transition-all duration-300"
                            style={{
                                width: `${(selectedData.estimated_monthly_revenue / Math.max(...analysis.price_scenarios.map(s => s.estimated_monthly_revenue))) * 100}%`
                            }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Recomendación */}
            <div className="bg-domu-primary/10 border border-domu-primary/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-domu-primary text-sm mb-2">
                    <BarChart3 size={14} />
                    <span className="font-medium">Recomendación del Análisis</span>
                </div>
                <p className="text-xs text-white/70">{analysis.recommendation}</p>
            </div>

            {/* Comparación rápida */}
            <div className="grid grid-cols-3 gap-2 text-xs">
                {analysis.price_scenarios.map((scenario, index) => {
                    const isWorst = scenario.estimated_monthly_revenue === Math.min(...analysis.price_scenarios.map(s => s.estimated_monthly_revenue));
                    const isBest = scenario.estimated_monthly_revenue === Math.max(...analysis.price_scenarios.map(s => s.estimated_monthly_revenue));
                    
                    return (
                        <div 
                            key={index}
                            className={`p-2 rounded border text-center ${
                                isBest ? 'border-domu-success/30 bg-domu-success/5' :
                                isWorst ? 'border-domu-danger/30 bg-domu-danger/5' :
                                'border-white/10 bg-white/5'
                            }`}
                        >
                            <div className="font-medium text-white/80">{getScenarioLabel(scenario.scenario_type)}</div>
                            <div className="text-white/50">{formatPrice(scenario.estimated_monthly_revenue)}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}