import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchMarkerDetail,
  fetchMarkerDynamicInfo,
  fetchMarkers
} from "../api/markers";
import BottomSheet from "../components/BottomSheet";
import CategoryChips from "../components/CategoryChips";
import KakaoMapView from "../components/KakaoMapView";
import MarkerDetailView from "../components/MarkerDetailView";
import SearchBar from "../components/SearchBar";
import { useLanguage } from "../context/LanguageContext";
import { mockMarkers } from "../data/mockMarkers";
import type {
  DynamicInfoResponse,
  MarkerCategory,
  MarkerDetail,
  MarkerSummary
} from "../types/marker";
import { getMarkerId } from "../types/marker";

type CategoryFilter = MarkerCategory | "all";

type UserMapPageProps = {
  isAuthenticated?: boolean;
  onGoToLogin?: () => void;
  onLogout?: () => void;
};

type CurrentLocation = {
  latitude: number;
  longitude: number;
};

export default function UserMapPage({
  isAuthenticated = false,
  onGoToLogin,
  onLogout
}: UserMapPageProps) {
  const [markers, setMarkers] = useState<MarkerSummary[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MarkerDetail | null>(
    null
  );
  const [dynamicInfo, setDynamicInfo] = useState<DynamicInfoResponse | null>(
    null
  );

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");

  const [isUsingMock, setIsUsingMock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();

  const [currentLocation, setCurrentLocation] =
    useState<CurrentLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const text = useMemo(() => {
    if (language === "ko") {
      return {
        searchPlaceholder: "장소 검색",
        managerLogin: "관리자 로그인",
        logout: "로그아웃",
        language: "언어",
        showing: "표시 중",
        countSuffix: "개",
        loading: "마커 로딩 중...",
        mock: "Mock data 사용 중",
        empty: "검색 결과가 없습니다.",
        backendEmpty: "백엔드에 표시할 마커가 없어 mock data를 사용합니다.",
        backendFailed: "백엔드 연결에 실패하여 mock data를 사용합니다.",
        detailFallback: "하위 장소에 대한 상세 정보입니다.",
        detailFailed: "상세 정보를 불러오지 못했습니다.",
        myLocation: "내 위치",
        locating: "위치 확인 중...",
        locationUnsupported: "이 브라우저에서는 위치 정보를 사용할 수 없습니다.",
        locationDenied: "위치 권한이 거부되었습니다.",
        locationFailed: "현재 위치를 가져오지 못했습니다."
      };
    }

    return {
      searchPlaceholder: "Search markers",
      managerLogin: "Manager Login",
      logout: "Logout",
      language: "Language",
      showing: "Showing",
      countSuffix: "",
      loading: "Loading markers...",
      mock: "Using mock data",
      empty: "No search results.",
      backendEmpty: "No markers found in the backend. Using mock data.",
      backendFailed: "Failed to connect to backend. Using mock data.",
      detailFallback: "Detailed information for this sub-place.",
      detailFailed: "Failed to load details.",
      myLocation: "My Location",
      locating: "Locating...",
      locationUnsupported: "Geolocation is not supported by this browser.",
      locationDenied: "Location permission was denied.",
      locationFailed: "Failed to get current location."
    };
  }, [language]);

  useEffect(() => {
    async function loadMarkers() {
      setLoading(true);
      setErrorMessage(null);

      try {
        const data = await fetchMarkers();

        if (data.length === 0) {
          setMarkers(mockMarkers);
          setIsUsingMock(true);
          setErrorMessage(text.backendEmpty);
        } else {
          setMarkers(data);
          setIsUsingMock(false);
        }
      } catch (error) {
        console.error("Failed to load markers from backend:", error);
        setMarkers(mockMarkers);
        setIsUsingMock(true);
        setErrorMessage(text.backendFailed);
      } finally {
        setLoading(false);
      }
    }

    loadMarkers();
  }, [text.backendEmpty, text.backendFailed]);

  function handleFindMyLocation() {
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError(text.locationUnsupported);
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationLoading(false);
      },
      (error) => {
        console.error("Failed to get current location:", error);

        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(text.locationDenied);
        } else {
          setLocationError(text.locationFailed);
        }

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  }

  const openMarkerDetail = useCallback(
    async (marker: MarkerSummary) => {
      const markerId = getMarkerId(marker);

      if (!markerId) {
        return;
      }

      setDynamicInfo(null);

      if (isUsingMock) {
        const found = mockMarkers.find(
          (item) => getMarkerId(item) === markerId
        );

        if (found) {
          setSelectedMarker(found);

          if (found.dynamicType === "event") {
            setDynamicInfo({
              type: "event",
              activeUntil: found.activeUntil ?? null,
              remainingSeconds: found.activeUntil
                ? Math.floor(
                    (new Date(found.activeUntil).getTime() - Date.now()) /
                      1000
                  )
                : null
            });
          } else if (found.dynamicType === "dining") {
            setDynamicInfo({
              type: "dining",
              externalUrl: found.externalUrl ?? null
            });
          } else if (found.dynamicType === "bus") {
            setDynamicInfo({
              type: "bus",
              externalUrl: found.externalUrl ?? null
            });
          } else {
            setDynamicInfo({ type: "none" });
          }
        } else {
          setSelectedMarker({
            ...marker,
            markdownKo: text.detailFallback
          });
          setDynamicInfo({ type: "none" });
        }

        return;
      }

      try {
        const detail = await fetchMarkerDetail(markerId);
        setSelectedMarker(detail);

        if (detail.dynamicType && detail.dynamicType !== "none") {
          const dynamic = await fetchMarkerDynamicInfo(markerId);
          setDynamicInfo(dynamic);
        } else {
          setDynamicInfo({ type: "none" });
        }
      } catch (error) {
        console.error("Failed to load marker detail:", error);
        setSelectedMarker({
          ...marker,
          markdownKo: text.detailFailed
        });
        setDynamicInfo({ type: "none" });
      }
    },
    [isUsingMock, text.detailFallback, text.detailFailed]
  );

  const visibleMarkers = useMemo(() => {
    return markers.filter((marker) => {
      const trimmedQuery = query.trim().toLowerCase();

      const matchesQuery =
        trimmedQuery === "" ||
        marker.titleKo.toLowerCase().includes(trimmedQuery) ||
        marker.titleEn?.toLowerCase().includes(trimmedQuery);

      const matchesCategory =
        category === "all" || marker.category === category;

      return matchesQuery && matchesCategory;
    });
  }, [markers, query, category]);

  const selectedMarkerId = selectedMarker ? getMarkerId(selectedMarker) : null;

  return (
    <div className="user-map-page">
      <div className="map-top-controls">
        <div className="map-search-row">
          <div className="map-search-box">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder={text.searchPlaceholder}
            />
          </div>

          <div className="settings-menu-wrapper">
            <button
              type="button"
              className="settings-gear-button"
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              aria-label="Open settings"
            >
              ⚙
            </button>

            {isSettingsOpen && (
              <div className="settings-popover">
                {isAuthenticated ? (
                  <button
                    type="button"
                    className="settings-menu-button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      onLogout?.();
                    }}
                  >
                    {text.logout}
                  </button>
                ) : (
                  onGoToLogin && (
                    <button
                      type="button"
                      className="settings-menu-button"
                      onClick={() => {
                        setIsSettingsOpen(false);
                        onGoToLogin();
                      }}
                    >
                      {text.managerLogin}
                    </button>
                  )
                )}

                <button
                  type="button"
                  className="settings-menu-button"
                  onClick={toggleLanguage}
                >
                  {text.language}: {language.toUpperCase()}
                </button>
              </div>
            )}
          </div>
        </div>

        <CategoryChips
          selected={category}
          onSelect={setCategory}
          language={language}
        />

        <div className="map-status-row">
          <div className="map-status-chip">
            {text.showing}: {visibleMarkers.length}
            {language === "ko" ? text.countSuffix : ""}
          </div>

          <button
            type="button"
            className="my-location-button"
            onClick={handleFindMyLocation}
            disabled={locationLoading}
          >
            {locationLoading ? text.locating : text.myLocation}
          </button>

          {loading && (
            <div className="map-status-chip map-status-loading">
              {text.loading}
            </div>
          )}

          {isUsingMock && (
            <div className="map-status-chip map-status-mock">{text.mock}</div>
          )}
        </div>

        {errorMessage && (
          <div className="map-error-message">{errorMessage}</div>
        )}

        {locationError && (
          <div className="map-error-message">{locationError}</div>
        )}
      </div>

      <main className="map-main">
        <KakaoMapView
          markers={visibleMarkers}
          selectedMarkerId={selectedMarkerId}
          currentLocation={currentLocation}
          onMarkerClick={openMarkerDetail}
        />

        {!loading && visibleMarkers.length === 0 && (
          <div className="map-empty-message">{text.empty}</div>
        )}
      </main>

      {selectedMarker && (
        <BottomSheet onClose={() => setSelectedMarker(null)}>
          <MarkerDetailView
            marker={selectedMarker}
            dynamicInfo={dynamicInfo}
            onChildClick={openMarkerDetail}
          />
        </BottomSheet>
      )}
    </div>
  );
}