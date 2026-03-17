"use client";

import { useSearchStore } from "@/stores/searchStore";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChildAgeInput } from "./ChildAgeInput";

const COMMUTE_OPTIONS = [
  { value: 30, label: "30分以内" },
  { value: 45, label: "45分以内" },
  { value: 60, label: "60分以内" },
  { value: 90, label: "90分以内" },
];

export function BasicInfoStep() {
  const {
    annual_income,
    family_size,
    work_location,
    max_commute_min,
    budget_monthly,
    move_in_timing,
    setBasicInfo,
  } = useSearchStore();

  return (
    <div className="space-y-6">
      {/* 年収スライダー */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>世帯年収</Label>
          <span className="text-sm font-semibold text-blue-600">
            {annual_income}万円
          </span>
        </div>
        <Slider
          value={[annual_income]}
          onValueChange={(value) => {
            const v = Array.isArray(value) ? value[0] : value;
            setBasicInfo({ annual_income: v });
          }}
          min={300}
          max={1500}
          step={50}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>300万円</span>
          <span>1500万円</span>
        </div>
      </div>

      {/* 大人の人数 */}
      <div className="space-y-2">
        <Label>大人の人数</Label>
        <select
          value={family_size.adults}
          onChange={(e) =>
            setBasicInfo({
              family_size: { ...family_size, adults: Number(e.target.value) },
            })
          }
          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value={1}>1人</option>
          <option value={2}>2人</option>
        </select>
      </div>

      {/* 子供の年齢 */}
      <ChildAgeInput />

      {/* 勤務地 */}
      <div className="space-y-2">
        <Label htmlFor="work_location">勤務地（住所または駅名）</Label>
        <Input
          id="work_location"
          placeholder="例: 東京駅、渋谷区神宮前1-1-1"
          value={work_location}
          onChange={(e) => setBasicInfo({ work_location: e.target.value })}
        />
      </div>

      {/* 通勤許容時間 */}
      <div className="space-y-2">
        <Label>通勤許容時間</Label>
        <select
          value={max_commute_min}
          onChange={(e) =>
            setBasicInfo({ max_commute_min: Number(e.target.value) })
          }
          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {COMMUTE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* 月額予算 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>月額家賃予算</Label>
          <span className="text-sm font-semibold text-blue-600">
            {(budget_monthly / 10000).toFixed(0)}万円
          </span>
        </div>
        <Slider
          value={[budget_monthly]}
          onValueChange={(value) => {
            const v = Array.isArray(value) ? value[0] : value;
            setBasicInfo({ budget_monthly: v });
          }}
          min={50000}
          max={400000}
          step={10000}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>5万円</span>
          <span>40万円</span>
        </div>
      </div>

      {/* 希望入居時期 */}
      <div className="space-y-2">
        <Label htmlFor="move_in_timing">希望入居時期</Label>
        <Input
          id="move_in_timing"
          type="month"
          value={move_in_timing}
          onChange={(e) => setBasicInfo({ move_in_timing: e.target.value })}
        />
      </div>
    </div>
  );
}
