import Link from "next/link";
import { Baby, Train, GraduationCap, Search, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: Baby,
    title: "保育園の入園可能性",
    description:
      "周辺の保育園数・空き状況・倍率からAIが入園しやすさを5段階で評価します。",
    color: "text-green-600 bg-green-50",
  },
  {
    icon: Train,
    title: "通勤時間シミュレーション",
    description:
      "勤務地からの距離を分析し、無理のない通勤圏内の物件を優先的に提案します。",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: GraduationCap,
    title: "学区情報の自動取得",
    description:
      "物件ごとに通学区域の小学校・中学校を自動で紐付け、学区も含めて比較できます。",
    color: "text-purple-600 bg-purple-50",
  },
];

const STEPS = [
  { num: 1, text: "家族構成や勤務地などの基本情報を入力" },
  { num: 2, text: "住まいの希望や優先事項を自由記述" },
  { num: 3, text: "AIが総合分析し、最適な物件をランキング表示" },
];

export default function HomePage() {
  return (
    <div>
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-medium text-blue-600">
            子育て世帯のための住まい探しAI
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            保育園・学区・通勤を
            <br />
            <span className="text-blue-600">まるごとAI分析</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            年収・家族構成・勤務地を入力するだけ。
            AIが入園可能性から通勤時間まで総合的に分析し、
            あなたの家族にぴったりの住まいを提案します。
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <Search className="h-5 w-5" />
              無料で診断する
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-blue-600"
            >
              詳しく見る
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section id="features" className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            AIが3つの視点で住まいを評価
          </h2>
          <p className="mt-3 text-center text-gray-600">
            子育て世帯が本当に知りたい情報を、まとめて分析します
          </p>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border bg-white p-6">
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${f.color}`}
                >
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 使い方セクション */}
      <section className="bg-gray-50 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            かんたん3ステップ
          </h2>
          <div className="mt-10 space-y-6">
            {STEPS.map((s) => (
              <div
                key={s.num}
                className="flex items-center gap-4 rounded-xl bg-white p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                  {s.num}
                </div>
                <p className="text-base">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-blue-700"
            >
              さっそく始める
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
