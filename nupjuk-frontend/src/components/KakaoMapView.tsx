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

  if (window.kakao?.maps?.LatLng) {
    return Promise.resolve();
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
      window.kakao.maps.load(() => {
        if (!window.kakao?.maps?.LatLng) {
          kakaoMapScriptPromise = null;
          reject(
            new Error(
              "Kakao Map SDK 인증 실패: JavaScript 키와 도메인 등록을 확인하세요. " +
                "(https://developers.kakao.com → 앱 설정 → 플랫폼 → Web)"
            )
          );
          return;
        }
        resolve();
      });
    };

    script.onerror = () => {
      kakaoMapScriptPromise = null;
      reject(new Error("Kakao Map SDK 로드에 실패했습니다. 네트워크를 확인하세요."));
    };

    document.head.appendChild(script);
  });

  return kakaoMapScriptPromise;
}

function getSafeMarkerId(marker: MarkerSummary): string {
  return marker.id ?? marker._id ?? `${marker.latitude}-${marker.longitude}`;
}

function makeOverlayContent(marker: MarkerSummary): string {
  return `
    <div style="
      position: relative;
      transform: translateY(-8px);
      padding: 8px 12px;
      border-radius: 12px;
      background: #ffffff;
      border: 1px solid #d1d5db;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
      color: #111827;
      font-size: 13px;
      font-weight: 800;
      line-height: 1.3;
      white-space: nowrap;
      pointer-events: none;
    ">
      ${marker.titleKo}
      <div style="
        position: absolute;
        left: 50%;
        bottom: -7px;
        width: 12px;
        height: 12px;
        background: #ffffff;
        border-right: 1px solid #d1d5db;
        border-bottom: 1px solid #d1d5db;
        transform: translateX(-50%) rotate(45deg);
      "></div>
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
  const overlayRef = useRef<KakaoCustomOverlay | null>(null);
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

    overlayRef.current?.setMap(null);
    overlayRef.current = null;

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
        overlayRef.current?.setMap(null);

        const overlay = new window.kakao.maps.CustomOverlay({
          position,
          content: makeOverlayContent(marker),
          yAnchor: 1.9,
          zIndex: 30
        });

        overlay.setMap(map);
        overlayRef.current = overlay;

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

    overlayRef.current?.setMap(null);

    const overlay = new window.kakao.maps.CustomOverlay({
      position: center,
      content: makeOverlayContent(selected),
      yAnchor: 1.9,
      zIndex: 30
    });

    overlay.setMap(map);
    overlayRef.current = overlay;
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