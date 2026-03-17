import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { geocodeAddress, calculateDistanceKm } from "@/lib/geocoding";
import { calculateEnrollmentScore } from "@/lib/scoring/enrollmentScore";
import { DEFAULT_WEIGHTS } from "@/types/scoring";
import type { Property, Nursery, SchoolDistrict } from "@/types/database";
import type { SearchRequest, SearchResponse, PropertyWithRecommendation, ApiError } from "@/types/api";

// 物件周辺の保育園・学区を検索する半径（km）
const NURSERY_RADIUS_KM = 2.0;

export async function POST(
  request: NextRequest
): Promise<NextResponse<SearchResponse | ApiError>> {
  try {
    const body: SearchRequest = await request.json();

    // バリデーション
    if (!body.work_location) {
      return NextResponse.json(
        { error: "勤務地は必須です" },
        { status: 400 }
      );
    }

    // 1. 勤務地をジオコーディング
    const workGeo = await geocodeAddress(body.work_location);
    if (!workGeo) {
      return NextResponse.json(
        { error: "勤務地の住所を解決できませんでした" },
        { status: 400 }
      );
    }

    // 2. 予算内の物件を取得
    const { data: properties, error: propError } = await supabase
      .from("properties")
      .select("*")
      .lte("rent_monthly", body.budget_monthly * 1.2) // 予算の1.2倍まで許容
      .order("rent_monthly", { ascending: true })
      .limit(20);

    if (propError) {
      console.error("[/api/search] Properties query error:", propError);
      return NextResponse.json(
        { error: "物件の検索に失敗しました", details: propError.message },
        { status: 500 }
      );
    }

    if (!properties || properties.length === 0) {
      return NextResponse.json(
        { error: "条件に合う物件が見つかりませんでした" },
        { status: 404 }
      );
    }

    // 3. 全保育園・学区データを取得
    const [nurseryResult, districtResult] = await Promise.all([
      supabase.from("nurseries").select("*"),
      supabase.from("school_districts").select("*"),
    ]);

    const allNurseries: Nursery[] = nurseryResult.data ?? [];
    const allDistricts: SchoolDistrict[] = districtResult.data ?? [];

    // 4. セッションを保存
    const { data: session, error: sessionError } = await supabase
      .from("search_sessions")
      .insert({
        annual_income: body.annual_income,
        family_size: body.family_size,
        work_location: body.work_location,
        max_commute_min: body.max_commute_min,
        budget_monthly: body.budget_monthly,
        move_in_timing: body.move_in_timing,
        free_text: body.free_text,
        ai_analysis: body.ai_analysis ?? null,
      })
      .select("session_id")
      .single();

    if (sessionError) {
      console.error("[/api/search] Session insert error:", sessionError);
    }

    const sessionId = session?.session_id ?? crypto.randomUUID();

    // 5. 各物件のスコアを計算
    const scored = properties.map((prop: Property) => {
      // 物件周辺の保育園を抽出
      const nearbyNurseries = allNurseries
        .map((n) => ({
          ...n,
          distance_km: calculateDistanceKm(prop.lat, prop.lng, n.lat, n.lng),
        }))
        .filter((n) => n.distance_km <= NURSERY_RADIUS_KM)
        .sort((a, b) => a.distance_km - b.distance_km);

      // 最寄りの学区を検索
      const nearestDistrict = findNearestDistrict(prop, allDistricts);

      // 通勤スコア: 勤務地までの直線距離ベース
      const commuteDistKm = calculateDistanceKm(
        prop.lat, prop.lng, workGeo.lat, workGeo.lng
      );
      const commuteScore = calcCommuteScore(commuteDistKm, body.max_commute_min);

      // 家賃スコア: 予算に対する余裕度
      const budgetScore = calcBudgetScore(prop.rent_monthly, body.budget_monthly);

      // 入園可能性スコア
      const enrollment = calculateEnrollmentScore(
        nearbyNurseries,
        body.family_size.children,
        body.move_in_timing
      );
      const nurseryScore = enrollment.score;

      // 学区スコア（簡易: 学区データがあれば60、なければ30）
      const schoolScore = nearestDistrict ? 60 : 30;

      // 総合スコア
      const totalScore = Math.round(
        nurseryScore * DEFAULT_WEIGHTS.nursery +
        commuteScore * DEFAULT_WEIGHTS.commute +
        budgetScore * DEFAULT_WEIGHTS.budget +
        schoolScore * DEFAULT_WEIGHTS.school
      );

      const result: PropertyWithRecommendation = {
        property: prop,
        recommendation: {
          rec_id: crypto.randomUUID(),
          session_id: sessionId,
          property_id: prop.property_id,
          rank: 0, // 後でソート後に設定
          nursery_score: nurseryScore,
          school_score: schoolScore,
          commute_score: commuteScore,
          budget_score: budgetScore,
          total_score: totalScore,
          enrollment_probability: enrollment.probability,
          enrollment_stars: enrollment.stars,
          top_reasons: enrollment.reasons,
          created_at: new Date().toISOString(),
        },
        nurseries: nearbyNurseries.slice(0, 5),
        school_district: nearestDistrict ?? undefined,
      };

      return result;
    });

    // 6. 総合スコア順にソートしてランクを付与
    scored.sort((a, b) => b.recommendation.total_score - a.recommendation.total_score);
    scored.forEach((item, i) => {
      item.recommendation.rank = i + 1;
    });

    // 上位10件を返す
    const topResults = scored.slice(0, 10);

    // 7. AIレコメンドをDBに保存（非同期、エラーは無視）
    saveRecommendations(topResults).catch((err) =>
      console.error("[/api/search] Failed to save recommendations:", err)
    );

    return NextResponse.json({
      session_id: sessionId,
      properties: topResults,
    });
  } catch (error) {
    console.error("[/api/search] Error:", error);
    const message = error instanceof Error ? error.message : "不明なエラー";
    return NextResponse.json(
      { error: "検索処理に失敗しました", details: message },
      { status: 500 }
    );
  }
}

