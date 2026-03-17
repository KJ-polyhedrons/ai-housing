import { Star } from "lucide-react";

interface EnrollmentBadgeProps {
  stars: number; // 1-5
  probability: number; // 0-1
}

const STAR_LABELS = ["", "厳しい", "やや厳しい", "普通", "入りやすい", "とても入りやすい"];

export function EnrollmentBadge({ stars, probability }: EnrollmentBadgeProps) {
  const label = STAR_LABELS[stars] ?? "";
  const pct = Math.round(probability * 100);

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-amber-50 px-3 py-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < stars
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
      <div className="text-sm">
        <span className="font-semibold">{label}</span>
        <span className="ml-2 text-muted-foreground">({pct}%)</span>
      </div>
    </div>
  );
}
