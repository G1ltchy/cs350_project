import ReactMarkdown from "react-markdown";
import type {
  DynamicInfoResponse,
  MarkerDetail,
  MarkerSummary
} from "../types/marker";
import { getMarkerId, getParentTitle } from "../types/marker";

interface MarkerDetailViewProps {
  marker: MarkerDetail;
  dynamicInfo: DynamicInfoResponse | null;
  onChildClick: (child: MarkerSummary) => void;
}

function formatRemainingTime(seconds: number | null): string {
  if (seconds === null) {
    return "남은 시간을 계산할 수 없습니다.";
  }

  if (seconds <= 0) {
    return "이벤트가 종료되었습니다.";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}시간 ${minutes}분 남음`;
  }

  return `${minutes}분 남음`;
}

export default function MarkerDetailView({
  marker,
  dynamicInfo,
  onChildClick
}: MarkerDetailViewProps) {
  const markdownText =
    marker.markdownKo ?? marker.markdownEn ?? "표시할 설명이 없습니다.";

  const parentTitle = getParentTitle(marker.parentId);

  function openNavigation() {
    const url = `https://map.kakao.com/link/to/${encodeURIComponent(
      marker.titleKo
    )},${marker.latitude},${marker.longitude}`;

    window.open(url, "_blank");
  }

  function openExternalUrl(url: string | null | undefined) {
    if (!url) {
      return;
    }

    window.open(url, "_blank");
  }

  return (
    <div>
      {marker.imageUrl && (
        <img
          src={marker.imageUrl}
          alt={marker.titleKo}
          style={{
            width: "100%",
            maxHeight: 180,
            objectFit: "cover",
            borderRadius: 16,
            marginTop: 16
          }}
        />
      )}

      <h2 style={{ marginBottom: 4 }}>{marker.titleKo}</h2>

      {marker.titleEn && (
        <p style={{ color: "#6b7280", marginTop: 0 }}>{marker.titleEn}</p>
      )}

      {parentTitle && (
        <p style={{ color: "#6b7280", marginTop: 0 }}>
          Parent: {parentTitle}
        </p>
      )}

      <div
        style={{
          display: "inline-block",
          padding: "4px 10px",
          borderRadius: 999,
          background: "#eef2ff",
          color: "#3730a3",
          fontSize: 13,
          marginBottom: 12
        }}
      >
        {marker.category}
      </div>

      <div style={{ lineHeight: 1.6 }}>
        <ReactMarkdown>{markdownText}</ReactMarkdown>
      </div>

      {dynamicInfo?.type === "dining" && (
        <section
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 14,
            background: "#f9fafb"
          }}
        >
          <h3 style={{ marginTop: 0 }}>식당 정보</h3>
          <p style={{ color: "#4b5563" }}>
            식단 정보는 외부 페이지에서 확인할 수 있습니다.
          </p>
          {dynamicInfo.externalUrl && (
            <button
              onClick={() => openExternalUrl(dynamicInfo.externalUrl)}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #d1d5db",
                background: "#ffffff",
                cursor: "pointer"
              }}
            >
              관련 정보 보기
            </button>
          )}
        </section>
      )}

      {dynamicInfo?.type === "bus" && (
        <section
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 14,
            background: "#f9fafb"
          }}
        >
          <h3 style={{ marginTop: 0 }}>버스 정보</h3>
          <p style={{ color: "#4b5563" }}>
            버스 정보는 외부 페이지에서 확인할 수 있습니다.
          </p>
          {dynamicInfo.externalUrl && (
            <button
              onClick={() => openExternalUrl(dynamicInfo.externalUrl)}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #d1d5db",
                background: "#ffffff",
                cursor: "pointer"
              }}
            >
              관련 정보 보기
            </button>
          )}
        </section>
      )}

      {dynamicInfo?.type === "event" && (
        <section
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 14,
            background: "#f9fafb"
          }}
        >
          <h3 style={{ marginTop: 0 }}>이벤트 정보</h3>
          <p>{formatRemainingTime(dynamicInfo.remainingSeconds)}</p>
        </section>
      )}

      {marker.children && marker.children.length > 0 && (
        <section style={{ marginTop: 16 }}>
          <h3>하위 장소</h3>
          {marker.children.map((child) => {
            const childId = getMarkerId(child);

            return (
              <button
                key={childId}
                onClick={() => onChildClick(child)}
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: 8,
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid #d1d5db",
                  background: "#ffffff",
                  textAlign: "left",
                  cursor: "pointer"
                }}
              >
                {child.titleKo}
              </button>
            );
          })}
        </section>
      )}

      <button
        onClick={openNavigation}
        style={{
          width: "100%",
          marginTop: 20,
          padding: 14,
          borderRadius: 14,
          border: "none",
          background: "#2563eb",
          color: "#ffffff",
          fontSize: 16,
          fontWeight: 700,
          cursor: "pointer"
        }}
      >
        길찾기
      </button>
    </div>
  );
}