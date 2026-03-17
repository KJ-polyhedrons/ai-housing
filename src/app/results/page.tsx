"use client";

import { useSearchStore } from "@/stores/searchStore";
import { PropertyCard } from "@/components/results/PropertyCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { PropertyWithRecommendation } from "@/types/api";

// 開発用ダミーデータ（API未接続時に表示確認用）
const DUMMY_RESULTS: PropertyWithRecommendation[] = [
  {
    property: {
      property_id: "1",
      name: "サンライズ南浦和",
      address: "さいたま市南区南浦和2-10-5",
      lat: 35.8456,
      lng: 139.6636,
      rent_monthly: 135000,
      floor_plan: "2LDK",
      area_sqm: 58,
      nearest_station: "南浦和駅",
      station_walk_min: 5,
      property_type: "rent",
      created_at: "",
    },
    recommendation: {
      rec_id: "r1",
      session_id: "s1",
      property_id: "1",
      rank: 1,
      nursery_score: 82,
      school_score: 75,
      commute_score: 90,
      budget_score: 70,
      total_score: 81,
      enrollment_probability: 0.72,
      enrollment_stars: 4,
      top_reasons: [
        "徒歩圏内に保育園が3園あり入園しやすい",
        "都心への通勤が30分以内",
        "南浦和小学校は評判の良い学区です",
      ],
      created_at: "",
    },
    nurseries: [
      {
        nursery_id: "n1",
        name: "南浦和さくら保育園",
        address: "さいたま市南区南浦和3-1-1",
        lat: 35.846,
        lng: 139.664,
        municipality: "さいたま市南区",
        capacity: 80,
        vacancy_status: "available",
        avg_acceptance_rate: 0.35,
        distance_km: 0.3,
      },
    ],
    school_district: {
      district_id: "d1",
      municipality: "さいたま市南区",
      elementary_school: "南浦和小学校",
      junior_high_school: "南浦和中学校",
      lat: 35.844,
      lng: 139.662,
    },
  },
  {
    property: {
      property_id: "2",
      name: "グリーンハイツ戸田",
      address: "戸田市新曽3-5-12",
      lat: 35.819,
      lng: 139.671,
      rent_monthly: 115000,
      floor_plan: "3DK",
      area_sqm: 62,
      nearest_station: "戸田駅",
      station_walk_min: 8,
      property_type: "rent",
      created_at: "",
    },
    recommendation: {
      rec_id: "r2",
      session_id: "s1",
      property_id: "2",
      rank: 2,
      nursery_score: 65,
      school_score: 70,
      commute_score: 75,
      budget_score: 88,
      total_score: 74,
      enrollment_probability: 0.55,
      enrollment_stars: 3,
      top_reasons: [
        "家賃が予算内で余裕あり",
        "3DKで子育て世帯向きの間取り",
        "周辺に公園が多い住環境",
      ],
      created_at: "",
    },
    nurseries: [
      {
        nursery_id: "n2",
        name: "戸田あおぞら保育園",
        address: "戸田市新曽2-1-1",
        lat: 35.82,
        lng: 139.672,
        municipality: "戸田市",
        capacity: 70,
        vacancy_status: "unknown",
        avg_acceptance_rate: 0.28,
        distance_km: 0.5,
      },
    ],
    school_district: {
      district_id: "d2",
      municipality: "戸田市",
      elementary_school: "新曽小学校",
      junior_high_school: "新曽中学校",
      lat: 35.819,
      lng: 139.671,
    },
  },
  {
    property: {
      property_id: "3",
      name: "リバーサイド川口",
      address: "川口市栄町3-8-1",
      lat: 35.8065,
      lng: 139.7195,
      rent_monthly: 125000,
      floor_plan: "2LDK",
      area_sqm: 55,
      nearest_station: "川口駅",
      station_walk_min: 10,
      property_type: "rent",
      created_at: "",
    },
    recommendation: {
      rec_id: "r3",
      session_id: "s1",
      property_id: "3",
      rank: 3,
      nursery_score: 58,
      school_score: 68,
      commute_score: 85,
      budget_score: 75,
      total_score: 71,
      enrollment_probability: 0.45,
      enrollment_stars: 3,
      top_reasons: [
        "京浜東北線で都心へのアクセスが良好",
        "再開発エリアで住環境が向上中",
      ],
      created_at: "",
    },
    nurseries: [],
    school_district: {
      district_id: "d3",
      municipality: "川口市",
      elementary_school: "幸町小学校",
      junior_high_school: "幸並中学校",
      lat: 35.807,
      lng: 139.72,
    },
  },
];

const URGENCY_STYLE = {
  high: { label: "緊急度：高", className: "bg-red-100 text-red-700 border-red-200" },
  medium: { label: "緊急度：中", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  low: { label: "緊急度：低", className: "bg-green-100 text-green-700 border-green-200" },
};

export default function ResultsPage() {
  const { results, ai_analysis } = useSearchStore();

  // ストアに結果がなければダミーデータを使用（開発時）
  const displayResults = results.length > 0 ? results : DUMMY_RESULTS;
  const isDummy = results.length === 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">検索結果</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {displayResults.length}件の物件が見つかりました
          </p>
        </div>
        <Link href="/search">
          <Button variant="outline" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            条件を変更
          </Button>
        </Link>
      </div>

      {/* 開発用ダミーデータ表示 */}
      {isDummy && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          開発用のサンプルデータを表示しています
        </div>
      )}

      {/* AI分析結果サマリー */}
      {ai_analysis && (
        <div className="mb-6 rounded-lg border bg-gray-50 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className={URGENCY_STYLE[ai_analysis.urgency].className}>
              {URGENCY_STYLE[ai_analysis.urgency].label}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {ai_analysis.urgency_reason}
            </span>
          </div>
          {ai_analysis.priorities.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {ai_analysis.priorities.map((p) => (
                <Badge key={p} variant="outline">
                  {p === "nursery" && "保育園重視"}
                  {p === "commute" && "通勤重視"}
                  {p === "budget" && "家賃重視"}
                  {p === "school" && "学区重視"}
                  {p === "space" && "広さ重視"}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 物件一覧 */}
      <div className="space-y-4">
        {displayResults.map((item) => (
          <PropertyCard key={item.property.property_id} data={item} />
        ))}
      </div>

      {/* フッター */}
      {displayResults.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            ※ スコアはAI分析に基づく参考値です。最新の空き状況は各施設にお問い合わせください。
          </p>
        </div>
      )}
    </div>
  );
}
