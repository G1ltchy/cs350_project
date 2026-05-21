import { useEffect, useMemo, useState } from "react";
import {
  fetchMarkerDetail,
  fetchMarkerDynamicInfo,
  fetchMarkers
} from "../api/markers";
import BottomSheet from "../components/BottomSheet";
import CategoryChips from "../components/CategoryChips";
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

export default function UserMapPage() {
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

  useEffect(() => {
    async function loadMarkers() {
      try {
        const data = await fetchMarkers();

        if (data.length === 0) {
          setMarkers(mockMarkers);
          setIsUsingMock(true);
        } else {
          setMarkers(data);
          setIsUsingMock(false);
        }
      } catch (error) {
        console.error("Failed to load markers from backend:", error);
        setMarkers(mockMarkers);
        setIsUsingMock(true);
      } finally {
        setLoading(false);
      }
    }

    loadMarkers();
  }, []);

  async function openMarkerDetail(marker: MarkerSummary) {
    const markerId = getMarkerId(marker);

    if (!markerId) {
      return;
    }

    setDynamicInfo(null);

    if (isUsingMock) {
      const found = mockMarkers.find((item) => getMarkerId(item) === markerId);

      if (found) {
        setSelectedMarker(found);

        if (found.dynamicType === "event") {
          setDynamicInfo({
            type: "event",
            activeUntil: found.activeUntil ?? null,
            remainingSeconds: found.activeUntil
              ? Math.floor(
                  (new Date(found.activeUntil).getTime() - Date.now()) / 1000
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
    }
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
        <SearchBar value={query} onChange={setQuery} />
        <CategoryChips selected={category} onSelect={setCategory} />

        {isUsingMock && (
          <div
            style={{
              marginTop: 8,
              padding: 8,
              borderRadius: 10,
              background: "#fff7ed",
              color: "#9a3412",
              fontSize: 12,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
            }}
          >
            백엔드 데이터가 없거나 연결되지 않아 mock data로 표시 중입니다.
          </div>
        )}
      </div>

      <main
        style={{
          width: "100%",
          height: "100%",
          paddingTop: 140,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <section
          style={{
            width: "88%",
            maxWidth: 460,
            background: "#ffffff",
            borderRadius: 20,
            padding: 24,
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.12)"
          }}
        >
          <h1 style={{ marginTop: 0 }}>Nupjuk Guide</h1>
          <p style={{ color: "#6b7280" }}>
            지도 영역 임시 버전입니다. 이후 Kakao Map 컴포넌트로 교체하면
            됩니다.
          </p>

          {loading && <p>마커를 불러오는 중입니다...</p>}

          {!loading && visibleMarkers.length === 0 && (
            <p>검색 결과가 없습니다.</p>
          )}

          {!loading &&
            visibleMarkers.map((marker) => {
              const markerId = getMarkerId(marker);

              return (
                <button
                  key={markerId}
                  onClick={() => openMarkerDetail(marker)}
                  style={{
                    display: "block",
                    width: "100%",
                    marginTop: 10,
                    padding: 14,
                    borderRadius: 14,
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    textAlign: "left",
                    cursor: "pointer"
                  }}
                >
                  <strong>📍 {marker.titleKo}</strong>
                  <div
                    style={{
                      marginTop: 4,
                      color: "#6b7280",
                      fontSize: 13
                    }}
                  >
                    {marker.category} · {marker.latitude}, {marker.longitude}
                  </div>
                </button>
              );
            })}
        </section>
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