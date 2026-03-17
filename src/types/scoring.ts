// ========================================
// スコア計算関連の型定義
// ========================================

import type { Nursery, Child } from "./database";

// 各スコアの計算結果
export interface ScoreResult {
  score: number; // 0〜100
  details: string;
}

// 入園可能性スコア
export interface EnrollmentScoreResult {
  score: number;
  stars: number; // 1〜5
  probability: number; // 0.0〜1.0
  reasons: string[];
}

// 入園可能性スコア計算の入力
export interface EnrollmentScoreInput {
  nurseries: Nursery[];
  child_ages: Child[];
  move_timing: string;
}

// 総合スコアの重み付け
export interface ScoreWeights {
  nursery: number; // デフォルト 0.40
  commute: number; // デフォルト 0.25
  budget: number;  // デフォルト 0.25
  school: number;  // デフォルト 0.10
}

// 総合スコア計算結果
export interface TotalScoreResult {
  total_score: number;
  nursery_score: number;
  commute_score: number;
  budget_score: number;
  school_score: number;
  weights: ScoreWeights;
}

// デフォルトの重み
export const DEFAULT_WEIGHTS: ScoreWeights = {
  nursery: 0.40,
  commute: 0.25,
  budget: 0.25,
  school: 0.10,
};
