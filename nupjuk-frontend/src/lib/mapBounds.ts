export const KAIST_BOUNDS = {
  minLat: 36.362,
  maxLat: 36.382,
  minLng: 127.348,
  maxLng: 127.372
} as const;

export function latLngToPercent(lat: number, lng: number): { x: number; y: number } {
  const x =
    (lng - KAIST_BOUNDS.minLng) /
    (KAIST_BOUNDS.maxLng - KAIST_BOUNDS.minLng);
  const y =
    (KAIST_BOUNDS.maxLat - lat) /
    (KAIST_BOUNDS.maxLat - KAIST_BOUNDS.minLat);

  return {
    x: Math.min(1, Math.max(0, x)),
    y: Math.min(1, Math.max(0, y))
  };
}

export function percentToLatLng(x: number, y: number): { lat: number; lng: number } {
  const lng =
    KAIST_BOUNDS.minLng +
    Math.min(1, Math.max(0, x)) *
      (KAIST_BOUNDS.maxLng - KAIST_BOUNDS.minLng);
  const lat =
    KAIST_BOUNDS.maxLat -
    Math.min(1, Math.max(0, y)) *
      (KAIST_BOUNDS.maxLat - KAIST_BOUNDS.minLat);

  return {
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6))
  };
}

export function formatCoordinate(value: number): string {
  return value.toFixed(6);
}
