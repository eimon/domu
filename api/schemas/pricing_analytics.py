from pydantic import BaseModel, UUID4, Field
from datetime import date
from decimal import Decimal
from typing import Optional, List


class MarketComparison(BaseModel):
    """Mock market data for comparison"""
    avg_market_price: Decimal
    market_occupancy_rate: float
    competitor_count: int
    price_position: str  # "BELOW", "AT", "ABOVE"


class DemandSeasonality(BaseModel):
    """Seasonal demand analytics"""
    season_name: str
    demand_multiplier: float = Field(..., ge=0.1, le=5.0)
    historical_occupancy: float = Field(..., ge=0, le=100)


class PricingAnalytics(BaseModel):
    """Enhanced pricing analytics response"""
    property_id: UUID4
    base_price: Decimal
    floor_price: Decimal
    current_profitability: float
    suggested_profitability: float
    market_comparison: MarketComparison
    seasonal_demand: DemandSeasonality


class PricingOptimizationRequest(BaseModel):
    """Request for pricing optimization"""
    property_id: UUID4
    target_occupancy: float = Field(..., ge=0, le=100)
    priority: str = Field(..., regex="^(REVENUE|OCCUPANCY|BALANCED)$")
    date_range_start: date
    date_range_end: date


class PricingOptimizationResponse(BaseModel):
    """Optimized pricing recommendations"""
    current_revenue_projection: Decimal
    optimized_revenue_projection: Decimal
    recommended_profitability: float
    expected_occupancy: float
    confidence_score: float = Field(..., ge=0, le=1.0)
    recommendations: List[str]


class ProfitabilityProjection(BaseModel):
    """Monthly/annual profitability projections"""
    month: int
    year: int
    projected_revenue: Decimal
    projected_costs: Decimal
    projected_profit: Decimal
    projected_occupancy: float
    confidence_level: str  # "HIGH", "MEDIUM", "LOW"