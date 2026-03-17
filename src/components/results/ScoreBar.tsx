interface ScoreBarProps {
  label: string;
  score: number; // 0-100
  color?: string;
}

const COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  orange: "bg-orange-500",
  purple: "bg-purple-500",
  red: "bg-red-500",
};

export function ScoreBar({ label, score, color = "blue" }: ScoreBarProps) {
  const bgClass = COLOR_MAP[color] ?? "bg-blue-500";
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{clamped}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className={`h-2 rounded-full ${bgClass} transition-all`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
