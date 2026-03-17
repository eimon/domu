from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID
from datetime import date

from schemas.pricing_analytics import (
    PricingAnalytics, PricingOptimizationRequest, PricingOptimizationResponse,
    ProfitabilityProjection
)
from services.pricing_analytics_service import PricingAnalyticsService
from core.database import get_db
from dependencies.auth import get_current_user, has_role
from models.user import User as Usuario
from core.roles import Role

router = APIRouter(prefix="/pricing-analytics", tags=["pricing-analytics"])

@router.get("/properties/{property_id}/analytics", response_model=PricingAnalytics)
async def get_pricing_analytics(
    property_id: UUID,
    analysis_date: date = Query(None, description="Fecha para el análisis (default: hoy)"),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Obtener análisis completo de rentabilidad con comparación de mercado.
    Incluye precios de piso, rentabilidad actual, sugerencias de IA y demanda estacional.
    """
    return await PricingAnalyticsService(db).get_pricing_analytics(property_id, analysis_date)

@router.post("/optimize", response_model=PricingOptimizationResponse)
async def optimize_pricing(
    request: PricingOptimizationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(has_role(Role.ROLE_PROPERTY_UPDATE))
):
    """
    Optimización de precios con algoritmos de IA.
    Estrategias disponibles: REVENUE (maximizar ingresos), OCCUPANCY (maximizar ocupación), 
    BALANCED (balanceado).
    """
    return await PricingAnalyticsService(db).optimize_pricing(request)

@router.get("/properties/{property_id}/projections", response_model=List[ProfitabilityProjection])
async def get_profitability_projections(
    property_id: UUID,
    months_ahead: int = Query(12, ge=1, le=24, description="Meses a proyectar"),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Proyecciones de rentabilidad mensual basadas en datos históricos,
    tendencias estacionales y factores económicos.
    """
    return await PricingAnalyticsService(db).get_profitability_projections(property_id, months_ahead)

@router.get("/properties/{property_id}/market-insights")
async def get_market_insights(
    property_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Insights del mercado para toma de decisiones de pricing.
    Incluye análisis competitivo y recomendaciones estratégicas.
    """
    service = PricingAnalyticsService(db)
    analytics = await service.get_pricing_analytics(property_id)
    
    return {
        "market_position": analytics.market_comparison.price_position,
        "competitive_gap": float(analytics.base_price - analytics.market_comparison.avg_market_price),
        "market_opportunity": analytics.suggested_profitability - analytics.current_profitability,
        "seasonal_factor": analytics.seasonal_demand.demand_multiplier,
        "recommendation": "INCREASE" if analytics.suggested_profitability > analytics.current_profitability else "DECREASE",
        "confidence": "HIGH" if abs(analytics.suggested_profitability - analytics.current_profitability) > 10 else "MEDIUM"
    }

@router.get("/properties/{property_id}/price-sensitivity")
async def analyze_price_sensitivity(
    property_id: UUID,
    price_variation: float = Query(20.0, ge=5.0, le=50.0, description="Variación de precio a analizar (%)"),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Análisis de sensibilidad de precios para entender el impacto
    de cambios de precio en ocupación e ingresos.
    """
    service = PricingAnalyticsService(db)
    analytics = await service.get_pricing_analytics(property_id)
    
    scenarios = []
    base_profitability = analytics.current_profitability
    
    # Generar escenarios: -variation, actual, +variation
    for multiplier in [1 - price_variation/100, 1.0, 1 + price_variation/100]:
        scenario_profitability = base_profitability * multiplier
        expected_occupancy = service._calculate_demand_response(scenario_profitability, 65.0)
        
        # Estimación simple de revenue
        price_factor = scenario_profitability / 100.0
        revenue_estimate = float(analytics.base_price) * price_factor * (expected_occupancy / 100.0) * 30
        
        scenarios.append({
            "profitability_percent": round(scenario_profitability, 1),
            "expected_occupancy": expected_occupancy,
            "estimated_monthly_revenue": round(revenue_estimate, 2),
            "scenario_type": "DECREASE" if multiplier < 1 else "CURRENT" if multiplier == 1 else "INCREASE"
        })
    
    return {
        "property_id": property_id,
        "base_price": analytics.base_price,
        "price_scenarios": scenarios,
        "recommendation": "Evaluar escenario de aumento si la demanda es inelástica" if scenarios[2]["estimated_monthly_revenue"] > scenarios[1]["estimated_monthly_revenue"] else "Mantener precio actual o evaluar reducción"
    }