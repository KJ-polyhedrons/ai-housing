import { create } from "zustand";
import type { FamilySize, AiAnalysis, Child } from "@/types/database";
import type { PropertyWithRecommendation } from "@/types/api";

interface SearchState {
  // Step 1: 基本情報
  annual_income: number;
  family_size: FamilySize;
  work_location: string;
  max_commute_min: number;
  budget_monthly: number;
  move_in_timing: string;

  // Step 2: 自由記述
  free_text: string;

  // AI分析結果
  ai_analysis: AiAnalysis | null;

  // 検索結果
  session_id: string | null;
  results: PropertyWithRecommendation[];

  // ステップ管理
  current_step: 1 | 2;

  // Actions
  setBasicInfo: (info: Partial<SearchState>) => void;
  setFreeText: (text: string) => void;
  setAiAnalysis: (analysis: AiAnalysis) => void;
  setResults: (sessionId: string, results: PropertyWithRecommendation[]) => void;
  addChild: () => void;
  removeChild: (index: number) => void;
  updateChildAge: (index: number, age: number) => void;
  setStep: (step: 1 | 2) => void;
  reset: () => void;
}

const initialState = {
  annual_income: 500,
  family_size: { adults: 2, children: [{ age: 3 }] as Child[] },
  work_location: "",
  max_commute_min: 45,
  budget_monthly: 150000,
  move_in_timing: "",
  free_text: "",
  ai_analysis: null,
  session_id: null,
  results: [],
  current_step: 1 as const,
};

export const useSearchStore = create<SearchState>((set) => ({
  ...initialState,

  setBasicInfo: (info) => set((state) => ({ ...state, ...info })),

  setFreeText: (text) => set({ free_text: text }),

  setAiAnalysis: (analysis) => set({ ai_analysis: analysis }),

  setResults: (sessionId, results) =>
    set({ session_id: sessionId, results }),

  addChild: () =>
    set((state) => ({
      family_size: {
        ...state.family_size,
        children: [...state.family_size.children, { age: 0 }],
      },
    })),

  removeChild: (index) =>
    set((state) => ({
      family_size: {
        ...state.family_size,
        children: state.family_size.children.filter((_, i) => i !== index),
      },
    })),

  updateChildAge: (index, age) =>
    set((state) => ({
      family_size: {
        ...state.family_size,
        children: state.family_size.children.map((child, i) =>
          i === index ? { age } : child
        ),
      },
    })),

  setStep: (step) => set({ current_step: step }),

  reset: () => set(initialState),
}));
