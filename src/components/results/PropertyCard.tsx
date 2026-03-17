"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreBar } from "./ScoreBar";
import { EnrollmentBadge } from "./EnrollmentBadge";
import { MapPin, Train, Home, Ruler } from "lucide-react";
import type { PropertyWithRecommendation } from "@/types/api";

interface PropertyCardProps {
  data: PropertyWithRecommendation;
}

export function PropertyCard({ data }: PropertyCardProps) {
  const { property, recommendation, nurseries, school_district } = data;

  return (
    <Link href={`/property/${property.property_id}`}>
    <Card className="overflow-hidden transition-shadow hover:shadow-lg cursor-pointer">
      <div className="flex flex-col md:flex-row">
        {/* 左: 物件画像 */}
        <div className="relative h-48 w-full bg-gray-100 md:h-auto md:w-64 shrink-0">
          {property.image_url ? (
            <img
              src={property.image_url}
              alt={property.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Home className="h-12 w-12" />
            </div>
          )}
          {/* ランクバッジ */}
          <Badge className="absolute left-2 top-2 bg-blue-600 text-white">
            #{recommendation.rank}
          </Badge>
        </div>

        {/* 右: 詳細 */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* ヘッダー */}
          <div>
            <h3 className="text-lg font-bold">{property.name}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {property.address}
              </span>
              <span className="flex items-center gap-1">
                <Train className="h-3.5 w-3.5" />
                {property.nearest_station} 徒歩{property.station_walk_min}分
              </span>
            </div>
          </div>

          {/* 物件スペック */}
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="font-semibold text-blue-600">
              {(property.rent_monthly / 10000).toFixed(1)}万円/月
            </span>
            <span className="flex items-center gap-1">
              <Home className="h-3.5 w-3.5 text-muted-foreground" />
              {property.floor_plan}
            </span>
            <span className="flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
              {property.area_sqm}m²
            </span>
          </div>

          {/* 入園可能性 */}
          <EnrollmentBadge
            stars={recommendation.enrollment_stars}
            probability={recommendation.enrollment_probability}
          />

          {/* スコアバー */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <ScoreBar label="保育園" score={recommendation.nursery_score} color="green" />
            <ScoreBar label="通勤" score={recommendation.commute_score} color="blue" />
            <ScoreBar label="学区" score={recommendation.school_score} color="purple" />
            <ScoreBar label="家賃" score={recommendation.budget_score} color="orange" />
          </div>

          {/* 総合スコア */}
          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-sm font-medium">総合スコア</span>
            <span className="text-xl font-bold text-blue-600">
              {recommendation.total_score}
              <span className="text-sm font-normal text-muted-foreground">/100</span>
            </span>
          </div>

          {/* AI推薦理由 */}
          {recommendation.top_reasons.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">AIおすすめ理由</p>
              <ul className="space-y-0.5">
                {recommendation.top_reasons.map((reason, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    • {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 周辺情報 */}
          <div className="flex flex-wrap gap-2 text-xs">
            {nurseries.length > 0 && (
              <Badge variant="outline">
                保育園 {nurseries.length}園
              </Badge>
            )}
            {school_district && (
              <Badge variant="outline">
                {school_district.elementary_school}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
    </Link>
  );
}
