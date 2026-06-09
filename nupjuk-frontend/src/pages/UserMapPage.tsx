import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchAdminMarkerDetail } from "../api/adminMarkers";
import {
  fetchMarkerDetail,
  fetchMarkerDynamicInfo,
  fetchMarkers
} from "../api/markers";
import BottomSheet from "../components/BottomSheet";
import CreateMarkerView from "../components/CreateMarkerView";
import EditMarkerView from "../components/EditMarkerView";
import MarkerManagementPanel from "../components/MarkerManagementPanel";
import ViewMarkerView from "../components/ViewMarkerView";
import CategoryChips from "../components/CategoryChips";
import KakaoMapView from "../components/KakaoMapView";
import MarkerDetailView from "../components/MarkerDetailView";
import PhoneFrame from "../components/PhoneFrame";
import SearchBar from "../components/SearchBar";
import { useLanguage } from "../context/LanguageContext";
import { getUi } from "../i18n/ui";
import { mockMarkers } from "../data/mockMarkers";
import type {
  DynamicInfoResponse,
  MarkerCategory,
  MarkerDetail,
  MarkerSummary
} from "../types/marker";
import { getMarkerId } from "../types/marker";

type CategoryFilter = MarkerCategory | "all";
type ManagerView = "list" | "create" | "view" | "edit";

type UserMapPageProps = {
  isAuthenticated?: boolean;
  onGoToLogin?: () => void;
  onLogout?: () => void;
};

type CurrentLocation = {
  latitude: number;
  longitude: number;
};

type MapViewProps = {
  query: string;
  onQueryChange: (value: string) => void;
  category: CategoryFilter;
  onCategoryChange: (value: CategoryFilter) => void;
  isUsingMock: boolean;
  loading: boolean;
  visibleMarkers: MarkerSummary[];
  selectedMarkerId?: string | null;
  onOpenMarker: (marker: MarkerSummary) => void;
  currentLocation?: CurrentLocation | null;
  isSettingsOpen: boolean;
  onToggleSettings: () => void;
  isAuthenticated: boolean;
  onGoToLogin?: () => void;
  onLogout?: () => void;
  onFindMyLocation: () => void;
  locationLoading: boolean;
  errorMessage: string | null;
  locationError: string | null;
  showingCount: number;
};

function MapView({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  isUsingMock,
  loading,
  visibleMarkers,
  selectedMarkerId,
  onOpenMarker,
  currentLocation,
  isSettingsOpen,
  onToggleSettings,
  isAuthenticated,
  onGoToLogin,
  onLogout,
  onFindMyLocation,
  locationLoading,
  errorMessage,
  locationError,
  showingCount
}: MapViewProps) {
  const { language, toggleLanguage } = useLanguage();
  const ui = getUi(language);

  const text = useMemo(() => {
    if (language === "ko") {
      return {
        showing: "표시 중",
        countSuffix: "개",
        myLocation: "내 위치",
        locating: "위치 확인 중..."
      };
    }

    return {
      showing: "Showing",
      countSuffix: "",
      myLocation: "My Location",
      locating: "Locating..."
    };
  }, [language]);

  return (
    <div className="user-map-page">
      <div className="map-top-controls">
        <div className="map-search-row">
          <div className="map-search-box">
            <SearchBar
              value={query}
              onChange={onQueryChange}
              placeholder={ui.map.searchPlaceholder}
            />
          </div>

          <div className="settings-menu-wrapper">
            <button
              type="button"
              className="settings-gear-button"
              onClick={onToggleSettings}
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
                      onToggleSettings();
                      onLogout?.();
                    }}
                  >
                    {ui.map.managerLogout}
                  </button>
                ) : (
                  onGoToLogin && (
                    <button
                      type="button"
                      className="settings-menu-button"
                      onClick={() => {
                        onToggleSettings();
                        onGoToLogin();
                      }}
                    >
                      {ui.map.managerLogin}
                    </button>
                  )
                )}

                <button
                  type="button"
                  className="settings-menu-button"
                  onClick={toggleLanguage}
                >
                  {ui.common.language}: {language.toUpperCase()}
                </button>
              </div>
            )}
          </div>
        </div>

        <CategoryChips
          selected={category}
          onSelect={onCategoryChange}
          mobileLayout
        />

        <div className="map-status-row">
          <div className="map-status-chip">
            {text.showing}: {showingCount}
            {language === "ko" ? text.countSuffix : ""}
          </div>

          <button
            type="button"
            className="my-location-button"
            onClick={onFindMyLocation}
            disabled={locationLoading}
          >
            {locationLoading ? text.locating : text.myLocation}
          </button>

          {loading && (
            <div className="map-status-chip map-status-loading">
              {ui.map.loadingMarkers}
            </div>
          )}

          {isUsingMock && (
            <div className="map-status-chip map-status-mock">
              {ui.map.mockWarning}
            </div>
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
          onMarkerClick={onOpenMarker}
        />

        {!loading && visibleMarkers.length === 0 && (
          <div className="map-empty-message">{ui.map.noResults}</div>
        )}
      </main>
    </div>
  );
}

