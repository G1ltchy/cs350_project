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
    }

    loadMarkers();
  }, []);

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
    <div className="user-map-page">
      <div className="map-top-controls">
        <div className="map-search-row">
          <div className="map-search-box">
            <SearchBar value={query} onChange={setQuery} />
          </div>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={onLogout}
              className="manager-login-button"
            >
              Logout
            </button>
          ) : (
            onGoToLogin && (
              <button
                type="button"
                onClick={onGoToLogin}
                className="manager-login-button"
              >
                Manager Login
              </button>
            )
          )}
        </div>

        <CategoryChips selected={category} onSelect={setCategory} />

        <div className="map-status-row">
          <div className="map-status-chip">표시 중: {visibleMarkers.length}개</div>

          {loading && (
            <div className="map-status-chip map-status-loading">
              마커 로딩 중...
            </div>
          )}

          {isUsingMock && (
            <div className="map-status-chip map-status-mock">
              Mock data 사용 중
            </div>
          )}
        </div>

        {errorMessage && <div className="map-error-message">{errorMessage}</div>}
      </div>

      <main className="map-main">
        <KakaoMapView
          markers={visibleMarkers}
          selectedMarkerId={selectedMarkerId}
          onMarkerClick={openMarkerDetail}
        />

        {!loading && visibleMarkers.length === 0 && (
          <div className="map-empty-message">검색 결과가 없습니다.</div>
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