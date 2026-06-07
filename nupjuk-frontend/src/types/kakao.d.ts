interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
  
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
  
        Map: new (
          container: HTMLElement,
          options: KakaoMapOptions
        ) => KakaoMap;
  
        Marker: new (options: KakaoMarkerOptions) => KakaoMarker;
  
        InfoWindow: new (
          options: KakaoInfoWindowOptions
        ) => KakaoInfoWindow;
  
        event: {
          addListener: (
            target: KakaoMarker | KakaoMap,
            type: string,
            handler: () => void
          ) => void;
        };
      };
    };
  }
  
  interface KakaoLatLng {}
  
  interface KakaoMapOptions {
    center: KakaoLatLng;
    level: number;
  }
  
  interface KakaoMap {
    setCenter: (latlng: KakaoLatLng) => void;
    setLevel: (level: number) => void;
    relayout: () => void;
  }
  
  interface KakaoMarkerOptions {
    position: KakaoLatLng;
    map?: KakaoMap | null;
    title?: string;
  }
  
  interface KakaoMarker {
    setMap: (map: KakaoMap | null) => void;
  }
  
  interface KakaoInfoWindowOptions {
    content: string;
  }
  
  interface KakaoInfoWindow {
    open: (map: KakaoMap, marker: KakaoMarker) => void;
    close: () => void;
  }