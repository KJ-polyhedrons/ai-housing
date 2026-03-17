"use client";

import { useSearchStore } from "@/stores/searchStore";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

const AGE_OPTIONS = [0, 1, 2, 3, 4, 5, 6];

export function ChildAgeInput() {
  const { family_size, addChild, removeChild, updateChildAge } =
    useSearchStore();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">お子様の年齢</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addChild}
          className="gap-1"
        >
          <Plus className="h-3 w-3" />
          追加
        </Button>
      </div>

      {family_size.children.length === 0 && (
        <p className="text-sm text-muted-foreground">
          お子様を追加してください
        </p>
      )}

      <div className="space-y-2">
        {family_size.children.map((child, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground w-16 shrink-0">
              {index + 1}人目
            </span>
            <select
              value={child.age}
              onChange={(e) => updateChildAge(index, Number(e.target.value))}
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {AGE_OPTIONS.map((age) => (
                <option key={age} value={age}>
                  {age}歳
                </option>
              ))}
            </select>
            {family_size.children.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeChild(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
