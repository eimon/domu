export enum BookingStatus {
    CONFIRMED = "CONFIRMED",
    TENTATIVE = "TENTATIVE",
    CANCELLED = "CANCELLED",
}

export enum BookingSource {
    AIRBNB = "AIRBNB",
    BOOKING = "BOOKING",
    DOMU = "DOMU",
    MANUAL = "MANUAL",
}

export enum DocumentType {
    DU = "DU",
    EXTRANJERO = "EXTRANJERO",
}

export enum UserRole {
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    OWNER = "OWNER",
}

export enum CostCategory {
    RECURRING_MONTHLY = "RECURRING_MONTHLY",
    RECURRING_DAILY = "RECURRING_DAILY",
    PER_RESERVATION = "PER_RESERVATION",
}

export enum CostCalculationType {
    FIXED_AMOUNT = "FIXED_AMOUNT",
    PERCENTAGE = "PERCENTAGE",
}

export interface Cost {
    id: string; // uuid
    property_id: string; // uuid
    name: string;
    category: string | CostCategory;
    calculation_type: string | CostCalculationType;
    value: number;
    created_at?: string;
    updated_at?: string;
}

export interface PricingRule {
    id: string; // uuid
    property_id: string; // uuid
    name: string;
    start_date: string; // YYYY-MM-DD
    end_date: string; // YYYY-MM-DD
    profitability_percent: number;
    priority: number;
    created_at?: string;
    updated_at?: string;
}

export interface CalendarDay {
    date: string; // YYYY-MM-DD
    price: number;
    status: "AVAILABLE" | "RESERVED";
    rule_name?: string;
    floor_price: number;
    profitability_percent: number;
}

export interface FinancialSummary {
    year: number;
    month: number;
    days_in_month: number;
    occupied_days: number;
    occupancy_rate: number;
    total_bookings: number;
    total_income: number;
    costs: {
        fixed_monthly: number;
        fixed_daily: number;
        variable_per_reservation: number;
        commissions: number;
        total: number;
    };
    net_profit: number;
    profit_margin_percent: number;
}

export interface User {
    id: string; // uuid
    username: string;
    email: string;
    full_name: string;
    role: string | UserRole;
    is_active: boolean;
    created_at: string; // datetime
}

export interface Property {
    id: string; // uuid
    name: string;
    address: string;
    description?: string;
    manager_id: string; // uuid
    owner_id?: string; // uuid
    base_price: number; // NEW: Precio bruto por noche
    avg_stay_days: number; // NEW: Días promedio de estadía
    created_at: string; // datetime
    updated_at: string; // datetime
    is_active: boolean;
}

export interface Guest {
    id: string; // uuid
    full_name: string;
    email: string;
    phone?: string;
    document_type: string | DocumentType;
    document_number: string;
    created_at: string; // datetime
}

export interface Booking {
    id: string; // uuid
    ical_uid?: string;
    property_id: string; // uuid
    guest_id: string; // uuid
    check_in: string; // date YYYY-MM-DD
    check_out: string; // date YYYY-MM-DD
    summary: string;
    description?: string;
    status: string | BookingStatus;
    source: string | BookingSource;
    external_id?: string;
    ical_url?: string;
    last_synced_at?: string; // datetime
    created_at: string; // datetime
    updated_at: string; // datetime
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}