export default function UserMapPage({
  isAuthenticated = false,
  onGoToLogin,
  onLogout
}: UserMapPageProps) {
  const { language } = useLanguage();

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
  const [managerView, setManagerView] = useState<ManagerView>("list");
  const [viewingMarker, setViewingMarker] = useState<MarkerDetail | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentLocation, setCurrentLocation] =
    useState<CurrentLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const locationText = useMemo(() => {
    if (language === "ko") {
      return {
        backendEmpty: "백엔드에 표시할 마커가 없어 mock data를 사용합니다.",
        backendFailed: "백엔드 연결에 실패하여 mock data를 사용합니다.",
        detailFallback: "하위 장소에 대한 상세 정보입니다.",
        locationUnsupported: "이 브라우저에서는 위치 정보를 사용할 수 없습니다.",
        locationDenied: "위치 권한이 거부되었습니다.",
        locationFailed: "현재 위치를 가져오지 못했습니다."
      };
    }

    return {
      backendEmpty: "No markers found in the backend. Using mock data.",
      backendFailed: "Failed to connect to backend. Using mock data.",
      detailFallback: "Detailed information for this sub-place.",
      locationUnsupported: "Geolocation is not supported by this browser.",
      locationDenied: "Location permission was denied.",
      locationFailed: "Failed to get current location."
    };
  }, [language]);

  const loadMarkers = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const data = await fetchMarkers();

      if (data.length === 0) {
        setMarkers(mockMarkers);
        setIsUsingMock(true);
        setErrorMessage(locationText.backendEmpty);
      } else {
        setMarkers(data);
        setIsUsingMock(false);
      }
    } catch (error) {
      console.error("Failed to load markers from backend:", error);
      setMarkers(mockMarkers);
      setIsUsingMock(true);
      setErrorMessage(locationText.backendFailed);
    } finally {
      setLoading(false);
    }
  }, [locationText.backendEmpty, locationText.backendFailed]);

  useEffect(() => {
    loadMarkers();
  }, [loadMarkers]);

  useEffect(() => {
    if (!isAuthenticated) {
      setManagerView("list");
      setViewingMarker(null);
    }
  }, [isAuthenticated]);

  function handleFindMyLocation() {
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError(locationText.locationUnsupported);
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
          setLocationError(locationText.locationDenied);
        } else {
          setLocationError(locationText.locationFailed);
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

  async function loadMarkerDetail(
    marker: MarkerSummary
  ): Promise<MarkerDetail | null> {
    const markerId = getMarkerId(marker);

    if (!markerId) {
      return null;
    }

    if (isUsingMock) {
      const found = mockMarkers.find((item) => getMarkerId(item) === markerId);

      if (found) {
        return found;
      }

      return {
        ...marker,
        markdownKo: locationText.detailFallback
      };
    }

    try {
      return await fetchMarkerDetail(markerId);
    } catch (error) {
      console.error("Failed to load marker detail:", error);
      return null;
    }
  }

  async function openMarkerDetail(marker: MarkerSummary) {
    const markerId = getMarkerId(marker);

    if (!markerId) {
      return;
    }

    setDynamicInfo(null);

    const detail = await loadMarkerDetail(marker);

    if (!detail) {
      return;
    }

    setSelectedMarker(detail);

    if (isUsingMock) {
      if (detail.dynamicType === "event") {
        setDynamicInfo({
          type: "event",
          activeUntil: detail.activeUntil ?? null,
          remainingSeconds: detail.activeUntil
            ? Math.floor(
                (new Date(detail.activeUntil).getTime() - Date.now()) / 1000
              )
            : null
        });
      } else if (detail.dynamicType === "dining") {
        setDynamicInfo({
          type: "dining",
          externalUrl: detail.externalUrl ?? null
        });
      } else if (detail.dynamicType === "bus") {
        setDynamicInfo({
          type: "bus",
          externalUrl: detail.externalUrl ?? null
        });
      } else {
        setDynamicInfo({ type: "none" });
      }

      return;
    }

    try {
      if (detail.dynamicType && detail.dynamicType !== "none") {
        const dynamic = await fetchMarkerDynamicInfo(markerId);
        setDynamicInfo(dynamic);
      } else {
        setDynamicInfo({ type: "none" });
      }
    } catch (error) {
      console.error("Failed to load marker dynamic info:", error);
      setDynamicInfo({ type: "none" });
    }
  }

  async function openManagerMarkerView(marker: MarkerSummary) {
    const markerId = getMarkerId(marker);

    if (!markerId) {
      return;
    }

    let detail: MarkerDetail | null = null;

    if (isUsingMock) {
      detail = await loadMarkerDetail(marker);
    } else {
      try {
        detail = await fetchAdminMarkerDetail(markerId);
      } catch (error) {
        console.error("Failed to load admin marker detail:", error);
        detail = await loadMarkerDetail(marker);
      }
    }

    if (!detail) {
      return;
    }

    setViewingMarker(detail);
    setManagerView("view");
  }

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

  const selectedPublicMarkerId = selectedMarker
    ? getMarkerId(selectedMarker)
    : null;
  const selectedManagerMarkerId = viewingMarker
    ? getMarkerId(viewingMarker)
    : null;

  const mapViewProps = {
    query,
    onQueryChange: setQuery,
    category,
    onCategoryChange: setCategory,
    isUsingMock,
    loading,
    visibleMarkers,
    currentLocation,
    isSettingsOpen,
    onToggleSettings: () => setIsSettingsOpen((prev) => !prev),
    isAuthenticated,
    onGoToLogin,
    onLogout,
    onFindMyLocation: handleFindMyLocation,
    locationLoading,
    errorMessage,
    locationError,
    showingCount: visibleMarkers.length
  };

  const publicMapView = (
    <MapView
      {...mapViewProps}
      selectedMarkerId={selectedPublicMarkerId}
      onOpenMarker={openMarkerDetail}
    />
  );

  const managerMapView = (
    <MapView
      {...mapViewProps}
      selectedMarkerId={selectedManagerMarkerId}
      onOpenMarker={openManagerMarkerView}
    />
  );

  if (isAuthenticated) {
    if (managerView === "create") {
      return (
        <CreateMarkerView
          markers={markers}
          onBack={() => setManagerView("list")}
          onMarkerCreated={() => {
            loadMarkers();
            setManagerView("list");
          }}
        />
      );
    }

    if (managerView === "view" && viewingMarker) {
      return (
        <ViewMarkerView
          marker={viewingMarker}
          markers={markers}
          mapPanel={managerMapView}
          onBack={() => {
            setManagerView("list");
            setViewingMarker(null);
          }}
          onEdit={() => setManagerView("edit")}
          onDeleted={() => {
            loadMarkers();
            setManagerView("list");
            setViewingMarker(null);
          }}
        />
      );
    }

    if (managerView === "edit" && viewingMarker) {
      return (
        <EditMarkerView
          marker={viewingMarker}
          markers={markers}
          onBack={() => setManagerView("view")}
          onMarkerUpdated={async () => {
            await loadMarkers();
            const markerId = getMarkerId(viewingMarker);
            let updated: MarkerDetail | null = null;

            if (isUsingMock) {
              updated = await loadMarkerDetail(viewingMarker);
            } else if (markerId) {
              try {
                updated = await fetchAdminMarkerDetail(markerId);
              } catch {
                updated = await loadMarkerDetail(viewingMarker);
              }
            }

            if (updated) {
              setViewingMarker(updated);
            }
            setManagerView("view");
          }}
        />
      );
    }

    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          overflow: "hidden",
          background: "#ffffff"
        }}
      >
        <MarkerManagementPanel
          markers={markers}
          loading={loading}
          categoryFilter={category}
          onCategoryFilterChange={setCategory}
          onSelectMarker={openManagerMarkerView}
          onCreateNew={() => setManagerView("create")}
          onLogout={onLogout}
        />

        <div style={{ flex: 1, minWidth: 0, height: "100%" }}>
          {managerMapView}
        </div>
      </div>
    );
  }

  return (
    <PhoneFrame>
      {publicMapView}

      {selectedMarker && (
        <BottomSheet mobileLayout onClose={() => setSelectedMarker(null)}>
          <MarkerDetailView
            marker={selectedMarker}
            dynamicInfo={dynamicInfo}
            onChildClick={openMarkerDetail}
          />
        </BottomSheet>
      )}
    </PhoneFrame>
  );
}
