"use client";

import { useSearchStore } from "@/stores/searchStore";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function FreeTextStep() {
  const { free_text, setFreeText } = useSearchStore();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="free_text">
          住宅探しについて、自由にお書きください
        </Label>
        <p className="text-sm text-muted-foreground">
          AIがあなたの状況を分析し、緊急度や優先条件を自動判定します。
        </p>
      </div>

      <Textarea
        id="free_text"
        value={free_text}
        onChange={(e) => setFreeText(e.target.value)}
        placeholder={`例:\n・来年4月の入園に間に合わせたい\n・駅近より保育園が近いほうがいい\n・夫婦とも都心勤務で通勤時間を短くしたい\n・子供がもう一人増える予定`}
        rows={6}
        className="resize-none"
      />

      <p className="text-xs text-muted-foreground">
        ※ 入力内容はAI分析にのみ使用されます。
      </p>
    </div>
  );
}
