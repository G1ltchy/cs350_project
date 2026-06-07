import ReactMarkdown from "react-markdown";
import { useLanguage } from "../context/LanguageContext";
import { getUi } from "../i18n/ui";
import {
  getMarkerId,
  getMarkerMarkdown,
  getMarkerSubtitle,
  getMarkerTitle,
  getParentTitle
} from "../lib/markerDisplay";
import type {
  DynamicInfoResponse,
  MarkerDetail,
  MarkerSummary
} from "../types/marker";

interface MarkerDetailViewProps {
  marker: MarkerDetail;
  dynamicInfo: DynamicInfoResponse | null;
  onChildClick: (child: MarkerSummary) => void;
}

export default function MarkerDetailView({
  marker,
  dynamicInfo,
  onChildClick
}: MarkerDetailViewProps) {
  const { language } = useLanguage();
  const ui = getUi(language);

  const title = getMarkerTitle(marker, language);
  const subtitle = getMarkerSubtitle(marker, language);
  const markdownText = getMarkerMarkdown(marker, language, ui.map.noDescription);
  const parentTitle = getParentTitle(marker.parentId, language);

  function formatRemainingTime(seconds: number | null): string {
    if (seconds === null) {
      return ui.map.eventRemainingUnknown;
    }

    if (seconds <= 0) {
      return ui.map.eventEnded;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return ui.map.eventRemainingHours(hours, minutes);
    }

    return ui.map.eventRemainingMinutes(minutes);
  }

  function openNavigation() {
    const url = `https://map.kakao.com/link/to/${encodeURIComponent(
      title
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
          alt={title}
          style={{
            width: "100%",
            maxHeight: 180,
            objectFit: "cover",
            borderRadius: 16,
            marginTop: 16
          }}
        />
      )}

      <h2 style={{ marginBottom: 4 }}>{title}</h2>

      {subtitle && (
        <p style={{ color: "#6b7280", marginTop: 0 }}>{subtitle}</p>
      )}

      {parentTitle && (
        <p style={{ color: "#6b7280", marginTop: 0 }}>
          {ui.map.parent}: {parentTitle}
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
          <h3 style={{ marginTop: 0 }}>{ui.map.diningInfo}</h3>
          <p style={{ color: "#4b5563" }}>{ui.map.diningHint}</p>
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
              {ui.map.viewExternal}
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
          <h3 style={{ marginTop: 0 }}>{ui.map.busInfo}</h3>
          <p style={{ color: "#4b5563" }}>{ui.map.busHint}</p>
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
              {ui.map.viewExternal}
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
          <h3 style={{ marginTop: 0 }}>{ui.map.eventInfo}</h3>
          <p>{formatRemainingTime(dynamicInfo.remainingSeconds)}</p>
        </section>
      )}

      {marker.children && marker.children.length > 0 && (
        <section style={{ marginTop: 16 }}>
          <h3>{ui.map.childPlaces}</h3>
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
                {getMarkerTitle(child, language)}
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
        {ui.map.directions}
      </button>
    </div>
  );
}
