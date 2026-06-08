import type {
  DynamicInfoResponse,
  MarkerDetail,
  MarkerSummary
} from "../types/marker";
import { getMarkerId } from "../types/marker";

interface MarkerDetailViewProps {
  marker: MarkerDetail;
  dynamicInfo: DynamicInfoResponse | null;
  onChildClick: (marker: MarkerSummary) => void;
}

function formatCategory(category: string): string {
  const labels: Record<string, string> = {
    building: "건물",
    dining: "식당",
    cafe: "카페",
    bus: "버스",
    facility: "시설",
    library: "도서관",
    etc: "기타",
    event: "행사"
  };

  return labels[category] ?? category;
}

function formatRemainingTime(seconds: number | null): string {
  if (seconds === null) {
    return "종료 시간이 등록되지 않았습니다.";
  }

  if (seconds <= 0) {
    return "이미 종료된 이벤트입니다.";
  }

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}일 ${hours}시간 남음`;
  }

  if (hours > 0) {
    return `${hours}시간 ${minutes}분 남음`;
  }

  return `${minutes}분 남음`;
}

function openNavigation(marker: MarkerDetail) {
  const url = `https://map.kakao.com/link/to/${encodeURIComponent(
    marker.titleKo
  )},${marker.latitude},${marker.longitude}`;

  window.open(url, "_blank");
}

function renderMarkdownLikeText(text?: string | null) {
  if (!text) {
    return <p className="marker-description">상세 설명이 없습니다.</p>;
  }

  const lines = text.split("\n").filter((line) => line.trim().length > 0);

  return (
    <div className="marker-description">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (trimmed.startsWith("- ")) {
          return <li key={`${trimmed}-${index}`}>{trimmed.replace("- ", "")}</li>;
        }

        if (trimmed.startsWith("• ")) {
          return <li key={`${trimmed}-${index}`}>{trimmed.replace("• ", "")}</li>;
        }

        return <p key={`${trimmed}-${index}`}>{trimmed}</p>;
      })}
    </div>
  );
}

export default function MarkerDetailView({
  marker,
  dynamicInfo,
  onChildClick
}: MarkerDetailViewProps) {
  return (
    <article className="marker-detail">
      <header className="marker-detail-header">
        <div>
          <h2 className="marker-title">{marker.titleKo}</h2>

          {marker.titleEn && <p className="marker-title-en">{marker.titleEn}</p>}

          <span className="marker-category">
            {formatCategory(marker.category)}
          </span>
        </div>
      </header>

      <section className="marker-description-section">
        {renderMarkdownLikeText(marker.markdownKo)}
      </section>

      {dynamicInfo?.type === "event" && (
        <section className="marker-dynamic-card">
          <h3>이벤트 정보</h3>
          <p>{formatRemainingTime(dynamicInfo.remainingSeconds)}</p>
        </section>
      )}

      {dynamicInfo?.type === "dining" && dynamicInfo.externalUrl && (
        <section className="marker-dynamic-card">
          <h3>식당 정보</h3>
          <a
            href={dynamicInfo.externalUrl}
            target="_blank"
            rel="noreferrer"
            className="marker-external-link"
          >
            식당 정보 보기
          </a>
        </section>
      )}

      {dynamicInfo?.type === "bus" && dynamicInfo.externalUrl && (
        <section className="marker-dynamic-card">
          <h3>버스 정보</h3>
          <a
            href={dynamicInfo.externalUrl}
            target="_blank"
            rel="noreferrer"
            className="marker-external-link"
          >
            버스 정보 보기
          </a>
        </section>
      )}

      {marker.children && marker.children.length > 0 && (
        <section className="marker-children-section">
          <h3>하위 장소</h3>

          <div className="marker-child-list">
            {marker.children.map((child) => {
              const childId = getMarkerId(child);

              return (
                <button
                  key={childId}
                  type="button"
                  onClick={() => onChildClick(child)}
                  className="marker-child-button"
                >
                  <span>{child.titleKo}</span>
                  {child.titleEn && <small>{child.titleEn}</small>}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => openNavigation(marker)}
        className="marker-navigation-button"
      >
        길찾기
      </button>
    </article>
  );
}