/**
 * 通勤スコア: 直線距離をもとに推定通勤時間を算出し、許容時間と比較
 * 直線距離1km ≒ 実距離1.4km ≒ 電車3分と仮定
 */
function calcCommuteScore(distKm: number, maxCommuteMin: number): number {
  const estimatedMin = distKm * 1.4 * 3;
  if (estimatedMin <= maxCommuteMin * 0.5) return 100;
  if (estimatedMin <= maxCommuteMin * 0.75) return 85;
  if (estimatedMin <= maxCommuteMin) return 70;
  if (estimatedMin <= maxCommuteMin * 1.25) return 45;
  return 20;
}

/**
 * 家賃スコア: 予算に対する余裕度
 */
function calcBudgetScore(rent: number, budget: number): number {
  const ratio = rent / budget;
  if (ratio <= 0.7) return 100;
  if (ratio <= 0.85) return 85;
  if (ratio <= 1.0) return 70;
  if (ratio <= 1.1) return 50;
  return 25;
}

/**
 * 最寄りの学区を検索（直線距離で最も近いもの）
 */
function findNearestDistrict(
  prop: Property,
  districts: SchoolDistrict[]
): SchoolDistrict | null {
  if (districts.length === 0) return null;

  let nearest: SchoolDistrict | null = null;
  let minDist = Infinity;

  for (const d of districts) {
    const dist = calculateDistanceKm(prop.lat, prop.lng, d.lat, d.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = d;
    }
  }

  // 5km以内の学区のみ返す
  return minDist <= 5 ? nearest : null;
}

/**
 * レコメンド結果をDBに保存
 */
async function saveRecommendations(results: PropertyWithRecommendation[]) {
  const rows = results.map((r) => ({
    session_id: r.recommendation.session_id,
    property_id: r.recommendation.property_id,
    rank: r.recommendation.rank,
    nursery_score: r.recommendation.nursery_score,
    school_score: r.recommendation.school_score,
    commute_score: r.recommendation.commute_score,
    budget_score: r.recommendation.budget_score,
    total_score: r.recommendation.total_score,
    enrollment_probability: r.recommendation.enrollment_probability,
    enrollment_stars: r.recommendation.enrollment_stars,
    top_reasons: r.recommendation.top_reasons,
  }));

  const { error } = await supabase.from("ai_recommendations").insert(rows);
  if (error) {
    console.error("[saveRecommendations]", error);
  }
}
