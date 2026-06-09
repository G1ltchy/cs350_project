import { apiClient } from "./client";
import type { CreateMarkerBody, CreateMarkerResponse, UpdateMarkerBody } from "../types/adminMarker";
import type { MarkerDetail } from "../types/marker";

export async function createMarker(
  body: CreateMarkerBody
): Promise<CreateMarkerResponse> {
  const response = await apiClient.post<CreateMarkerResponse>(
    "/admin/markers",
    body
  );

  return response.data;
}

export async function fetchAdminMarkerDetail(
  markerId: string
): Promise<MarkerDetail> {
  const response = await apiClient.get<MarkerDetail>(
    `/admin/markers/${markerId}`
  );

  return response.data;
}

export async function updateMarker(
  markerId: string,
  body: UpdateMarkerBody
): Promise<CreateMarkerResponse> {
  const response = await apiClient.put<CreateMarkerResponse>(
    `/admin/markers/${markerId}`,
    body
  );

  return response.data;
}

export async function deleteMarker(markerId: string): Promise<void> {
  await apiClient.delete(`/admin/markers/${markerId}`);
}
