import { type MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { getUi } from "../i18n/ui";
import { getMarkerTitle } from "../lib/markerDisplay";
import type { MarkerSummary } from "../types/marker";
import { getMarkerId } from "../types/marker";

interface CurrentLocation {
  latitude: number;
  longitude: number;
}

type MapLocation = {
  latitude: number;
  longitude: number;
};

interface KakaoMapViewProps {
  markers: MarkerSummary[];
  selectedMarkerId?: string | null;
  currentLocation?: CurrentLocation | null;
  onMarkerClick?: (marker: MarkerSummary) => void;
  pickMode?: boolean;
  onLocationPick?: (latitude: number, longitude: number) => void;
  pickedLocation?: MapLocation | null;
  defaultCenter?: MapLocation;
  showPickHint?: boolean;
}

const KAIST_CENTER = {
  latitude: 36.3709,
  longitude: 127.3652
};

const CHILD_MARKER_VISIBLE_LEVEL = 2;

let kakaoMapScriptPromise: Promise<void> | null = null;

function isKakaoMapsApiReady(): boolean {
  return typeof window.kakao?.maps?.LatLng === "function";
}

function waitForKakaoMapsApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.kakao?.maps?.load) {
      reject(new Error("Kakao Map SDK가 아직 초기화되지 않았습니다."));
      return;
    }

    window.kakao.maps.load(() => {
      if (!isKakaoMapsApiReady()) {
        reject(
          new Error(
            "Kakao Map SDK 인증 실패: JavaScript 키와 도메인 등록을 확인하세요."
          )
        );
        return;
      }

      resolve();
    });
  });
}

function loadKakaoMapScript(): Promise<void> {
  const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;

  if (!appKey) {
    return Promise.reject(
      new Error("VITE_KAKAO_MAP_APP_KEY가 .env에 설정되어 있지 않습니다.")
    );
  }

  if (kakaoMapScriptPromise) {
    return kakaoMapScriptPromise;
  }

  kakaoMapScriptPromise = (async () => {
    if (!window.kakao?.maps) {
      await new Promise<void>((resolve, reject) => {
        const existingScript = document.querySelector<HTMLScriptElement>(
          'script[src*="dapi.kakao.com/v2/maps/sdk.js"]'
        );

        if (existingScript) {
          if (window.kakao?.maps) {
            resolve();
            return;
          }

          existingScript.addEventListener("load", () => resolve(), { once: true });
          existingScript.addEventListener(
            "error",
            () => reject(new Error("Kakao Map SDK 로드에 실패했습니다.")),
            { once: true }
          );
          return;
        }

        const script = document.createElement("script");
        script.async = true;
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;

        script.onload = () => resolve();
        script.onerror = () => {
          reject(new Error("Kakao Map SDK 로드에 실패했습니다."));
        };

        document.head.appendChild(script);
      });
    }

    await waitForKakaoMapsApi();
  })().catch((error) => {
    kakaoMapScriptPromise = null;
    throw error;
  });

  return kakaoMapScriptPromise;
}

function getParentId(marker: MarkerSummary): string | null {
  const parentId = marker.parentId;

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

  return String(parentId._id ?? "");
}

