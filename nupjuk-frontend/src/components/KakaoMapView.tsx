import { useEffect, useRef, useState } from "react";
import type { MarkerSummary } from "../types/marker";

interface KakaoMapViewProps {
  markers: MarkerSummary[];
  selectedMarkerId?: string | null;
  onMarkerClick: (marker: MarkerSummary) => void;
}

const KAIST_CENTER = {
  latitude: 36.3709,
  longitude: 127.3652
};

let kakaoMapScriptPromise: Promise<void> | null = null;

function loadKakaoMapScript(): Promise<void> {
  const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;

  if (!appKey) {
    return Promise.reject(
      new Error("VITE_KAKAO_MAP_APP_KEY가 .env에 설정되어 있지 않습니다.")
    );
  }

  if (window.kakao?.maps) {
    return new Promise((resolve) => {
      window.kakao.maps.load(resolve);
    });
  }

  if (kakaoMapScriptPromise) {
    return kakaoMapScriptPromise;
  }

  kakaoMapScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;

    script.onload = () => {
      window.kakao.maps.load(resolve);
    };

    script.onerror = () => {
      reject(new Error("Kakao Map SDK 로드에 실패했습니다."));
    };

    document.head.appendChild(script);
  });

  return kakaoMapScriptPromise;
}

function getSafeMarkerId(marker: MarkerSummary): string {
  return marker.id ?? marker._id ?? `${marker.latitude}-${marker.longitude}`;
}

function makeMarkerContent(marker: MarkerSummary): string {
  return `
    <div style="
      padding: 8px 10px;
      border-radius: 10px;
      background: white;
      border: 1px solid #d1d5db;
      box-shadow: 0 4px 12px rgba(0,0,0,0.14);
      font-size: 13px;
      font-weight: 700;
      color: #111827;
      white-space: nowrap;
    ">
      ${marker.titleKo}
    </div>
  `;
}

export default function KakaoMapView({
  markers,
  selectedMarkerId,
  onMarkerClick
}: KakaoMapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const markerRefs = useRef<KakaoMarker[]>([]);
  const infoWindowRef = useRef<KakaoInfoWindow | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initializeMap() {
      try {
        await loadKakaoMapScript();

        if (cancelled || !containerRef.current || mapRef.current) {
          return;
        }

        const center = new window.kakao.maps.LatLng(
          KAIST_CENTER.latitude,
          KAIST_CENTER.longitude
        );

        mapRef.current = new window.kakao.maps.Map(containerRef.current, {
          center,
          level: 4
        });

        setTimeout(() => {
          mapRef.current?.relayout();
          mapRef.current?.setCenter(center);
        }, 0);
      } catch (error) {
        console.error(error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Kakao Map을 불러오지 못했습니다."
        );
      }
    }

    initializeMap();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !window.kakao?.maps) {
      return;
    }

    markerRefs.current.forEach((marker) => marker.setMap(null));
    markerRefs.current = [];

    infoWindowRef.current?.close();
    infoWindowRef.current = null;

    markers.forEach((marker) => {
      const position = new window.kakao.maps.LatLng(
        marker.latitude,
        marker.longitude
      );

      const kakaoMarker = new window.kakao.maps.Marker({
        map,
        position,
        title: marker.titleKo
      });

      window.kakao.maps.event.addListener(kakaoMarker, "click", () => {
        infoWindowRef.current?.close();

        const infoWindow = new window.kakao.maps.InfoWindow({
          content: makeMarkerContent(marker)
        });

        infoWindow.open(map, kakaoMarker);
        infoWindowRef.current = infoWindow;

        onMarkerClick(marker);
      });

      markerRefs.current.push(kakaoMarker);
    });
  }, [markers, onMarkerClick]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !selectedMarkerId || !window.kakao?.maps) {
      return;
    }

    const selected = markers.find(
      (marker) => getSafeMarkerId(marker) === selectedMarkerId
    );

    if (!selected) {
      return;
    }

    const center = new window.kakao.maps.LatLng(
      selected.latitude,
      selected.longitude
    );

    map.setCenter(center);
  }, [markers, selectedMarkerId]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: "#d1d5db"
      }}
    >
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {errorMessage && (
        <div
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            top: "45%",
            padding: 16,
            borderRadius: 16,
            background: "#ffffff",
            color: "#b91c1c",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            textAlign: "center",
            lineHeight: 1.5
          }}
        >
          <strong>지도 로드 실패</strong>
          <div style={{ marginTop: 6 }}>{errorMessage}</div>
        </div>
      )}
    </div>
  );
}