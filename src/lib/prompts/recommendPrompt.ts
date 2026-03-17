import type { Property, AiAnalysis } from "@/types/database";

export const RECOMMEND_SYSTEM_PROMPT = `あなたは子育て世帯向けの不動産コンシェルジュAIです。
物件情報とスコアをもとに、その物件をおすすめする理由ベスト3を日本語で生成してください。
必ず以下のJSON形式のみで返答してください。他のテキストは一切含めないでください。

{
  "reasons": ["理由1", "理由2", "理由3"]
}

各理由は1〜2文で簡潔に、子育て家庭の視点で記述してください。`;

export const RECOMMEND_USER_TEMPLATE = (
  property: Property,
  scores: {
    nursery_score: number;
    commute_score: number;
    budget_score: number;
    school_score: number;
    enrollment_probability: number;
  },
  analysis: AiAnalysis
) =>
  `以下の物件について、おすすめ理由ベスト3を生成してください。

【物件情報】
- 物件名: ${property.name}
- 間取り: ${property.floor_plan}
- 賃料: ${property.rent_monthly.toLocaleString()}円/月
- 最寄り駅: ${property.nearest_station}（徒歩${property.station_walk_min}分）
- 面積: ${property.area_sqm}㎡

【スコア】
- 保育園スコア: ${scores.nursery_score}/100
- 通勤スコア: ${scores.commute_score}/100
- 予算スコア: ${scores.budget_score}/100
- 学区スコア: ${scores.school_score}/100
- 入園可能性: ${(scores.enrollment_probability * 100).toFixed(0)}%

【ユーザーの優先条件】
- 緊急度: ${analysis.urgency}（${analysis.urgency_reason}）
- 優先順位: ${analysis.priorities.join(" > ")}
${analysis.special_needs ? `- 特記事項: ${analysis.special_needs}` : ""}`;