function makeOverlayContent(title: string): string {
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
      ${title}
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

function showMarkerOverlay(
  map: KakaoMap,
  position: KakaoLatLng,
  title: string,
  overlayRef: MutableRefObject<KakaoCustomOverlay | null>
) {
  const kakaoMaps = window.kakao!.maps;

  overlayRef.current?.setMap(null);

  const overlay = new kakaoMaps.CustomOverlay({
    position,
    content: makeOverlayContent(title),
    yAnchor: 1.9,
    zIndex: 30
  });

  overlay.setMap(map);
  overlayRef.current = overlay;
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

function makePickedLocationContent(): string {
  return `
    <div style="
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #ef4444;
      border: 3px solid #ffffff;
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.35);
    "></div>
  `;
}

export default function KakaoMapView({
  markers,
  selectedMarkerId,
  currentLocation,
  onMarkerClick,
  pickMode = false,
  onLocationPick,
  pickedLocation,
  defaultCenter,
  showPickHint = false
}: KakaoMapViewProps) {
  const { language } = useLanguage();
  const ui = getUi(language);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const markerRefs = useRef<KakaoMarker[]>([]);
  const markerOverlayRef = useRef<KakaoCustomOverlay | null>(null);
  const currentLocationOverlayRef = useRef<KakaoCustomOverlay | null>(null);
  const pickedOverlayRef = useRef<KakaoCustomOverlay | null>(null);
  const onMarkerClickRef = useRef(onMarkerClick);
  const onLocationPickRef = useRef(onLocationPick);
  const defaultCenterRef = useRef(defaultCenter ?? KAIST_CENTER);
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
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  useEffect(() => {
    onLocationPickRef.current = onLocationPick;
  }, [onLocationPick]);

  useEffect(() => {
    defaultCenterRef.current = defaultCenter ?? KAIST_CENTER;
  }, [defaultCenter]);

  useEffect(() => {
    let cancelled = false;

    async function initializeMap() {
      try {
        await loadKakaoMapScript();

        if (cancelled || !containerRef.current || mapRef.current) {
          return;
        }

        if (!isKakaoMapsApiReady()) {
          throw new Error("Kakao Map SDK가 준비되지 않았습니다.");
        }

        const centerPoint = defaultCenterRef.current;
        const kakaoMaps = window.kakao!.maps;
        const center = new kakaoMaps.LatLng(
          centerPoint.latitude,
          centerPoint.longitude
        );

        const map = new kakaoMaps.Map(containerRef.current, {
          center,
          level: 4
        });

        mapRef.current = map;

        if (typeof map.getLevel === "function") {
          setMapLevel(map.getLevel());
        }

        kakaoMaps.event.addListener(map, "zoom_changed", () => {
          if (typeof map.getLevel === "function") {
            setMapLevel(map.getLevel());
          }
        });

        requestAnimationFrame(() => {
          if (cancelled || !mapRef.current) {
            return;
          }

          map.relayout();
          map.setCenter(center);
          setMapReady(true);
        });
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
      setMapReady(false);
      markerRefs.current.forEach((marker) => marker.setMap(null));
      markerRefs.current = [];
      markerOverlayRef.current?.setMap(null);
      markerOverlayRef.current = null;
      currentLocationOverlayRef.current?.setMap(null);
      currentLocationOverlayRef.current = null;
      pickedOverlayRef.current?.setMap(null);
      pickedOverlayRef.current = null;
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!mapReady || !map || !isKakaoMapsApiReady()) {
      return;
    }

    const kakaoMaps = window.kakao!.maps;

    markerRefs.current.forEach((marker) => marker.setMap(null));
    markerRefs.current = [];

    markerOverlayRef.current?.setMap(null);
    markerOverlayRef.current = null;

    displayMarkers.forEach((marker) => {
      const latitude = Number(marker.latitude);
      const longitude = Number(marker.longitude);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return;
      }

      const position = new kakaoMaps.LatLng(latitude, longitude);
      const title = getMarkerTitle(marker, language);

      const kakaoMarker = new kakaoMaps.Marker({
        map,
        position,
        title
      });

      kakaoMaps.event.addListener(kakaoMarker, "click", () => {
        showMarkerOverlay(map, position, title, markerOverlayRef);
        onMarkerClickRef.current?.(marker);
      });

      markerRefs.current.push(kakaoMarker);
    });
  }, [displayMarkers, language, mapReady]);

  useEffect(() => {
    const map = mapRef.current;

    if (
      !mapReady ||
      !map ||
      !pickMode ||
      !onLocationPick ||
      !isKakaoMapsApiReady()
    ) {
      return;
    }

    const kakaoMaps = window.kakao!.maps;

    const handler = (mouseEvent?: KakaoMouseEvent) => {
      if (!mouseEvent) {
        return;
      }

      const lat = mouseEvent.latLng.getLat();
      const lng = mouseEvent.latLng.getLng();

      onLocationPickRef.current?.(lat, lng);
      map.setCenter(mouseEvent.latLng);
    };

    kakaoMaps.event.addListener(map, "click", handler);

    return () => {
      kakaoMaps.event.removeListener(map, "click", handler);
    };
  }, [mapReady, pickMode, onLocationPick]);

  useEffect(() => {
    const map = mapRef.current;

    if (!mapReady || !map || !currentLocation || !isKakaoMapsApiReady()) {
      return;
    }

    const latitude = Number(currentLocation.latitude);
    const longitude = Number(currentLocation.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    const kakaoMaps = window.kakao!.maps;
    const position = new kakaoMaps.LatLng(latitude, longitude);

    currentLocationOverlayRef.current?.setMap(null);

    const overlay = new kakaoMaps.CustomOverlay({
      position,
      content: makeCurrentLocationContent(),
      map,
      yAnchor: 0.5,
      zIndex: 80
    });

    currentLocationOverlayRef.current = overlay;

    map.setCenter(position);
    map.setLevel(3);
  }, [mapReady, currentLocation]);

  useEffect(() => {
    const map = mapRef.current;

    if (!mapReady || !map || !isKakaoMapsApiReady()) {
      return;
    }

    pickedOverlayRef.current?.setMap(null);
    pickedOverlayRef.current = null;

    if (!pickedLocation) {
      return;
    }

    const kakaoMaps = window.kakao!.maps;
    const position = new kakaoMaps.LatLng(
      pickedLocation.latitude,
      pickedLocation.longitude
    );

    const overlay = new kakaoMaps.CustomOverlay({
      position,
      content: makePickedLocationContent(),
      map,
      yAnchor: 0.5,
      xAnchor: 0.5,
      zIndex: 3
    });

    pickedOverlayRef.current = overlay;
  }, [pickedLocation, mapReady]);

  useEffect(() => {
    const map = mapRef.current;

    if (!mapReady || !map || !isKakaoMapsApiReady()) {
      return;
    }

    if (!selectedMarkerId) {
      markerOverlayRef.current?.setMap(null);
      markerOverlayRef.current = null;
      return;
    }

    const selected = markers.find(
      (marker) => getMarkerId(marker) === selectedMarkerId
    );

    if (!selected) {
      return;
    }

    const kakaoMaps = window.kakao!.maps;
    const center = new kakaoMaps.LatLng(
      selected.latitude,
      selected.longitude
    );
    const title = getMarkerTitle(selected, language);

    map.setCenter(center);
    showMarkerOverlay(map, center, title, markerOverlayRef);
  }, [markers, selectedMarkerId, mapReady, language]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: "#d1d5db",
        cursor: pickMode ? "crosshair" : "default"
      }}
    >
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {pickMode && showPickHint && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 24,
            transform: "translateX(-50%)",
            padding: "8px 14px",
            borderRadius: 999,
            background: "rgba(255, 255, 255, 0.92)",
            color: "#374151",
            fontSize: 12,
            fontWeight: 600,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
            pointerEvents: "none",
            zIndex: 6
          }}
        >
          {ui.createMarker.mapClickHint}
        </div>
      )}

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
