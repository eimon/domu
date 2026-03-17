"use client";

import { useState, useEffect } from "react";
import { Zap, BarChart3, TrendingUp, Settings } from "lucide-react";
import { 
    PricingAnalytics, 
    ProfitabilityProjection, 
    MarketInsights,
    PriceSensitivityAnalysis,
    PricingOptimizationResponse
} from "@/types/pricing_analytics";
import { 
    getPricingAnalytics, 
    getProfitabilityProjections, 
    getMarketInsights,
    getPriceSensitivity 
} from "@/actions/pricing_analytics";
import PricingDashboard from "./PricingDashboard";
import PricingSensitivityChart from "./PricingSensitivityChart";
import PricingOptimizationModal from "./PricingOptimizationModal";
import { useToast } from "@/context/ToastContext";

interface ProfitabilityDashboardPageProps {
    propertyId: string;
    propertyName: string;
}

export default function ProfitabilityDashboardPage({ 
    propertyId, 
    propertyName 
}: ProfitabilityDashboardPageProps) {
    const [analytics, setAnalytics] = useState<PricingAnalytics | null>(null);
    const [projections, setProjections] = useState<ProfitabilityProjection[]>([]);
    const [marketInsights, setMarketInsights] = useState<MarketInsights | null>(null);
    const [sensitivity, setSensitivity] = useState<PriceSensitivityAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOptimizationModalOpen, setIsOptimizationModalOpen] = useState(false);
    
    const { showError, showSuccess } = useToast();

    // Cargar datos iniciales
    useEffect(() => {
        loadData();
    }, [propertyId]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [analyticsData, projectionsData, insightsData, sensitivityData] = await Promise.all([
                getPricingAnalytics(propertyId),
                getProfitabilityProjections(propertyId, 12),
                getMarketInsights(propertyId),
                getPriceSensitivity(propertyId, 20)
            ]);

            setAnalytics(analyticsData);
            setProjections(projectionsData);
            setMarketInsights(insightsData);
            setSensitivity(sensitivityData);
        } catch (error) {
            showError("Error al cargar datos de rentabilidad");
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfitabilityChange = async (newProfitability: number) => {
        // En una implementación completa, aquí actualizaríamos las proyecciones
        // basadas en el nuevo nivel de rentabilidad
        console.log("Profitability changed to:", newProfitability);
        
        // Recargar sensitivity analysis con el nuevo valor
        try {
            const newSensitivity = await getPriceSensitivity(propertyId, 20);
            setSensitivity(newSensitivity);
        } catch (error) {
            console.error("Error updating sensitivity:", error);
        }
    };

    const handleOptimizationResult = (result: PricingOptimizationResponse) => {
        showSuccess(`Optimización completada: ${result.recommended_profitability.toFixed(1)}% rentabilidad recomendada`);
        
        // Actualizar analytics con la nueva recomendación
        if (analytics) {
            setAnalytics({
                ...analytics,
                suggested_profitability: result.recommended_profitability
            });
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <div className="animate-pulse">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-6 h-6 bg-white/10 rounded"></div>
                        <div className="w-64 h-6 bg-white/10 rounded"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-full h-24 bg-white/5 rounded-xl"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="w-full h-80 bg-white/5 rounded-2xl"></div>
                        <div className="w-full h-80 bg-white/5 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="p-6">
                <div className="glass rounded-2xl p-8 text-center">
                    <BarChart3 size={48} className="mx-auto mb-4 text-white/30" />
                    <h2 className="text-lg font-bold text-white/80 mb-2">No hay datos disponibles</h2>
                    <p className="text-white/50 text-sm">No se pudieron cargar los datos de rentabilidad para esta propiedad.</p>
                    <button 
                        onClick={loadData}
                        className="mt-4 px-4 py-2 bg-domu-primary hover:bg-domu-primary/80 text-white rounded-lg text-sm transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-domu-primary/20 rounded-lg">
                        <TrendingUp size={24} className="text-domu-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white/90">Sistema de Rentabilidad</h1>
                        <p className="text-white/50 text-sm">{propertyName}</p>
                    </div>
                </div>
                
                <button
                    onClick={() => setIsOptimizationModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-domu-primary hover:bg-domu-primary/80 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    <Zap size={16} />
                    Optimización IA
                </button>
            </div>

            {/* Dashboard principal */}
            <PricingDashboard
                analytics={analytics}
                projections={projections}
                marketInsights={marketInsights}
                onProfitabilityChange={handleProfitabilityChange}
                isLoading={isLoading}
            />

            {/* Análisis de sensibilidad */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <PricingSensitivityChart 
                        analysis={sensitivity}
                        isLoading={isLoading}
                    />
                </div>
                
                {/* Panel de acciones rápidas */}
                <div className="space-y-4">
                    <div className="glass rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Settings size={20} className="text-domu-primary" />
                            <h3 className="font-bold text-white/85">Acciones Rápidas</h3>
                        </div>
                        
                        <div className="space-y-3">
                            <button
                                onClick={() => setIsOptimizationModalOpen(true)}
                                className="w-full flex items-center gap-3 p-3 glass-elevated rounded-lg hover:bg-white/[0.08] transition-colors text-left"
                            >
                                <Zap size={16} className="text-domu-primary" />
                                <div>
                                    <div className="text-sm font-medium text-white/80">Optimizar Precios</div>
                                    <div className="text-xs text-white/50">Usar IA para optimizar</div>
                                </div>
                            </button>
                            
                            <button
                                onClick={loadData}
                                className="w-full flex items-center gap-3 p-3 glass-elevated rounded-lg hover:bg-white/[0.08] transition-colors text-left"
                            >
                                <BarChart3 size={16} className="text-domu-success" />
                                <div>
                                    <div className="text-sm font-medium text-white/80">Actualizar Datos</div>
                                    <div className="text-xs text-white/50">Recargar análisis</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Alertas inteligentes */}
                    <div className="glass rounded-2xl p-6">
                        <h4 className="font-bold text-white/85 mb-3">Alertas del Sistema</h4>
                        <div className="space-y-2 text-xs">
                            {analytics.current_profitability < 70 && (
                                <div className="bg-domu-danger/10 border border-domu-danger/20 rounded-lg p-2">
                                    <span className="text-domu-danger font-medium">⚠ Rentabilidad Baja</span>
                                    <p className="text-white/70 mt-1">
                                        Considera ajustar costos o aumentar precios
                                    </p>
                                </div>
                            )}
                            
                            {analytics.suggested_profitability > analytics.current_profitability + 15 && (
                                <div className="bg-domu-success/10 border border-domu-success/20 rounded-lg p-2">
                                    <span className="text-domu-success font-medium">📈 Oportunidad</span>
                                    <p className="text-white/70 mt-1">
                                        Puedes aumentar precios según las condiciones del mercado
                                    </p>
                                </div>
                            )}
                            
                            {analytics.market_comparison.price_position === "ABOVE" && (
                                <div className="bg-domu-warning/10 border border-domu-warning/20 rounded-lg p-2">
                                    <span className="text-domu-warning font-medium">🎯 Precio Premium</span>
                                    <p className="text-white/70 mt-1">
                                        Monitorea la demanda de cerca
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de optimización */}
            <PricingOptimizationModal
                propertyId={propertyId}
                isOpen={isOptimizationModalOpen}
                onClose={() => setIsOptimizationModalOpen(false)}
                onOptimizationResult={handleOptimizationResult}
            />
        </div>
    );
}