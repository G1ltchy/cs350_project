type KakaoLatLng = {
  getLat(): number;
  getLng(): number;
};

type KakaoLatLngBounds = {
  extend(position: KakaoLatLng): void;
};

type KakaoMapOptions = {
  center: KakaoLatLng;
  level: number;
};

type KakaoMap = {
  setCenter(position: KakaoLatLng): void;
  setLevel(level: number): void;
  getLevel(): number;
  relayout(): void;
  setBounds(bounds: KakaoLatLngBounds): void;
};

type KakaoMarkerOptions = {
  map?: KakaoMap;
  position: KakaoLatLng;
  title?: string;
};

type KakaoMarker = {
  setMap(map: KakaoMap | null): void;
  setPosition(position: KakaoLatLng): void;
};

type KakaoCustomOverlayOptions = {
  position: KakaoLatLng;
  content: string;
  yAnchor?: number;
  zIndex?: number;
};

type KakaoCustomOverlay = {
  setMap(map: KakaoMap | null): void;
};

declare global {
  interface Window {
    kakao?: {
      maps: {
        load(callback: () => void): void;

        LatLng: new (
          latitude: number,
          longitude: number
        ) => KakaoLatLng;

        LatLngBounds: new () => KakaoLatLngBounds;

        Map: new (
          container: HTMLElement,
          options: KakaoMapOptions
        ) => KakaoMap;

        Marker: new (options: KakaoMarkerOptions) => KakaoMarker;

        CustomOverlay: new (
          options: KakaoCustomOverlayOptions
        ) => KakaoCustomOverlay;

        event: {
          addListener(
            target: KakaoMap | KakaoMarker,
            type: string,
            callback: () => void
          ): void;
        };
      };
    };
  }
}

export {};