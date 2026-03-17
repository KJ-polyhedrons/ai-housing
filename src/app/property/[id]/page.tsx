"use client";

import { useParams, useRouter } from "next/navigation";
import { useSearchStore } from "@/stores/searchStore";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreBar } from "@/components/results/ScoreBar";
import { EnrollmentBadge } from "@/components/results/EnrollmentBadge";
import {
  ArrowLeft,
  MapPin,
  Train,
  Home,
  Ruler,
  Baby,
  GraduationCap,
  ExternalLink,
  Star,
} from "lucide-react";
import type { PropertyWithRecommendation } from "@/types/api";

// 開発用ダミーデータ
const DUMMY: PropertyWithRecommendation = {
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
    {
      nursery_id: "n2",
      name: "南浦和ひまわり保育園",
      address: "さいたま市南区南浦和1-5-3",
      lat: 35.845,
      lng: 139.665,
      municipality: "さいたま市南区",
      capacity: 60,
      vacancy_status: "none",
      avg_acceptance_rate: 0.28,
      distance_km: 0.5,
    },
    {
      nursery_id: "n3",
      name: "わかば保育園",
      address: "さいたま市南区文蔵2-3",
      lat: 35.843,
      lng: 139.662,
      municipality: "さいたま市南区",
      capacity: 50,
      vacancy_status: "unknown",
      avg_acceptance_rate: 0.42,
      distance_km: 0.8,
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
};

const VACANCY_LABEL: Record<string, { text: string; className: string }> = {
  available: { text: "空きあり", className: "bg-green-100 text-green-700" },
  none: { text: "空きなし", className: "bg-red-100 text-red-700" },
  unknown: { text: "不明", className: "bg-gray-100 text-gray-600" },
};

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { results } = useSearchStore();

  const id = params.id as string;

  // ストアから物件を検索、なければダミーデータ
  const data = results.find((r) => r.property.property_id === id) ?? DUMMY;
  const { property, recommendation, nurseries, school_district } = data;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* 戻るボタン */}
      <Button
        variant="outline"
        className="mb-6 gap-1"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        検索結果に戻る
      </Button>

      {/* 物件ヘッダー */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <Badge className="mb-2 bg-blue-600 text-white">
              #{recommendation.rank} おすすめ
            </Badge>
            <h1 className="text-2xl font-bold">{property.name}</h1>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">
              {(property.rent_monthly / 10000).toFixed(1)}
              <span className="text-base font-normal">万円/月</span>
            </p>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {property.address}
          </span>
          <span className="flex items-center gap-1">
            <Train className="h-4 w-4" />
            {property.nearest_station} 徒歩{property.station_walk_min}分
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* 左カラム: メイン情報 */}
        <div className="space-y-6 md:col-span-2">
          {/* 物件画像 */}
          <Card className="overflow-hidden">
            <div className="flex h-64 items-center justify-center bg-gray-100">
              {property.image_url ? (
                <img
                  src={property.image_url}
                  alt={property.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Home className="mx-auto h-16 w-16" />
                  <p className="mt-2 text-sm">画像準備中</p>
                </div>
              )}
            </div>
          </Card>

          {/* 物件スペック */}
          <Card className="p-5">
            <h2 className="mb-4 text-lg font-semibold">物件情報</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <SpecItem icon={Home} label="間取り" value={property.floor_plan} />
              <SpecItem icon={Ruler} label="面積" value={`${property.area_sqm}m²`} />
              <SpecItem icon={Train} label="最寄り駅" value={`${property.nearest_station} 徒歩${property.station_walk_min}分`} />
              <SpecItem icon={MapPin} label="種別" value={property.property_type === "rent" ? "賃貸" : "購入"} />
            </div>
            {property.source_url && (
              <a
                href={property.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                物件ページを見る
              </a>
            )}
          </Card>

          {/* 周辺の保育園 */}
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Baby className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold">周辺の保育園</h2>
              <span className="text-sm text-muted-foreground">
                （半径2km以内 {nurseries.length}園）
              </span>
            </div>

            {nurseries.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                周辺に保育園データがありません
              </p>
            ) : (
              <div className="space-y-3">
                {nurseries.map((n) => (
                  <div
                    key={n.nursery_id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{n.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {n.address} ・ 定員{n.capacity}名 ・{" "}
                        {n.distance_km != null
                          ? `${(n.distance_km * 1000).toFixed(0)}m`
                          : "距離不明"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {n.avg_acceptance_rate != null && (
                        <span className="text-xs text-muted-foreground">
                          入園率 {(n.avg_acceptance_rate * 100).toFixed(0)}%
                        </span>
                      )}
                      <Badge
                        className={
                          VACANCY_LABEL[n.vacancy_status]?.className ?? ""
                        }
                      >
                        {VACANCY_LABEL[n.vacancy_status]?.text ?? "不明"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 学区情報 */}
          {school_district && (
            <Card className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-semibold">学区情報</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">小学校</p>
                  <p className="mt-1 font-medium">
                    {school_district.elementary_school}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {school_district.municipality}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">中学校</p>
                  <p className="mt-1 font-medium">
                    {school_district.junior_high_school}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {school_district.municipality}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* 右カラム: スコアサイドバー */}
        <div className="space-y-6">
          {/* 総合スコア */}
          <Card className="p-5 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              総合スコア
            </p>
            <p className="mt-1 text-4xl font-bold text-blue-600">
              {recommendation.total_score}
              <span className="text-lg font-normal text-muted-foreground">
                /100
              </span>
            </p>
          </Card>

          {/* 入園可能性 */}
          <Card className="p-5">
            <p className="mb-3 text-sm font-medium">入園可能性</p>
            <EnrollmentBadge
              stars={recommendation.enrollment_stars}
              probability={recommendation.enrollment_probability}
            />
          </Card>

          {/* スコア内訳 */}
          <Card className="p-5">
            <p className="mb-4 text-sm font-medium">スコア内訳</p>
            <div className="space-y-3">
              <ScoreBar
                label="保育園"
                score={recommendation.nursery_score}
                color="green"
              />
              <ScoreBar
                label="通勤"
                score={recommendation.commute_score}
                color="blue"
              />
              <ScoreBar
                label="学区"
                score={recommendation.school_score}
                color="purple"
              />
              <ScoreBar
                label="家賃"
                score={recommendation.budget_score}
                color="orange"
              />
            </div>
          </Card>

          {/* AIおすすめ理由 */}
          {recommendation.top_reasons.length > 0 && (
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-medium">AIおすすめ理由</p>
              </div>
              <ul className="space-y-2">
                {recommendation.top_reasons.map((reason, i) => (
                  <li
                    key={i}
                    className="text-sm leading-relaxed text-muted-foreground"
                  >
                    • {reason}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>

      {/* 注意書き */}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        ※ スコアはAI分析に基づく参考値です。最新の空き状況は各施設にお問い合わせください。
      </p>
    </div>
  );
}

function SpecItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="text-center">
      <Icon className="mx-auto h-5 w-5 text-muted-foreground" />
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}
