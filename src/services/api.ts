const API_BASE_URL = "http://localhost:8000";

export interface UploadResponse {
  filename: string;
  size: number;
  status: string;
}

export async function uploadDocument(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "Upload failed",
    }));

    throw new Error(error.detail || "Upload failed");
  }

  return response.json();
}
