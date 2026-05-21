import axios from "axios";
import type {
  DynamicInfoResponse,
  MarkerDetail,
  MarkerSummary
} from "../types/marker";

const API_BASE_URL = "http://localhost:3000/api";

export async function fetchMarkers(): Promise<MarkerSummary[]> {
  const response = await axios.get<MarkerSummary[]>(
    `${API_BASE_URL}/markers?includeChildren=true`
  );

  return response.data;
}

export async function fetchMarkerDetail(id: string): Promise<MarkerDetail> {
  const response = await axios.get<MarkerDetail>(
    `${API_BASE_URL}/markers/${id}`
  );

  return response.data;
}

export async function fetchMarkerDynamicInfo(
  id: string
): Promise<DynamicInfoResponse> {
  const response = await axios.get<DynamicInfoResponse>(
    `${API_BASE_URL}/markers/${id}/dynamic`
  );

  return response.data;
}