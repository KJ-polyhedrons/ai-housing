// ========================================
// Supabase テーブル型定義
// ========================================

export interface User {
  user_id: string;
  email?: string;
  created_at: string;
}

export interface Child {
  age: number;
}

export interface FamilySize {
  adults: number;
  children: Child[];
}

export interface AiAnalysis {
  urgency: "high" | "medium" | "low";
  urgency_reason: string;
  priorities: Priority[];
  special_needs: string;
}

export type Priority = "nursery" | "commute" | "budget" | "school" | "space";

export interface SearchSession {
  session_id: string;
  user_id?: string;
  annual_income: number;
  family_size: FamilySize;
  work_location: string;
  max_commute_min: number;
  budget_monthly: number;
  move_in_timing: string;
  free_text: string;
  ai_analysis?: AiAnalysis;
  created_at: string;
}

export interface Property {
  property_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rent_monthly: number;
  floor_plan: string;
  area_sqm: number;
  nearest_station: string;
  station_walk_min: number;
  property_type: "rent" | "buy";
  source_url?: string;
  image_url?: string;
  created_at: string;
}

export interface Nursery {
  nursery_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  municipality: string;
  official_url?: string;
  capacity: number;
  vacancy_status: "available" | "none" | "unknown";
  vacancy_updated_at?: string;
  avg_acceptance_rate?: number;
  distance_km?: number;
}

export interface SchoolDistrict {
  district_id: string;
  municipality: string;
  elementary_school: string;
  elementary_school_url?: string;
  junior_high_school: string;
  junior_high_school_url?: string;
  review_url?: string;
  lat: number;
  lng: number;
}

export interface AiRecommendation {
  rec_id: string;
  session_id: string;
  property_id: string;
  rank: number;
  nursery_score: number;
  school_score: number;
  commute_score: number;
  budget_score: number;
  total_score: number;
  enrollment_probability: number;
  enrollment_stars: number;
  top_reasons: string[];
  created_at: string;
}
