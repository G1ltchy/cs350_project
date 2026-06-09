import { useEffect, useMemo, useRef, useState } from "react";
import type { MarkerSummary } from "../types/marker";

interface CurrentLocation {
  latitude: number;
  longitude: number;
}

interface KakaoMapViewProps {
  markers: MarkerSummary[];
  selectedMarkerId?: string | null;
  currentLocation?: CurrentLocation | null;
  onMarkerClick: (marker: MarkerSummary) => void;
}

const KAIST_CENTER = {
  latitude: 36.3709,
  longitude: 127.3652
};

const CHILD_MARKER_VISIBLE_LEVEL = 2;

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
      window.kakao!.maps.load(resolve);
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
      if (!window.kakao?.maps) {
        reject(new Error("Kakao Map SDK가 정상적으로 초기화되지 않았습니다."));
        return;
      }

      window.kakao.maps.load(resolve);
    };

    script.onerror = () => {
      kakaoMapScriptPromise = null;
      reject(new Error("Kakao Map SDK 로드에 실패했습니다. 네트워크를 확인하세요."));
    };

    document.head.appendChild(script);
  });

  return kakaoMapScriptPromise;
}

function getMarkerId(marker: MarkerSummary): string {
  return String(
    marker.id ?? marker._id ?? `${marker.latitude}-${marker.longitude}`
  );
}

function getParentId(marker: MarkerSummary): string | null {
  const rawMarker = marker as any;
  const parentId = rawMarker.parentId;

  if (
    parentId === null ||
    parentId === undefined ||
    parentId === "" ||
    parentId === "null"
  ) {
    return null;
  }

  if (typeof parentId === "string") {
    return parentId;
  }

  if (typeof parentId === "object") {
    return String(parentId.id ?? parentId._id ?? "");
  }

  return String(parentId);
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', 'Apple SD Gothic Neo', Arial, sans-serif;
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

function makeCurrentLocationContent(): string {
  return `
    <div style="
      width: 18px;
      height: 18px;
      border-radius: 999px;
      background: #2563eb;
      border: 3px solid #ffffff;
      box-shadow: 0 0 0 8px rgba(37, 99, 235, 0.22), 0 4px 12px rgba(0, 0, 0, 0.28);
    "></div>
  `;
}

export default function KakaoMapView({
  markers,
  selectedMarkerId,
  currentLocation,
  onMarkerClick
}: KakaoMapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const mapRef = useRef<any>(null);
  const markerRefs = useRef<any[]>([]);
  const overlayRef = useRef<any>(null);
  const currentLocationOverlayRef = useRef<any>(null);

  const [mapReady, setMapReady] = useState(false);
  const [mapLevel, setMapLevel] = useState(4);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const displayMarkers = useMemo(() => {
    const shouldShowChildren = mapLevel <= CHILD_MARKER_VISIBLE_LEVEL;

    if (shouldShowChildren) {
      return markers;
    }

    const parentIds = new Set<string>();

    markers.forEach((marker) => {
      const parentId = getParentId(marker);

      if (parentId) {
        parentIds.add(parentId);
      }
    });

    return markers.filter((marker) => {
      const markerId = getMarkerId(marker);
      return parentIds.has(markerId);
    });
  }, [markers, mapLevel]);

  useEffect(() => {
    let cancelled = false;

    async function initializeMap() {
      try {
        await loadKakaoMapScript();

        if (cancelled || !containerRef.current || mapRef.current) {
          return;
        }

        if (!window.kakao?.maps) {
          throw new Error("Kakao Map SDK가 준비되지 않았습니다.");
        }

        const kakaoMaps = window.kakao.maps;

        const center = new kakaoMaps.LatLng(
          KAIST_CENTER.latitude,
          KAIST_CENTER.longitude
        );

        const map = new kakaoMaps.Map(containerRef.current, {
          center,
          level: 4
        });

        mapRef.current = map;

        if (typeof map.getLevel === "function") {
          setMapLevel(map.getLevel());
        } else {
          setMapLevel(4);
        }

        kakaoMaps.event.addListener(map, "zoom_changed", () => {
          if (typeof map.getLevel === "function") {
            setMapLevel(map.getLevel());
          }
        });

        setTimeout(() => {
          if (cancelled) {
            return;
          }

          map.relayout();
          map.setCenter(center);
          setMapReady(true);
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

    if (!mapReady || !map || !window.kakao?.maps) {
      return;
    }

    const kakaoMaps = window.kakao.maps;

    markerRefs.current.forEach((kakaoMarker) => kakaoMarker.setMap(null));
    markerRefs.current = [];

    overlayRef.current?.setMap(null);
    overlayRef.current = null;

    displayMarkers.forEach((marker) => {
      const latitude = Number(marker.latitude);
      const longitude = Number(marker.longitude);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return;
      }

      const position = new kakaoMaps.LatLng(latitude, longitude);

      const kakaoMarker = new kakaoMaps.Marker({
        position,
        title: marker.titleKo
      });

      kakaoMarker.setMap(map);

      kakaoMaps.event.addListener(kakaoMarker, "click", () => {
        overlayRef.current?.setMap(null);

        const overlay = new kakaoMaps.CustomOverlay({
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

    setTimeout(() => {
      map.relayout();
    }, 0);
  }, [mapReady, displayMarkers, onMarkerClick, mapLevel]);

  useEffect(() => {
    const map = mapRef.current;

    if (!mapReady || !map || !currentLocation || !window.kakao?.maps) {
      return;
    }

    const kakaoMaps = window.kakao.maps;

    const latitude = Number(currentLocation.latitude);
    const longitude = Number(currentLocation.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    const position = new kakaoMaps.LatLng(latitude, longitude);

    currentLocationOverlayRef.current?.setMap(null);

    const currentLocationOverlay = new kakaoMaps.CustomOverlay({
      position,
      content: makeCurrentLocationContent(),
      yAnchor: 0.5,
      zIndex: 80
    });

    currentLocationOverlay.setMap(map);
    currentLocationOverlayRef.current = currentLocationOverlay;

    map.setCenter(position);
    map.setLevel(3);

    setTimeout(() => {
      map.relayout();
      map.setCenter(position);
    }, 0);
  }, [mapReady, currentLocation]);

  useEffect(() => {
    const map = mapRef.current;

    if (!mapReady || !map || !selectedMarkerId || !window.kakao?.maps) {
      return;
    }

    const kakaoMaps = window.kakao.maps;

    const selected = markers.find(
      (marker) => getMarkerId(marker) === selectedMarkerId
    );

    if (!selected) {
      return;
    }

    const latitude = Number(selected.latitude);
    const longitude = Number(selected.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    const center = new kakaoMaps.LatLng(latitude, longitude);

    map.setCenter(center);

    overlayRef.current?.setMap(null);

    const overlay = new kakaoMaps.CustomOverlay({
      position: center,
      content: makeOverlayContent(selected),
      yAnchor: 1.9,
      zIndex: 30
    });

    overlay.setMap(map);
    overlayRef.current = overlay;
  }, [mapReady, markers, selectedMarkerId]);

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
            lineHeight: 1.5,
            zIndex: 50
          }}
        >
          <div style={{ fontWeight: 800 }}>지도 로드 실패</div>
          <div style={{ marginTop: 6 }}>{errorMessage}</div>
        </div>
      )}
    </div>
  );
}