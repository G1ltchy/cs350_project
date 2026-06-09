import type { MarkerSummary } from "../types/marker";
import type { Language } from "./language";

export { getMarkerId } from "../types/marker";

type BilingualMarker = {
  titleKo: string;
  titleEn?: string;
  markdownKo?: string;
  markdownEn?: string;
};

type BilingualParent = {
  titleKo: string;
  titleEn?: string;
};

/** 선택 언어 제목, 없으면 다른 언어로 폴백 (기존 MarkerDetailView 패턴) */
export function getMarkerTitle(marker: BilingualMarker, language: Language): string {
  if (language === "en") {
    return marker.titleEn?.trim() || marker.titleKo;
  }
  return marker.titleKo;
}

/** 주언어가 아닌 부제목 (있을 때만) */
export function getMarkerSubtitle(
  marker: BilingualMarker,
  language: Language
): string | null {
  const primary = getMarkerTitle(marker, language);

  if (language === "en") {
    return marker.titleKo !== primary ? marker.titleKo : null;
  }

  const en = marker.titleEn?.trim();
  return en && en !== primary ? en : null;
}

export function getMarkerMarkdown(
  marker: BilingualMarker,
  language: Language,
  emptyFallback: string
): string {
  if (language === "en") {
    return marker.markdownEn?.trim() || marker.markdownKo?.trim() || emptyFallback;
  }
  return marker.markdownKo?.trim() || marker.markdownEn?.trim() || emptyFallback;
}

export function getParentTitle(
  parentId: MarkerSummary["parentId"],
  language: Language
): string | null {
  if (!parentId || typeof parentId === "string") {
    return null;
  }

  return getMarkerTitle(parentId, language);
}
