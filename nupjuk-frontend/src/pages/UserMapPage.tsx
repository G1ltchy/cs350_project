import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchMarkerDetail,
  fetchMarkerDynamicInfo,
  fetchMarkers
} from "../api/markers";
import { fetchAdminMarkerDetail } from "../api/adminMarkers";
import BottomSheet from "../components/BottomSheet";
import CreateMarkerView from "../components/CreateMarkerView";
import EditMarkerView from "../components/EditMarkerView";
import LanguageToggle from "../components/LanguageToggle";
import MarkerManagementPanel from "../components/MarkerManagementPanel";
import ViewMarkerView from "../components/ViewMarkerView";
import CategoryChips from "../components/CategoryChips";
import KakaoMapView from "../components/KakaoMapView";
import MarkerDetailView from "../components/MarkerDetailView";
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

type MapViewProps = {
  compact?: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  category: CategoryFilter;
  onCategoryChange: (value: CategoryFilter) => void;
  isUsingMock: boolean;
  loading: boolean;
  visibleMarkers: MarkerSummary[];
  selectedMarkerId?: string | null;
  onOpenMarker: (marker: MarkerSummary) => void;
  showUserControls?: boolean;
  showCategoryControls?: boolean;
  onGoToLogin?: () => void;
};

function MapView({
  compact = false,
  query,
  onQueryChange,
  category,
  onCategoryChange,
  isUsingMock,
  loading,
  visibleMarkers,
  selectedMarkerId,
  onOpenMarker,
  showUserControls = true,
  showCategoryControls = false,
  onGoToLogin
}: MapViewProps) {
  const { language } = useLanguage();
  const ui = getUi(language);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#e5e7eb"
      }}
    >
      <div
        style={{
          position: "absolute",
          top: compact ? 12 : 16,
          left: compact ? 12 : 16,
          right: compact ? 12 : 16,
          zIndex: 10
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: compact ? 6 : 8
          }}
        >
          <LanguageToggle />
        </div>

        {showUserControls && (
          <>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <SearchBar
                  value={query}
                  onChange={onQueryChange}
                  placeholder={ui.map.searchPlaceholder}
                />
              </div>
              {onGoToLogin && (
                <button
                  type="button"
                  onClick={onGoToLogin}
                  style={{
                    flexShrink: 0,
                    marginTop: 2,
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "none",
                    background: "#374151",
                    color: "#ffffff",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)"
                  }}
                >
                  {ui.map.managerLogin}
                </button>
              )}
            </div>
            <CategoryChips selected={category} onSelect={onCategoryChange} />
          </>
        )}

        {!showUserControls && showCategoryControls && (
          <CategoryChips selected={category} onSelect={onCategoryChange} />
        )}

        <div
          style={{
            marginTop: 8,
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap"
          }}
        >
          {loading && (
            <div
              style={{
                padding: compact ? "5px 8px" : "7px 10px",
                borderRadius: 999,
                background: "#eff6ff",
                color: "#1d4ed8",
                fontSize: compact ? 11 : 12,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
              }}
            >
              {ui.map.loadingMarkers}
            </div>
          )}

          {isUsingMock && (
            <div
              style={{
                padding: compact ? "5px 8px" : "7px 10px",
                borderRadius: 999,
                background: "#fff7ed",
                color: "#9a3412",
                fontSize: compact ? 11 : 12,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
              }}
            >
              {ui.map.mockWarning}
            </div>
          )}
        </div>
      </div>

      <main style={{ width: "100%", height: "100%", position: "relative" }}>
        <KakaoMapView
          markers={visibleMarkers}
          selectedMarkerId={selectedMarkerId}
          onMarkerClick={onOpenMarker}
        />

        {!loading && visibleMarkers.length === 0 && (
          <div
            style={{
              position: "absolute",
              left: compact ? 16 : 24,
              right: compact ? 16 : 24,
              top: "45%",
              zIndex: 8,
              padding: compact ? 14 : 18,
              borderRadius: compact ? 14 : 18,
              background: "#ffffff",
              color: "#374151",
              textAlign: "center",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.16)"
            }}
          >
            {ui.map.noResults}
          </div>
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

  useEffect(() => {
    async function loadMarkers() {
      setLoading(true);
      setErrorMessage(null);

      try {
        const data = await fetchMarkers();

        if (data.length === 0) {
          setMarkers(mockMarkers);
          setIsUsingMock(true);
          setErrorMessage("백엔드에 표시할 마커가 없어 mock data를 사용합니다.");
        } else {
          setMarkers(data);
          setIsUsingMock(false);
        }
      } catch (error) {
        console.error("Failed to load markers from backend:", error);
        setMarkers(mockMarkers);
        setIsUsingMock(true);
        setErrorMessage("백엔드 연결에 실패하여 mock data를 사용합니다.");
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to load markers from backend:", error);
      setMarkers(mockMarkers);
      setIsUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMarkers();
  }, [loadMarkers]);

  useEffect(() => {
    if (!isAuthenticated) {
      setManagerView("list");
      setViewingMarker(null);
    }
  }, [isAuthenticated]);

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
        markdownKo: "하위 장소에 대한 상세 정보입니다."
      };
    }

    try {
      return await fetchMarkerDetail(markerId);
    } catch (error) {
      console.error("Failed to load marker detail:", error);
      return null;
    }
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
            markdownKo: "하위 장소에 대한 상세 정보입니다."
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
          markdownKo: "상세 정보를 불러오지 못했습니다."
        });
      } else {
        setDynamicInfo({ type: "none" });
      }
    },
    [isUsingMock]
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
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "#e5e7eb"
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 16,
          zIndex: 10
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <SearchBar value={query} onChange={setQuery} />
          </div>

          {onGoToLogin && (
            <button
              type="button"
              onClick={onGoToLogin}
              style={{
                flexShrink: 0,
                marginTop: 2,
                padding: "10px 14px",
                borderRadius: 12,
                border: "none",
                background: "#374151",
                color: "#ffffff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)"
              }}
            >
              Manager Login
            </button>
          )}
        </div>

        <CategoryChips selected={category} onSelect={setCategory} />

        <div
          style={{
            marginTop: 8,
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap"
          }}
        >
          <div
            style={{
              padding: "7px 10px",
              borderRadius: 999,
              background: "#ffffff",
              color: "#374151",
              fontSize: 12,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
            }}
          >
            표시 중: {visibleMarkers.length}개
          </div>

          {loading && (
            <div
              style={{
                padding: "7px 10px",
                borderRadius: 999,
                background: "#eff6ff",
                color: "#1d4ed8",
                fontSize: 12,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
              }}
            >
              마커 로딩 중...
            </div>
          )}

          {isUsingMock && (
            <div
              style={{
                padding: "7px 10px",
                borderRadius: 999,
                background: "#fff7ed",
                color: "#9a3412",
                fontSize: 12,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
              }}
            >
              Mock data 사용 중
            </div>
          )}
        </div>

        {errorMessage && (
          <div
            style={{
              marginTop: 8,
              padding: 10,
              borderRadius: 12,
              background: "#ffffff",
              color: "#92400e",
              fontSize: 12,
              lineHeight: 1.4,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
            }}
          >
            {errorMessage}
          </div>
        )}
      </div>

      <main style={{ width: "100%", height: "100%" }}>
        <KakaoMapView
          markers={visibleMarkers}
          selectedMarkerId={selectedMarkerId}
          onMarkerClick={openMarkerDetail}
        />

        {!loading && visibleMarkers.length === 0 && (
          <div
            style={{
              position: "absolute",
              left: 24,
              right: 24,
              top: "45%",
              zIndex: 8,
              padding: 18,
              borderRadius: 18,
              background: "#ffffff",
              color: "#374151",
              textAlign: "center",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.16)"
            }}
          >
            검색 결과가 없습니다.
          </div>
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
