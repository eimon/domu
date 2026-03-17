import calendar
import uuid
from datetime import date, timedelta
from decimal import Decimal
from typing import List
import random
from math import sin, pi

from sqlalchemy.ext.asyncio import AsyncSession

from repositories.property_repository import PropertyRepository
from repositories.cost_repository import CostRepository
from repositories.property_base_price_repository import PropertyBasePriceRepository
from repositories.pricing_rule_repository import PricingRuleRepository
from repositories.booking_repository import BookingRepository
from services.pricing_service import PricingService
from schemas.pricing_analytics import (
    PricingAnalytics, MarketComparison, DemandSeasonality,
    PricingOptimizationRequest, PricingOptimizationResponse,
    ProfitabilityProjection
)
from exceptions.general import NotFoundException


class PricingAnalyticsService:
    """Enhanced pricing analytics with market comparison and optimization algorithms"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.property_repo = PropertyRepository(db)
        self.cost_repo = CostRepository(db)
        self.base_price_repo = PropertyBasePriceRepository(db)
        self.pricing_repo = PricingRuleRepository(db)
        self.booking_repo = BookingRepository(db)
        self.pricing_service = PricingService(db)

    async def get_pricing_analytics(self, property_id: uuid.UUID, analysis_date: date = None) -> PricingAnalytics:
        """Get comprehensive pricing analytics for a property"""
        if analysis_date is None:
            analysis_date = date.today()
            
        prop = await self.property_repo.get_by_id(property_id)
        if not prop:
            raise NotFoundException("Propiedad no encontrada")

        # Get current costs and floor price
        all_costs = await self.cost_repo.get_costs_overlapping(property_id, analysis_date, analysis_date)
        day_costs = self.pricing_service._costs_for_date(all_costs, analysis_date)
        floor_price = self.pricing_service._calculate_floor_price(day_costs, prop.avg_stay_days)

        # Get current profitability
        rules = await self.pricing_repo.get_active_rules_for_date(property_id, analysis_date)
        current_profitability = float(rules[0].profitability_percent if rules else Decimal(100))

        # Mock market comparison (in production, integrate with external APIs)
        market_comparison = self._generate_market_comparison(prop.base_price, analysis_date)
        
        # Seasonal demand analysis
        seasonal_demand = self._analyze_seasonal_demand(analysis_date)
        
        # AI-suggested profitability based on market conditions
        suggested_profitability = self._calculate_suggested_profitability(
            current_profitability, market_comparison, seasonal_demand
        )

        return PricingAnalytics(
            property_id=property_id,
            base_price=prop.base_price,
            floor_price=floor_price,
            current_profitability=current_profitability,
            suggested_profitability=suggested_profitability,
            market_comparison=market_comparison,
            seasonal_demand=seasonal_demand
        )

    async def optimize_pricing(
        self, 
        request: PricingOptimizationRequest
    ) -> PricingOptimizationResponse:
        """AI-powered pricing optimization algorithm"""
        prop = await self.property_repo.get_by_id(request.property_id)
        if not prop:
            raise NotFoundException("Propiedad no encontrada")

        # Current performance analysis
        current_projection = await self._calculate_revenue_projection(
            request.property_id, request.date_range_start, request.date_range_end
        )

        # Optimization algorithm based on priority
        if request.priority == "REVENUE":
            recommended_profitability = await self._optimize_for_revenue(
                request.property_id, request.date_range_start, request.date_range_end
            )
        elif request.priority == "OCCUPANCY":
            recommended_profitability = await self._optimize_for_occupancy(
                request.property_id, request.target_occupancy, 
                request.date_range_start, request.date_range_end
            )
        else:  # BALANCED
            recommended_profitability = await self._optimize_balanced(
                request.property_id, request.target_occupancy,
                request.date_range_start, request.date_range_end
            )

        # Calculate optimized projection
        optimized_projection = await self._calculate_optimized_revenue(
            request.property_id, recommended_profitability,
            request.date_range_start, request.date_range_end
        )

        # Expected occupancy with new pricing
        expected_occupancy = self._calculate_demand_response(
            recommended_profitability, request.target_occupancy
        )

        # Confidence score based on historical data quality
        confidence_score = self._calculate_confidence_score(request.property_id)

        # Generate actionable recommendations
        recommendations = self._generate_recommendations(
            recommended_profitability, expected_occupancy, request.priority
        )

        return PricingOptimizationResponse(
            current_revenue_projection=current_projection,
            optimized_revenue_projection=optimized_projection,
            recommended_profitability=recommended_profitability,
            expected_occupancy=expected_occupancy,
            confidence_score=confidence_score,
            recommendations=recommendations
        )

    async def get_profitability_projections(
        self, 
        property_id: uuid.UUID, 
        months_ahead: int = 12
    ) -> List[ProfitabilityProjection]:
        """Generate monthly profitability projections"""
        prop = await self.property_repo.get_by_id(property_id)
        if not prop:
            raise NotFoundException("Propiedad no encontrada")

        projections = []
        current_date = date.today()
        
        for i in range(months_ahead):
            target_month = current_date.month + i
            target_year = current_date.year + (target_month - 1) // 12
            target_month = ((target_month - 1) % 12) + 1

            # Get historical data for the same month in previous years
            historical_performance = await self._get_historical_performance(
                property_id, target_month
            )

            # Seasonal adjustment
            seasonal_multiplier = self._get_seasonal_multiplier(target_month)

            # Economic trends simulation
            economic_factor = self._get_economic_trend_factor(target_year)

            projected_occupancy = historical_performance['occupancy'] * seasonal_multiplier * economic_factor
            projected_revenue = historical_performance['revenue'] * seasonal_multiplier * economic_factor
            projected_costs = historical_performance['costs'] * (1.02 ** i)  # 2% monthly cost inflation

            projected_profit = projected_revenue - projected_costs

            # Confidence based on data quality and time horizon
            confidence_level = "HIGH" if i < 3 else "MEDIUM" if i < 6 else "LOW"

            projections.append(ProfitabilityProjection(
                month=target_month,
                year=target_year,
                projected_revenue=round(projected_revenue, 2),
                projected_costs=round(projected_costs, 2),
                projected_profit=round(projected_profit, 2),
                projected_occupancy=min(100, round(projected_occupancy, 1)),
                confidence_level=confidence_level
            ))

        return projections

    # Private helper methods
    def _generate_market_comparison(self, base_price: Decimal, analysis_date: date) -> MarketComparison:
        """Generate mock market comparison data"""
        # Simulate market data (in production, integrate with Airbnb/Booking APIs)
        seasonal_factor = 1 + 0.3 * sin(2 * pi * analysis_date.timetuple().tm_yday / 365)
        avg_market_price = float(base_price) * seasonal_factor * random.uniform(0.85, 1.15)
        
        price_ratio = float(base_price) / avg_market_price
        
        if price_ratio < 0.9:
            position = "BELOW"
        elif price_ratio > 1.1:
            position = "ABOVE"
        else:
            position = "AT"

        return MarketComparison(
            avg_market_price=Decimal(str(round(avg_market_price, 2))),
            market_occupancy_rate=round(65 + 15 * seasonal_factor, 1),
            competitor_count=random.randint(8, 25),
            price_position=position
        )

    def _analyze_seasonal_demand(self, analysis_date: date) -> DemandSeasonality:
        """Analyze seasonal demand patterns"""
        month = analysis_date.month
        
        # Define seasonal patterns for Argentina (Southern Hemisphere)
        if month in [12, 1, 2]:  # Summer
            return DemandSeasonality(
                season_name="Verano",
                demand_multiplier=1.8,
                historical_occupancy=85.0
            )
        elif month in [6, 7]:  # Winter vacation
            return DemandSeasonality(
                season_name="Vacaciones de Invierno",
                demand_multiplier=1.4,
                historical_occupancy=70.0
            )
        elif month in [3, 11]:  # Shoulder seasons
            return DemandSeasonality(
                season_name="Temporada Media",
                demand_multiplier=1.1,
                historical_occupancy=60.0
            )
        else:  # Low season
            return DemandSeasonality(
                season_name="Temporada Baja",
                demand_multiplier=0.8,
                historical_occupancy=45.0
            )

    def _calculate_suggested_profitability(
        self, 
        current_profitability: float,
        market_comparison: MarketComparison,
        seasonal_demand: DemandSeasonality
    ) -> float:
        """AI algorithm to suggest optimal profitability"""
        base_suggestion = 100.0  # Start with base price
        
        # Market position adjustment
        if market_comparison.price_position == "BELOW":
            base_suggestion += 15.0  # Can increase prices
        elif market_comparison.price_position == "ABOVE":
            base_suggestion -= 10.0  # Should decrease prices
            
        # Seasonal demand adjustment
        base_suggestion *= seasonal_demand.demand_multiplier
        
        # Market occupancy adjustment
        if market_comparison.market_occupancy_rate > 70:
            base_suggestion += 5.0  # High demand
        elif market_comparison.market_occupancy_rate < 50:
            base_suggestion -= 10.0  # Low demand
            
        # Ensure reasonable bounds
        return max(50.0, min(200.0, round(base_suggestion, 1)))

    async def _optimize_for_revenue(
        self, property_id: uuid.UUID, start_date: date, end_date: date
    ) -> float:
        """Revenue maximization algorithm"""
        # Revenue = Price × Occupancy
        # Use price elasticity modeling
        optimal_profitability = 120.0  # Start with premium pricing
        
        # Simulate demand response curve
        # Higher prices = lower occupancy but higher revenue per booking
        market_demand = await self._get_market_demand_factor(property_id, start_date)
        
        if market_demand > 0.8:  # High demand period
            optimal_profitability = 140.0
        elif market_demand < 0.5:  # Low demand period
            optimal_profitability = 90.0
            
        return round(optimal_profitability, 1)

    async def _optimize_for_occupancy(
        self, property_id: uuid.UUID, target_occupancy: float,
        start_date: date, end_date: date
    ) -> float:
        """Occupancy maximization algorithm"""
        # Lower prices to achieve target occupancy
        base_profitability = 100.0
        
        if target_occupancy > 80:  # Very high target
            return 70.0  # Aggressive pricing
        elif target_occupancy > 60:  # Medium target
            return 85.0  # Moderate pricing
        else:  # Conservative target
            return 95.0  # Near base pricing
            
    async def _optimize_balanced(
        self, property_id: uuid.UUID, target_occupancy: float,
        start_date: date, end_date: date
    ) -> float:
        """Balanced revenue/occupancy optimization"""
        # Find sweet spot between revenue and occupancy
        revenue_optimal = await self._optimize_for_revenue(property_id, start_date, end_date)
        occupancy_optimal = await self._optimize_for_occupancy(property_id, target_occupancy, start_date, end_date)
        
        # Weighted average favoring revenue slightly
        balanced = (revenue_optimal * 0.6) + (occupancy_optimal * 0.4)
        return round(balanced, 1)

    async def _calculate_revenue_projection(
        self, property_id: uuid.UUID, start_date: date, end_date: date
    ) -> Decimal:
        """Calculate current revenue projection for date range"""
        total_days = (end_date - start_date).days
        calendar_data = await self.pricing_service.get_calendar(property_id, start_date, end_date)
        
        # Simulate occupancy based on pricing
        total_revenue = Decimal(0)
        for day_data in calendar_data:
            # Simple occupancy model based on price competitiveness
            day_price = day_data['price']
            occupancy_probability = max(0.2, min(0.9, 1.0 - (day_price / 200)))  # Simplified model
            expected_revenue = day_price * occupancy_probability
            total_revenue += expected_revenue
            
        return round(total_revenue, 2)

    async def _calculate_optimized_revenue(
        self, property_id: uuid.UUID, new_profitability: float,
        start_date: date, end_date: date
    ) -> Decimal:
        """Calculate revenue projection with new profitability"""
        # This would simulate the calendar with new profitability
        # For now, return a simple calculation
        current_revenue = await self._calculate_revenue_projection(property_id, start_date, end_date)
        profitability_factor = new_profitability / 100.0
        return round(current_revenue * profitability_factor * 0.95, 2)  # Account for demand elasticity

    def _calculate_demand_response(self, profitability: float, target_occupancy: float) -> float:
        """Calculate expected occupancy based on profitability"""
        # Price elasticity model
        base_occupancy = 65.0  # Baseline market occupancy
        price_elasticity = -0.3  # 1% price increase = 0.3% occupancy decrease
        
        profitability_impact = (profitability - 100) * price_elasticity
        expected_occupancy = base_occupancy + profitability_impact
        
        return max(20.0, min(95.0, round(expected_occupancy, 1)))

    def _calculate_confidence_score(self, property_id: uuid.UUID) -> float:
        """Calculate confidence score based on data quality"""
        # Mock implementation - in production, analyze historical data quality
        return round(random.uniform(0.7, 0.95), 2)

    def _generate_recommendations(
        self, profitability: float, occupancy: float, priority: str
    ) -> List[str]:
        """Generate actionable pricing recommendations"""
        recommendations = []
        
        if profitability > 120:
            recommendations.append("Precio premium detectado. Monitorear competencia y demanda.")
        elif profitability < 80:
            recommendations.append("Precio agresivo. Evaluar si los costos están cubiertos.")
            
        if occupancy > 85:
            recommendations.append("Alta ocupación proyectada. Considerar aumentar precios en fechas pico.")
        elif occupancy < 50:
            recommendations.append("Baja ocupación proyectada. Evaluar promociones o descuentos.")
            
        if priority == "REVENUE":
            recommendations.append("Enfoque en maximizar ingresos. Ajustar precios según demanda estacional.")
        elif priority == "OCCUPANCY":
            recommendations.append("Enfoque en ocupación. Mantener precios competitivos.")
            
        return recommendations

    async def _get_market_demand_factor(self, property_id: uuid.UUID, target_date: date) -> float:
        """Get market demand factor for specific date"""
        # Mock implementation - analyze historical booking patterns
        return random.uniform(0.3, 1.0)

    async def _get_historical_performance(self, property_id: uuid.UUID, month: int) -> dict:
        """Get historical performance data for the same month in previous years"""
        # Mock implementation - in production, analyze actual historical data
        seasonal_base = {
            1: {'revenue': 45000, 'costs': 18000, 'occupancy': 85},  # January (summer)
            2: {'revenue': 40000, 'costs': 16000, 'occupancy': 80},  # February
            3: {'revenue': 25000, 'costs': 15000, 'occupancy': 60},  # March (shoulder)
            4: {'revenue': 18000, 'costs': 14000, 'occupancy': 45},  # April (low)
            5: {'revenue': 20000, 'costs': 14500, 'occupancy': 50},  # May
            6: {'revenue': 22000, 'costs': 15000, 'occupancy': 55},  # June
            7: {'revenue': 35000, 'costs': 17000, 'occupancy': 70},  # July (winter vacation)
            8: {'revenue': 20000, 'costs': 14500, 'occupancy': 50},  # August
            9: {'revenue': 22000, 'costs': 15000, 'occupancy': 55},  # September
            10: {'revenue': 25000, 'costs': 15500, 'occupancy': 60}, # October
            11: {'revenue': 28000, 'costs': 16000, 'occupancy': 65}, # November (shoulder)
            12: {'revenue': 50000, 'costs': 20000, 'occupancy': 90}  # December (summer peak)
        }
        return seasonal_base.get(month, {'revenue': 20000, 'costs': 15000, 'occupancy': 50})

    def _get_seasonal_multiplier(self, month: int) -> float:
        """Get seasonal demand multiplier for specific month"""
        seasonal_multipliers = {
            1: 1.4, 2: 1.3, 3: 1.0, 4: 0.8, 5: 0.9, 6: 1.0,
            7: 1.2, 8: 0.9, 9: 1.0, 10: 1.1, 11: 1.15, 12: 1.5
        }
        return seasonal_multipliers.get(month, 1.0)

    def _get_economic_trend_factor(self, year: int) -> float:
        """Get economic trend factor for inflation and market growth"""
        # Mock implementation - in production, integrate with economic indicators
        current_year = date.today().year
        years_ahead = year - current_year
        
        # Assume 2% annual growth with some volatility
        base_growth = 1.02 ** years_ahead
        volatility = random.uniform(0.95, 1.05)
        return base_growth * volatility