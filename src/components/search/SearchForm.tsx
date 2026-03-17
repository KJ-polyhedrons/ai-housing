"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSearchStore } from "@/stores/searchStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BasicInfoStep } from "./BasicInfoStep";
import { FreeTextStep } from "./FreeTextStep";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";

export function SearchForm() {
  const router = useRouter();
  const { current_step, setStep, work_location, free_text } = useSearchStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canProceedStep1 = work_location.trim().length > 0;
  const canSubmit = free_text.trim().length > 0;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // analyzing ページへ遷移し、そこでAPI呼び出しを行う
    router.push("/analyzing");
  };

  return (
    <Card className="mx-auto max-w-2xl p-6">
      {/* ステップインジケーター */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          <StepIndicator step={1} current={current_step} label="基本情報" />
          <div className="h-px w-12 bg-gray-300" />
          <StepIndicator step={2} current={current_step} label="自由記述" />
        </div>
      </div>

      {/* フォーム本体 */}
      {current_step === 1 ? <BasicInfoStep /> : <FreeTextStep />}

      {/* ナビゲーションボタン */}
      <div className="mt-8 flex justify-between">
        {current_step === 2 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(1)}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>
        ) : (
          <div />
        )}

        {current_step === 1 ? (
          <Button
            type="button"
            onClick={() => setStep(2)}
            disabled={!canProceedStep1}
            className="gap-1"
          >
            次へ
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="gap-1"
          >
            <Search className="h-4 w-4" />
            {isSubmitting ? "送信中..." : "AIで診断する"}
          </Button>
        )}
      </div>
    </Card>
  );
}

function StepIndicator({
  step,
  current,
  label,
}: {
  step: number;
  current: number;
  label: string;
}) {
  const isActive = step === current;
  const isDone = step < current;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
          isActive
            ? "bg-blue-600 text-white"
            : isDone
              ? "bg-blue-100 text-blue-600"
              : "bg-gray-100 text-gray-400"
        }`}
      >
        {step}
      </div>
      <span
        className={`text-sm ${isActive ? "font-medium text-gray-900" : "text-gray-400"}`}
      >
        {label}
      </span>
    </div>
  );
}
