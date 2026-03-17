"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchStore } from "@/stores/searchStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import type { AnalyzeResponse, ApiError } from "@/types/api";

type Phase = "analyzing" | "searching" | "done" | "error";

const PHASE_LABELS: Record<Phase, string> = {
  analyzing: "AIが自由記述を分析中...",
  searching: "条件に合う物件を検索中...",
  done: "完了しました！",
  error: "エラーが発生しました",
};

const TIPS = [
  "保育園の入園可能性もAIが自動判定します",
  "通勤時間は最寄り駅からの乗車時間を基に計算します",
  "学区情報は最新の自治体データを参照しています",
  "入園倍率は過去の実績データから推定しています",
];

export default function AnalyzingPage() {
  const router = useRouter();
  const store = useSearchStore();
  const hasStarted = useRef(false);

  const [phase, setPhase] = useState<Phase>("analyzing");
  const [error, setError] = useState<string>("");
  const [tipIndex, setTipIndex] = useState(0);

  // Tips切り替え
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // メイン処理
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const run = async () => {
      try {
        // Step 1: AI分析
        setPhase("analyzing");

        const analyzeRes = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ free_text: store.free_text }),
        });

        if (!analyzeRes.ok) {
          const err: ApiError = await analyzeRes.json();
          throw new Error(err.error || "分析に失敗しました");
        }

        const { analysis }: AnalyzeResponse = await analyzeRes.json();
        store.setAiAnalysis(analysis);

        // Step 2: 物件検索（API未実装の場合はスキップ）
        setPhase("searching");

        try {
          const searchRes = await fetch("/api/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              annual_income: store.annual_income,
              family_size: store.family_size,
              work_location: store.work_location,
              max_commute_min: store.max_commute_min,
              budget_monthly: store.budget_monthly,
              move_in_timing: store.move_in_timing,
              free_text: store.free_text,
              ai_analysis: analysis,
            }),
          });

          if (searchRes.ok) {
            const searchData = await searchRes.json();
            store.setResults(searchData.session_id, searchData.properties);
          }
        } catch {
          // /api/search が未実装でも results ページへ進む（ダミーデータ表示）
          console.warn("/api/search is not available yet, proceeding with dummy data");
        }

        // 完了 → 結果ページへ
        setPhase("done");
        await new Promise((r) => setTimeout(r, 500));
        router.push("/results");
      } catch (err) {
        console.error("[analyzing]", err);
        setPhase("error");
        setError(err instanceof Error ? err.message : "不明なエラー");
      }
    };

    run();
  }, [router, store]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-4">
      <Card className="w-full p-8 text-center">
        {/* アイコン */}
        <div className="mb-6 flex justify-center">
          {phase === "error" ? (
            <AlertCircle className="h-16 w-16 text-red-500" />
          ) : phase === "done" ? (
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          ) : (
            <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
          )}
        </div>

        {/* フェーズラベル */}
        <h2 className="text-xl font-bold">{PHASE_LABELS[phase]}</h2>

        {/* プログレスステップ */}
        {phase !== "error" && (
          <div className="mt-6 flex justify-center gap-8">
            <StepDot
              label="AI分析"
              active={phase === "analyzing"}
              done={phase === "searching" || phase === "done"}
            />
            <StepDot
              label="物件検索"
              active={phase === "searching"}
              done={phase === "done"}
            />
          </div>
        )}

        {/* Tips */}
        {(phase === "analyzing" || phase === "searching") && (
          <p className="mt-8 text-sm text-muted-foreground transition-opacity">
            💡 {TIPS[tipIndex]}
          </p>
        )}

        {/* エラー表示 */}
        {phase === "error" && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-red-600">{error}</p>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/search")}
                className="gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                条件入力に戻る
              </Button>
              <Button
                onClick={() => {
                  hasStarted.current = false;
                  setPhase("analyzing");
                  setError("");
                  router.refresh();
                }}
              >
                再試行
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function StepDot({
  label,
  active,
  done,
}: {
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`h-3 w-3 rounded-full transition-colors ${
          done
            ? "bg-green-500"
            : active
              ? "bg-blue-500 animate-pulse"
              : "bg-gray-200"
        }`}
      />
      <span
        className={`text-xs ${
          done
            ? "font-medium text-green-600"
            : active
              ? "font-medium text-blue-600"
              : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
