import { NextRequest, NextResponse } from "next/server";
import { askClaude } from "@/lib/claude";
import {
  ANALYZE_SYSTEM_PROMPT,
  ANALYZE_USER_TEMPLATE,
} from "@/lib/prompts/analyzePrompt";
import type { AiAnalysis, Priority } from "@/types/database";
import type { AnalyzeResponse, ApiError } from "@/types/api";

const VALID_PRIORITIES: Priority[] = [
  "nursery",
  "commute",
  "budget",
  "school",
  "space",
];

export async function POST(
  request: NextRequest
): Promise<NextResponse<AnalyzeResponse | ApiError>> {
  try {
    const body = await request.json();
    const freeText: string | undefined = body.free_text;

    // バリデーション
    if (!freeText || freeText.trim().length === 0) {
      return NextResponse.json(
        { error: "free_text は必須です" },
        { status: 400 }
      );
    }

    if (freeText.length > 2000) {
      return NextResponse.json(
        { error: "free_text は2000文字以内にしてください" },
        { status: 400 }
      );
    }

    // Claude API 呼び出し
    const raw = await askClaude(
      ANALYZE_SYSTEM_PROMPT,
      ANALYZE_USER_TEMPLATE(freeText)
    );

    // JSONパース（コードブロックで囲まれている場合も対応）
    const jsonStr = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    // レスポンスの検証・正規化
    const analysis: AiAnalysis = {
      urgency: validateUrgency(parsed.urgency),
      urgency_reason: String(parsed.urgency_reason || ""),
      priorities: validatePriorities(parsed.priorities),
      special_needs: String(parsed.special_needs || ""),
    };

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("[/api/analyze] Error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "AI応答のパースに失敗しました", details: "JSONパースエラー" },
        { status: 502 }
      );
    }

    const message =
      error instanceof Error ? error.message : "不明なエラーが発生しました";
    return NextResponse.json(
      { error: "分析処理に失敗しました", details: message },
      { status: 500 }
    );
  }
}

function validateUrgency(value: unknown): AiAnalysis["urgency"] {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }
  return "medium";
}

function validatePriorities(value: unknown): Priority[] {
  if (!Array.isArray(value)) return ["nursery"];
  return value
    .filter((v): v is Priority => VALID_PRIORITIES.includes(v as Priority))
    .slice(0, 5);
}
