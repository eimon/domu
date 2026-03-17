"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Target, DollarSign } from "lucide-react";
import { PricingAnalytics } from "@/types/pricing_analytics";
import { formatPrice } from "@/lib/utils";

interface ProfitabilitySliderProps {
    analytics: PricingAnalytics;
    onProfitabilityChange: (profitability: number) => void;
    isLoading?: boolean;
}

export default function ProfitabilitySlider({
    analytics,
    onProfitabilityChange,
    isLoading = false
}: ProfitabilitySliderProps) {
    const [profitability, setProfitability] = useState(analytics.current_profitability);
    const [calculatedPrice, setCalculatedPrice] = useState(analytics.base_price);

    // Calcular precio basado en rentabilidad
    useEffect(() => {
        const margin = analytics.base_price - analytics.floor_price;
        const newPrice = analytics.floor_price + (margin * (profitability / 100));
        setCalculatedPrice(Math.max(analytics.floor_price, newPrice));
    }, [profitability, analytics.base_price, analytics.floor_price]);

    // Debounced callback para cambios
    useEffect(() => {
        const timer = setTimeout(() => {
            onProfitabilityChange(profitability);
        }, 300);

        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profitability]);

    const getProfitabilityColor = (value: number) => {
        if (value < 70) return "text-domu-danger";
        if (value < 100) return "text-domu-warning";
        if (value < 120) return "text-domu-success";
        return "text-domu-primary";
    };

    const getProfitabilityLabel = (value: number) => {
        if (value < 70) return "Precio Agresivo";
        if (value < 100) return "Por Debajo del Mercado";
        if (value < 120) return "Precio Competitivo";
        if (value < 150) return "Precio Premium";
        return "Precio Exclusivo";
    };

    const getSliderBackground = () => {
        const percentage = Math.min(100, Math.max(0, (profitability - 50) / 1.5));
        return `linear-gradient(90deg, 
            #f87171 0%, 
            #fbbf24 25%, 
            #34d399 50%, 
            #818cf8 75%, 
            #a855f7 100%)`;
    };

    return (
        <div className="glass rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white/85 flex items-center gap-2">
                        <Target size={20} className="text-domu-primary" />
                        Control de Rentabilidad
                    </h3>
                    <p className="text-sm text-white/50">Ajusta la rentabilidad para ver el impacto en el precio</p>
                </div>
                <div className="text-right">
                    <div className={`text-2xl font-bold ${getProfitabilityColor(profitability)}`}>
                        {profitability.toFixed(1)}%
                    </div>
                    <div className="text-xs text-white/40">{getProfitabilityLabel(profitability)}</div>
                </div>
            </div>

            {/* Slider */}
            <div className="space-y-4">
                <div className="relative">
                    <input
                        type="range"
                        min="0"
                        max="200"
                        step="5"
                        value={profitability}
                        onChange={(e) => setProfitability(Number(e.target.value))}
                        disabled={isLoading}
                        className="w-full h-3 rounded-full appearance-none cursor-pointer disabled:opacity-50 slider-custom"
                        style={{
                            background: getSliderBackground()
                        }}
                    />
                    
                    {/* Marcadores en el slider */}
                    <div className="flex justify-between text-xs text-white/30 mt-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                        <span>150%</span>
                        <span>200%</span>
                    </div>
                </div>

                {/* Indicadores de referencia */}
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-domu-danger/70">
                        <div className="w-2 h-2 bg-domu-danger rounded-full"></div>
                        <span>Piso: {analytics.floor_price.toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-1 text-domu-success/70">
                        <div className="w-2 h-2 bg-domu-success rounded-full"></div>
                        <span>Base: 100%</span>
                    </div>
                    <div className="flex items-center gap-1 text-domu-primary/70">
                        <div className="w-2 h-2 bg-domu-primary rounded-full"></div>
                        <span>IA: {analytics.suggested_profitability.toFixed(0)}%</span>
                    </div>
                </div>
            </div>

            {/* Precio calculado */}
            <div className="glass-elevated rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <DollarSign size={18} className="text-domu-primary" />
                        <span className="text-white/70">Precio Calculado</span>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-bold text-white/90">
                            {formatPrice(calculatedPrice)}
                        </div>
                        <div className="text-xs text-white/40">por noche</div>
                    </div>
                </div>
                
                {/* Comparación con precio actual */}
                <div className="flex items-center gap-2 mt-2 text-sm">
                    {calculatedPrice > analytics.base_price ? (
                        <>
                            <TrendingUp size={14} className="text-domu-success" />
                            <span className="text-domu-success">
                                +{formatPrice(calculatedPrice - analytics.base_price)} vs. precio base
                            </span>
                        </>
                    ) : calculatedPrice < analytics.base_price ? (
                        <>
                            <TrendingDown size={14} className="text-domu-warning" />
                            <span className="text-domu-warning">
                                -{formatPrice(analytics.base_price - calculatedPrice)} vs. precio base
                            </span>
                        </>
                    ) : (
                        <span className="text-white/50">Igual al precio base</span>
                    )}
                </div>
            </div>

            {/* Sugerencia de IA */}
            {Math.abs(profitability - analytics.suggested_profitability) > 10 && (
                <div className="bg-domu-primary/10 border border-domu-primary/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-domu-primary text-sm">
                        <Target size={14} />
                        <span className="font-medium">Sugerencia de IA:</span>
                    </div>
                    <p className="text-xs text-white/70 mt-1">
                        La IA recomienda {analytics.suggested_profitability.toFixed(1)}% de rentabilidad 
                        basada en condiciones del mercado y demanda estacional.
                    </p>
                </div>
            )}
        </div>
    );
}