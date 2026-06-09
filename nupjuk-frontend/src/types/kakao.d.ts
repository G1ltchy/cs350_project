export {};

declare global {
  type KakaoLatLng = {
    getLat(): number;
    getLng(): number;
  };

  type KakaoMouseEvent = {
    latLng: KakaoLatLng;
  };

  type KakaoMapOptions = {
    center: KakaoLatLng;
    level: number;
  };

  type KakaoMap = {
    setCenter(position: KakaoLatLng): void;
    setLevel(level: number): void;
    getLevel?(): number;
    relayout(): void;
  };

  type KakaoMarkerOptions = {
    position: KakaoLatLng;
    map?: KakaoMap | null;
    title?: string;
  };

  type KakaoMarker = {
    setMap(map: KakaoMap | null): void;
  };

  type KakaoInfoWindowOptions = {
    content: string;
  };

  type KakaoInfoWindow = {
    open(map: KakaoMap, marker: KakaoMarker): void;
    close(): void;
  };

  type KakaoCustomOverlayOptions = {
    position: KakaoLatLng;
    content: string | HTMLElement;
    map?: KakaoMap | null;
    yAnchor?: number;
    xAnchor?: number;
    zIndex?: number;
  };

  type KakaoCustomOverlay = {
    setMap(map: KakaoMap | null): void;
    setPosition(position: KakaoLatLng): void;
  };

  interface Window {
    kakao?: {
      maps: {
        load(callback: () => void): void;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMap;
        Marker: new (options: KakaoMarkerOptions) => KakaoMarker;
        InfoWindow: new (options: KakaoInfoWindowOptions) => KakaoInfoWindow;
        CustomOverlay: new (
          options: KakaoCustomOverlayOptions
        ) => KakaoCustomOverlay;
        event: {
          addListener(
            target: KakaoMarker | KakaoMap,
            type: string,
            handler: (event?: KakaoMouseEvent) => void
          ): void;
          removeListener(
            target: KakaoMarker | KakaoMap,
            type: string,
            handler: (event?: KakaoMouseEvent) => void
          ): void;
        };
      };
    };
  }
}
