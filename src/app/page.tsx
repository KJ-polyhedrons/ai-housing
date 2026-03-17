import Link from "next/link";

const linkStyle =
  "inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-base font-medium px-8 py-3 transition-colors hover:bg-primary/80";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        子育て世帯のための
        <br />
        <span className="text-blue-600">AI住宅コンシェルジュ</span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
        保育園の入園可能性・学区・通勤時間を
        AIが総合分析し、あなたの家族に最適な住まいを提案します。
      </p>
      <div className="mt-10">
        <Link
          href="/search"
          className={linkStyle}
        >
          無料で診断する
        </Link>
      </div>
    </div>
  );
}
