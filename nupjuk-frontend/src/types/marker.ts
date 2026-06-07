export type MarkerCategory =
  | "building"
  | "facility"
  | "dining"
  | "bus"
  | "event"
  | "cafe"
  | "library"
  | "etc";

export type DynamicType = "none" | "dining" | "bus" | "event";

export interface ParentMarkerInfo {
  _id: string;
  titleKo: string;
  titleEn?: string;
}

export interface CreatedByInfo {
  _id: string;
  username?: string;
}

export interface MarkerSummary {
  _id?: string;
  id?: string;

  titleKo: string;
  titleEn?: string;

  parentId?: string | ParentMarkerInfo | null;

  latitude: number;
  longitude: number;

  category: MarkerCategory;

  imageUrl?: string;

  status?: "active" | "inactive";

  createdBy?: string | CreatedByInfo;

  dynamicType?: DynamicType;

  externalUrl?: string;
}

export interface MarkerDetail extends MarkerSummary {
  markdownKo?: string;
  markdownEn?: string;

  activeFrom?: string | null;
  activeUntil?: string | null;

  createdAt?: string;
  updatedAt?: string;

  children?: MarkerSummary[];
}

export type DynamicInfoResponse =
  | {
      type: "bus";
      externalUrl: string | null;
    }
  | {
      type: "dining";
      externalUrl: string | null;
    }
  | {
      type: "event";
      activeUntil?: string | null;
      remainingSeconds: number | null;
    }
  | {
      type: "none";
    };

export function getMarkerId(marker: MarkerSummary): string {
  return marker.id ?? marker._id ?? "";
}
