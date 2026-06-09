import type { DynamicType, MarkerCategory } from "./marker";

/** POST /api/admin/markers 요청 body (adminMarkerController createMarkerSchema) */
export type CreateMarkerBody = {
  titleKo: string;
  titleEn?: string;
  parentId?: string | null;
  latitude: number;
  longitude: number;
  category: MarkerCategory;
  markdownKo: string;
  markdownEn?: string;
  imageUrl?: string;
  activeFrom?: string;
  activeUntil?: string;
  dynamicType?: DynamicType;
  externalUrl?: string;
};

export type CreateMarkerResponse = CreateMarkerBody & {
  _id: string;
  status: "active" | "inactive";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateMarkerBody = Partial<CreateMarkerBody>;
