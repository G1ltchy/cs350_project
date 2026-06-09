import type { MouseEvent } from "react";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "../context/LanguageContext";
import { getUi } from "../i18n/ui";
import {
  formatCoordinate,
  latLngToPercent,
  percentToLatLng
} from "../lib/mapBounds";
import { getMarkerTitle } from "../lib/markerDisplay";
import type { MarkerSummary } from "../types/marker";
import { getMarkerId } from "../types/marker";

type MapLocationPickerProps = {
  markers: MarkerSummary[];
  latitude?: string;
  longitude?: string;
  onLocationPick?: (latitude: string, longitude: string) => void;
  highlightedMarkerId?: string;
  onMarkerClick?: (marker: MarkerSummary) => void;
  showPickHint?: boolean;
};

export default function MapLocationPicker({
  markers,
  latitude = "",
  longitude = "",
  onLocationPick,
  highlightedMarkerId,
  onMarkerClick,
  showPickHint = true
}: MapLocationPickerProps) {
  const { language } = useLanguage();
  const ui = getUi(language);
  const create = ui.createMarker;
  const isPickMode = Boolean(onLocationPick);

  const selectedLat = latitude.trim() === "" ? null : Number(latitude);
  const selectedLng = longitude.trim() === "" ? null : Number(longitude);

  const selectedPosition =
    selectedLat !== null &&
    selectedLng !== null &&
    Number.isFinite(selectedLat) &&
    Number.isFinite(selectedLng)
      ? latLngToPercent(selectedLat, selectedLng)
      : null;

  function handleMapClick(event: MouseEvent<HTMLDivElement>) {
    if (!onLocationPick) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const { lat, lng } = percentToLatLng(x, y);

    onLocationPick(formatCoordinate(lat), formatCoordinate(lng));
  }

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        height: "100%",
        position: "relative",
        background: "#dbeafe"
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 2
        }}
      >
        <LanguageToggle />
      </div>

      <div
        role={isPickMode ? "button" : undefined}
        tabIndex={isPickMode ? 0 : undefined}
        aria-label={isPickMode ? create.mapClickHint : undefined}
        onClick={handleMapClick}
        onKeyDown={
          isPickMode
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  const { lat, lng } = percentToLatLng(0.5, 0.5);
                  onLocationPick?.(formatCoordinate(lat), formatCoordinate(lng));
                }
              }
            : undefined
        }
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          cursor: isPickMode ? "crosshair" : "default",
          background:
            "linear-gradient(180deg, #ecfdf5 0%, #dbeafe 45%, #e5e7eb 100%)",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "8% 6%",
            border: "2px solid rgba(255, 255, 255, 0.8)",
            borderRadius: 16,
            background: "rgba(255, 255, 255, 0.25)"
          }}
        />

        {markers.map((marker) => {
          const markerId = getMarkerId(marker);
          const { x, y } = latLngToPercent(marker.latitude, marker.longitude);
          const isHighlighted = highlightedMarkerId === markerId;

          return (
            <button
              key={markerId}
              type="button"
              title={getMarkerTitle(marker, language)}
              onClick={(event) => {
                event.stopPropagation();
                onMarkerClick?.(marker);
              }}
              style={{
                position: "absolute",
                left: `${x * 100}%`,
                top: `${y * 100}%`,
                transform: "translate(-50%, -100%)",
                padding: isHighlighted ? "4px 6px" : 0,
                border: "none",
                borderRadius: isHighlighted ? 8 : 0,
                background: isHighlighted ? "#fb923c" : "transparent",
                fontSize: 18,
                cursor: onMarkerClick ? "pointer" : "default",
                pointerEvents: onMarkerClick ? "auto" : "none",
                boxShadow: isHighlighted
                  ? "0 0 0 2px rgba(251, 146, 60, 0.45)"
                  : "none",
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))"
              }}
            >
              📍
            </button>
          );
        })}

        {selectedPosition && isPickMode && (
          <div
            style={{
              position: "absolute",
              left: `${selectedPosition.x * 100}%`,
              top: `${selectedPosition.y * 100}%`,
              transform: "translate(-50%, -50%)",
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#ef4444",
              border: "3px solid #ffffff",
              boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.35)",
              pointerEvents: "none"
            }}
          />
        )}

        {showPickHint && isPickMode && (
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
              pointerEvents: "none"
            }}
          >
            {create.mapClickHint}
          </div>
        )}
      </div>

      <p
        style={{
          position: "absolute",
          left: 12,
          bottom: 12,
          margin: 0,
          padding: "6px 10px",
          borderRadius: 8,
          background: "rgba(255, 255, 255, 0.9)",
          fontSize: 11,
          color: "#6b7280"
        }}
      >
        {ui.map.mapPlaceholder}
      </p>
    </div>
  );
}
