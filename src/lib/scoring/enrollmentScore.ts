import type { Nursery, Child } from "@/types/database";
import type { EnrollmentScoreResult } from "@/types/scoring";

/**
 * 入園可能性スコアを算出する
 *
 * 計算ステップ（設計書 ⑩ 10.2 準拠）:
 *   Step1: 距離スコア (25%) - 近い保育園が多いほど高得点
 *   Step2: 空き状況スコア (35%) - 空きあり園の割合
 *   Step3: 年齢マッチスコア (25%) - 低年齢ほど競争率が高いことを考慮
 *   Step4: 倍率スコア (15%) - 平均入園率が高い（倍率低い）ほど高得点
 *
 * 星変換: 85以上→5, 65-84→4, 45-64→3, 25-44→2, 〜24→1
 */
export function calculateEnrollmentScore(
  nurseries: Nursery[],
  childAges: Child[],
  _moveTiming: string
): EnrollmentScoreResult {
  if (nurseries.length === 0) {
    return {
      score: 0,
      stars: 1,
      probability: 0,
      reasons: ["周辺に保育園データがありません"],
    };
  }

  // Step1: 距離スコア（25%）
  // 500m圏内の園が多いほど高得点。各園の距離が近いほどウエイトが大きい
  const distanceScore = calcDistanceScore(nurseries);

  // Step2: 空き状況スコア（35%）
  const vacancyScore = calcVacancyScore(nurseries);

  // Step3: 年齢マッチスコア（25%）
  const ageMatchScore = calcAgeMatchScore(nurseries, childAges);

  // Step4: 倍率スコア（15%）
  const acceptanceScore = calcAcceptanceScore(nurseries);

  // 総合スコア
  const score = Math.round(
    distanceScore * 0.25 +
      vacancyScore * 0.35 +
      ageMatchScore * 0.25 +
      acceptanceScore * 0.15
  );

  const clampedScore = Math.max(0, Math.min(100, score));
  const stars = scoreToStars(clampedScore);
  const probability = clampedScore / 100;

  const reasons = generateReasons(
    nurseries,
    distanceScore,
    vacancyScore,
    ageMatchScore,
    acceptanceScore
  );

  return { score: clampedScore, stars, probability, reasons };
}

/**
 * 距離スコア: Σ(1 / (距離km + 0.1)) を正規化して0〜100にする
 * 500m圏内の園に高い得点を与え、500m超はボーナス程度
 */
function calcDistanceScore(nurseries: Nursery[]): number {
  const CLOSE_RANGE_KM = 0.5;
  const closeNurseries = nurseries.filter(
    (n) => (n.distance_km ?? 999) <= CLOSE_RANGE_KM
  );

  // 500m圏内の園数ベースの得点（1園15点、最大45点）
  const countScore = Math.min(closeNurseries.length * 15, 45);

  // 距離の近さによるボーナス（0〜55点）
  let proximitySum = 0;
  for (const n of nurseries) {
    const dist = n.distance_km ?? 999;
    if (dist < 2.0) {
      proximitySum += 1 / (dist + 0.1);
    }
  }
  // 上限を10程度と想定して正規化
  const proximityScore = Math.min((proximitySum / 10) * 55, 55);

  return Math.min(countScore + proximityScore, 100);
}

/**
 * 空き状況スコア: 空きあり園の割合 × 100
 */
function calcVacancyScore(nurseries: Nursery[]): number {
  if (nurseries.length === 0) return 0;
  const available = nurseries.filter(
    (n) => n.vacancy_status === "available"
  ).length;
  return (available / nurseries.length) * 100;
}

/**
 * 年齢マッチスコア: 子供の年齢を考慮
 * 0-1歳は競争率が特に高いため減点、3歳以上は比較的入りやすい
 * 空きあり園が対象年齢に合致しているかを簡易推定
 */
function calcAgeMatchScore(nurseries: Nursery[], childAges: Child[]): number {
  if (childAges.length === 0) return 50;

  const availableNurseries = nurseries.filter(
    (n) => n.vacancy_status === "available"
  );

  // 子供の最小年齢で難易度を判定
  const minAge = Math.min(...childAges.map((c) => c.age));

  // 年齢別の基礎難易度係数（低年齢ほど厳しい）
  const ageFactor =
    minAge <= 0
      ? 0.4
      : minAge <= 1
        ? 0.5
        : minAge <= 2
          ? 0.65
          : minAge <= 3
            ? 0.8
            : 0.9;

  // 空きあり園の割合 × 年齢係数
  const availableRate =
    nurseries.length > 0 ? availableNurseries.length / nurseries.length : 0;

  return availableRate * ageFactor * 100;
}

/**
 * 倍率スコア: 平均入園率が高い（=倍率が低い）ほど高得点
 */
function calcAcceptanceScore(nurseries: Nursery[]): number {
  const withRate = nurseries.filter(
    (n) => n.avg_acceptance_rate != null
  );

  if (withRate.length === 0) return 50; // データなしは中間値

  const avgRate =
    withRate.reduce((sum, n) => sum + (n.avg_acceptance_rate ?? 0), 0) /
    withRate.length;

  // 入園率0.0〜1.0をそのまま0〜100にマップ
  return avgRate * 100;
}

function scoreToStars(score: number): number {
  if (score >= 85) return 5;
  if (score >= 65) return 4;
  if (score >= 45) return 3;
  if (score >= 25) return 2;
  return 1;
}

/**
 * スコアの内訳から日本語の理由を最大3件生成
 */
function generateReasons(
  nurseries: Nursery[],
  distanceScore: number,
  vacancyScore: number,
  _ageMatchScore: number,
  acceptanceScore: number
): string[] {
  const reasons: string[] = [];

  // 距離に関する理由
  const closeCount = nurseries.filter(
    (n) => (n.distance_km ?? 999) <= 0.5
  ).length;
  if (closeCount >= 3) {
    reasons.push(`徒歩圏内（500m以内）に保育園が${closeCount}園あります`);
  } else if (closeCount >= 1) {
    reasons.push(`徒歩圏内（500m以内）に保育園が${closeCount}園あります`);
  } else if (distanceScore < 30) {
    reasons.push("近隣に保育園が少ないエリアです");
  }

  // 空き状況に関する理由
  const availableCount = nurseries.filter(
    (n) => n.vacancy_status === "available"
  ).length;
  if (vacancyScore >= 50) {
    reasons.push(`空きのある保育園が${availableCount}園あります`);
  } else if (availableCount > 0) {
    reasons.push(`空きのある保育園は${availableCount}園と限られています`);
  } else {
    reasons.push("現在、空きのある保育園がありません");
  }

  // 倍率に関する理由
  if (acceptanceScore >= 70) {
    reasons.push("周辺の入園倍率は比較的低く、入りやすい傾向です");
  } else if (acceptanceScore <= 30 && acceptanceScore !== 50) {
    reasons.push("周辺の入園倍率が高く、競争が激しいエリアです");
  }

  return reasons.slice(0, 3);
}
