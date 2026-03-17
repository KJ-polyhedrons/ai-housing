// ========================================
// API リクエスト / レスポンス型定義
// ========================================

import type { AiAnalysis, FamilySize, Property, Nursery, SchoolDistrict, AiRecommendation } from "./database";

// POST /api/analyze
export interface AnalyzeRequest {
  free_text: string;
}

export interface AnalyzeResponse {
  analysis: AiAnalysis;
}

// POST /api/search
export interface SearchRequest {
  annual_income: number;
  family_size: FamilySize;
  work_location: string;
  max_commute_min: number;
  budget_monthly: number;
  move_in_timing: string;
  free_text: string;
  ai_analysis?: AiAnalysis;
}

export interface SearchResponse {
  session_id: string;
  properties: PropertyWithRecommendation[];
}

// POST /api/recommend
export interface RecommendRequest {
  session_id: string;
  properties: Property[];
  ai_analysis: AiAnalysis;
  family_size: FamilySize;
  budget_monthly: number;
  max_commute_min: number;
}

export interface RecommendResponse {
  recommendations: AiRecommendation[];
}

// GET /api/nurseries?lat=...&lng=...&radius=...
export interface NurseriesResponse {
  nurseries: Nursery[];
}

// GET /api/school-district?lat=...&lng=...
export interface SchoolDistrictResponse {
  district: SchoolDistrict | null;
}

// 物件 + AI推薦を合成した表示用型
export interface PropertyWithRecommendation {
  property: Property;
  recommendation: AiRecommendation;
  nurseries: Nursery[];
  school_district?: SchoolDistrict;
}

// API共通エラー
export interface ApiError {
  error: string;
  details?: string;
}
