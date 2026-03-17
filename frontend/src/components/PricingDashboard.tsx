"use client";

import { useState, useEffect } from "react";
import { 
    TrendingUp, BarChart3, Target, Zap, 
    ArrowUpRight, ArrowDownRight, Activity,
    Calendar, DollarSign, Users
} from "lucide-react";
import { PricingAnalytics, ProfitabilityProjection, MarketInsights } from "@/types/pricing_analytics";
import { formatPrice } from "@/lib/utils";
import ProfitabilitySlider from "./ProfitabilitySlider";

interface PricingDashboardProps {
    analytics: PricingAnalytics;
    projections: ProfitabilityProjection[];
    marketInsights: MarketInsights | null;
    onProfitabilityChange: (profitability: number) => void;
    isLoading?: boolean;
}

export default function PricingDashboard({
    analytics,
    projections,
    marketInsights,
    onProfitabilityChange,
    isLoading = false
}: PricingDashboardProps) {
    const [selectedTimeframe, setSelectedTimeframe] = useState<'3M' | '6M' | '12M'>('6M');

    const getProjectionsForTimeframe = () => {
        const months = selectedTimeframe === '3M' ? 3 : selectedTimeframe === '6M' ? 6 : 12;
        return projections.slice(0, months);
    };

    const getMarketPositionIcon = () => {
        if (!marketInsights) return <Activity size={20} className="text-white/50" />;
        
        switch (marketInsights.market_position) {
            case "ABOVE":
                return <ArrowUpRight size={20} className="text-domu-success" />;
            case "BELOW":
                return <ArrowDownRight size={20} className="text-domu-warning" />;
            default:
                return <Target size={20} className="text-domu-primary" />;
        }
    };

    const getSeasonalIndicator = () => {
        const { seasonal_demand } = analytics;
        const isHighSeason = seasonal_demand.demand_multiplier > 1.2;
        const isMediumSeason = seasonal_demand.demand_multiplier > 0.9;
        
        if (isHighSeason) {
            return { color: "text-domu-success", label: "Alta Demanda", icon: TrendingUp };
        } else if (isMediumSeason) {
            return { color: "text-domu-warning", label: "Demanda Media", icon: Activity };
        } else {
            return { color: "text-domu-danger", label: "Baja Demanda", icon: ArrowDownRight };
        }
    };

    const seasonal = getSeasonalIndicator();

    return (
        <div className="space-y-6">
            {/* Header con métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <DollarSign size={18} className="text-domu-primary" />
                        <span className="text-xs text-white/40">Precio Base</span>
                    </div>
                    <div className="text-xl font-bold text-white/90">
                        {formatPrice(analytics.base_price)}
                    </div>
                    <div className="text-xs text-white/50">por noche</div>
                </div>

                <div className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        {getMarketPositionIcon()}
                        <span className="text-xs text-white/40">Posición</span>
                    </div>
                    <div className="text-xl font-bold text-white/90">
                        {marketInsights?.market_position === "ABOVE" ? "Premium" : 
                         marketInsights?.market_position === "BELOW" ? "Agresivo" : "Competitivo"}
                    </div>
                    <div className="text-xs text-white/50">
                        vs. mercado: {marketInsights ? formatPrice(Math.abs(marketInsights.competitive_gap)) : "N/A"}
                    </div>
                </div>

                <div className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <seasonal.icon size={18} className={seasonal.color} />
                        <span className="text-xs text-white/40">Estacionalidad</span>
                    </div>
                    <div className="text-xl font-bold text-white/90">
                        {seasonal.label}
                    </div>
                    <div className="text-xs text-white/50">
                        {analytics.seasonal_demand.season_name}
                    </div>
                </div>

                <div className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <Zap size={18} className="text-domu-warning" />
                        <span className="text-xs text-white/40">Ocupación Est.</span>
                    </div>
                    <div className="text-xl font-bold text-white/90">
                        {analytics.seasonal_demand.historical_occupancy.toFixed(0)}%
                    </div>
                    <div className="text-xs text-white/50">histórica</div>
                </div>
            </div>

            {/* Slider de rentabilidad */}
            <ProfitabilitySlider 
                analytics={analytics}
                onProfitabilityChange={onProfitabilityChange}
                isLoading={isLoading}
            />

            {/* Proyecciones y gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Proyecciones de rentabilidad */}
                <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <BarChart3 size={20} className="text-domu-primary" />
                            <h3 className="font-bold text-white/85">Proyecciones</h3>
                        </div>
                        
                        {/* Selector de timeframe */}
                        <div className="flex bg-white/5 rounded-lg p-1">
                            {(['3M', '6M', '12M'] as const).map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setSelectedTimeframe(period)}
                                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                        selectedTimeframe === period
                                            ? 'bg-domu-primary text-white'
                                            : 'text-white/50 hover:text-white/80'
                                    }`}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {getProjectionsForTimeframe().map((projection, index) => (
                            <div key={index} className="flex items-center justify-between p-3 glass-elevated rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Calendar size={14} className="text-domu-primary/70" />
                                    <div>
                                        <div className="text-sm font-medium text-white/80">
                                            {new Intl.DateTimeFormat('es-AR', { 
                                                month: 'short', 
                                                year: 'numeric' 
                                            }).format(new Date(projection.year, projection.month - 1))}
                                        </div>
                                        <div className="text-xs text-white/50">
                                            {projection.projected_occupancy.toFixed(0)}% ocupación
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-right">
                                    <div className="text-sm font-bold text-domu-success">
                                        {formatPrice(projection.projected_profit)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className={`w-1 h-1 rounded-full ${
                                            projection.confidence_level === 'HIGH' ? 'bg-domu-success' :
                                            projection.confidence_level === 'MEDIUM' ? 'bg-domu-warning' :
                                            'bg-domu-danger'
                                        }`}></div>
                                        <span className="text-xs text-white/40">
                                            {projection.confidence_level.toLowerCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Market insights y recomendaciones */}
                <div className="space-y-4">
                    {/* Market insights */}
                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Target size={20} className="text-domu-primary" />
                            <h3 className="font-bold text-white/85">Análisis del Mercado</h3>
                        </div>

                        {marketInsights ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-white/70">Precio promedio mercado</span>
                                    <span className="font-mono text-white/90">
                                        {formatPrice(analytics.market_comparison.avg_market_price)}
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-white/70">Ocupación mercado</span>
                                    <span className="font-mono text-white/90">
                                        {analytics.market_comparison.market_occupancy_rate.toFixed(1)}%
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-white/70">Competidores</span>
                                    <span className="font-mono text-white/90">
                                        {analytics.market_comparison.competitor_count}
                                    </span>
                                </div>

                                {/* Recomendación principal */}
                                <div className={`p-3 rounded-lg border ${
                                    marketInsights.recommendation === "INCREASE" 
                                        ? "bg-domu-success/10 border-domu-success/20" 
                                        : "bg-domu-warning/10 border-domu-warning/20"
                                }`}>
                                    <div className="flex items-center gap-2 text-sm">
                                        {marketInsights.recommendation === "INCREASE" ? (
                                            <ArrowUpRight size={14} className="text-domu-success" />
                                        ) : (
                                            <ArrowDownRight size={14} className="text-domu-warning" />
                                        )}
                                        <span className="font-medium">
                                            Recomendación: {marketInsights.recommendation === "INCREASE" ? "Aumentar" : "Reducir"} precios
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/70 mt-1">
                                        Oportunidad de mercado: {marketInsights.market_opportunity.toFixed(1)} puntos de rentabilidad
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-white/40">
                                <Users size={24} className="mx-auto mb-2" />
                                <p className="text-sm">Cargando datos del mercado...</p>
                            </div>
                        )}
                    </div>

                    {/* Alertas y notificaciones */}
                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap size={20} className="text-domu-warning" />
                            <h3 className="font-bold text-white/85">Alertas Inteligentes</h3>
                        </div>

                        <div className="space-y-3">
                            {analytics.current_profitability < 50 && (
                                <div className="bg-domu-danger/10 border border-domu-danger/20 rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-domu-danger text-sm">
                                        <ArrowDownRight size={14} />
                                        <span className="font-medium">Rentabilidad Baja</span>
                                    </div>
                                    <p className="text-xs text-white/70 mt-1">
                                        El precio actual puede no cubrir todos los costos operativos.
                                    </p>
                                </div>
                            )}

                            {Math.abs(analytics.suggested_profitability - analytics.current_profitability) > 15 && (
                                <div className="bg-domu-primary/10 border border-domu-primary/20 rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-domu-primary text-sm">
                                        <Target size={14} />
                                        <span className="font-medium">Oportunidad de Optimización</span>
                                    </div>
                                    <p className="text-xs text-white/70 mt-1">
                                        La IA sugiere ajustar a {analytics.suggested_profitability.toFixed(1)}% de rentabilidad.
                                    </p>
                                </div>
                            )}

                            {analytics.market_comparison.price_position === "ABOVE" && (
                                <div className="bg-domu-warning/10 border border-domu-warning/20 rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-domu-warning text-sm">
                                        <ArrowUpRight size={14} />
                                        <span className="font-medium">Precio Premium</span>
                                    </div>
                                    <p className="text-xs text-white/70 mt-1">
                                        Tu precio está por encima del promedio del mercado. Monitorea la demanda.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}