import { apiClient } from "./client";
import type { UploadImageResponse } from "../types/upload";

export async function uploadMarkerImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await apiClient.post<UploadImageResponse>(
    "/admin/upload/image",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" }
    }
  );

  return response.data.imageUrl;
}
