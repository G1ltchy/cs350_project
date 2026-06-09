import { useCallback, useMemo } from "react";
import { formatCoordinate } from "../lib/mapBounds";
import type { MarkerSummary } from "../types/marker";
import KakaoMapView from "./KakaoMapView";
import LanguageToggle from "./LanguageToggle";

type MarkerLocationMapPanelProps = {
  markers: MarkerSummary[];
  latitude: string;
  longitude: string;
  onLatitudeChange: (value: string) => void;
  onLongitudeChange: (value: string) => void;
};

export default function MarkerLocationMapPanel({
  markers,
  latitude,
  longitude,
  onLatitudeChange,
  onLongitudeChange
}: MarkerLocationMapPanelProps) {
  const pickedLocation = useMemo(() => {
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      latitude.trim() !== "" &&
      longitude.trim() !== "" &&
      Number.isFinite(lat) &&
      Number.isFinite(lng)
    ) {
      return { latitude: lat, longitude: lng };
    }

    return null;
  }, [latitude, longitude]);

  const handleLocationPick = useCallback(
    (lat: number, lng: number) => {
      onLatitudeChange(formatCoordinate(lat));
      onLongitudeChange(formatCoordinate(lng));
    },
    [onLatitudeChange, onLongitudeChange]
  );

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        height: "100%",
        position: "relative"
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 10
        }}
      >
        <LanguageToggle />
      </div>

      <KakaoMapView
        markers={markers}
        pickMode
        showPickHint
        pickedLocation={pickedLocation}
        defaultCenter={pickedLocation ?? undefined}
        onLocationPick={handleLocationPick}
      />
    </div>
  );
}
