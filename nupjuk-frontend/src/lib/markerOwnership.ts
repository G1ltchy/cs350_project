import { getAuthToken } from "./authToken";
import type { MarkerSummary } from "../types/marker";

type JwtPayload = {
  id?: string;
};

export function getAuthUserId(): string | null {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  try {
    const payloadSegment = token.split(".")[1];

    if (!payloadSegment) {
      return null;
    }

    const payload = JSON.parse(atob(payloadSegment)) as JwtPayload;
    return payload.id ?? null;
  } catch {
    return null;
  }
}

export function getMarkerCreatedById(
  createdBy: MarkerSummary["createdBy"]
): string | null {
  if (!createdBy) {
    return null;
  }

  if (typeof createdBy === "string") {
    return createdBy;
  }

  return createdBy._id ?? null;
}

export function isOwnMarker(marker: MarkerSummary): boolean {
  const userId = getAuthUserId();
  const createdById = getMarkerCreatedById(marker.createdBy);

  if (!userId || !createdById) {
    return false;
  }

  return userId === createdById;
}
