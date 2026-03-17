"use client";

import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { useState, useCallback } from "react";
import type { Property, Nursery, SchoolDistrict } from "@/types/database";

interface PropertyMapProps {
  property: Property;
  nurseries: Nursery[];
  schoolDistrict?: SchoolDistrict;
}

const MAP_CONTAINER = { width: "100%", height: "100%" };

export function PropertyMap({ property, nurseries, schoolDistrict }: PropertyMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const [activeNursery, setActiveNursery] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const center = { lat: property.lat, lng: property.lng };

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);

    // 全マーカーが収まるように bounds を調整
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(center);
    nurseries.forEach((n) => bounds.extend({ lat: n.lat, lng: n.lng }));
    if (schoolDistrict) {
      bounds.extend({ lat: schoolDistrict.lat, lng: schoolDistrict.lng });
    }
    map.fitBounds(bounds, 60);

    // ズームしすぎ防止
    const listener = google.maps.event.addListenerOnce(map, "idle", () => {
      const z = map.getZoom();
      if (z && z > 16) map.setZoom(16);
    });
  }, [center, nurseries, schoolDistrict]);

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        地図の読み込みに失敗しました
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        地図を読み込み中...
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER}
      center={center}
      zoom={15}
      onLoad={onLoad}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      }}
    >
      {/* 物件マーカー（赤） */}
      <Marker
        position={center}
        icon={{
          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        }}
        title={property.name}
        zIndex={10}
      />

      {/* 保育園マーカー（緑） */}
      {nurseries.map((n) => (
        <Marker
          key={n.nursery_id}
          position={{ lat: n.lat, lng: n.lng }}
          icon={{
            url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
          }}
          title={n.name}
          onClick={() => setActiveNursery(n.nursery_id)}
        />
      ))}

      {/* 学区マーカー（紫） */}
      {schoolDistrict && (
        <Marker
          position={{ lat: schoolDistrict.lat, lng: schoolDistrict.lng }}
          icon={{
            url: "https://maps.google.com/mapfiles/ms/icons/purple-dot.png",
          }}
          title={schoolDistrict.elementary_school}
        />
      )}

      {/* 保育園 InfoWindow */}
      {activeNursery && (() => {
        const n = nurseries.find((x) => x.nursery_id === activeNursery);
        if (!n) return null;
        return (
          <InfoWindow
            position={{ lat: n.lat, lng: n.lng }}
            onCloseClick={() => setActiveNursery(null)}
          >
            <div className="max-w-[200px] text-xs">
              <p className="font-bold">{n.name}</p>
              <p className="mt-1 text-gray-600">{n.address}</p>
              <p className="mt-1">
                定員 {n.capacity}名
                {n.distance_km != null && ` / ${(n.distance_km * 1000).toFixed(0)}m`}
              </p>
              <p className="mt-0.5">
                {n.vacancy_status === "available"
                  ? "空きあり"
                  : n.vacancy_status === "none"
                    ? "空きなし"
                    : "空き状況不明"}
              </p>
            </div>
          </InfoWindow>
        );
      })()}
    </GoogleMap>
  );
}
