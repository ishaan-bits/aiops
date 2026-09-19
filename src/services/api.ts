import { getSupabase } from "@/lib/supabase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface UploadResponse {
  filename: string;
  size: number;
  status: string;
  document_id: number;
}

export interface DocumentItem {
  id: number;
  filename: string;
  storage_path: string;
  file_size: number;
  status: string;
  created_at: string;
}

export async function fetchDocuments(): Promise<DocumentItem[]> {
  const res = await fetch(`${API_BASE_URL}/documents`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to load documents" }));
    throw new Error(error.detail || "Failed to load documents");
  }
  return res.json();
}

export async function uploadDocument(file: File): Promise<UploadResponse> {
  const ext = file.name.split(".").pop() || "bin";
  const uuid = crypto.randomUUID();
  const storagePath = `${uuid}.${ext}`;

  const { error: uploadError } = await getSupabase()
    .storage
    .from("documents")
    .upload(storagePath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Supabase upload failed: ${uploadError.message}`);
  }

  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      storage_path: storagePath,
      size: file.size,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(error.detail || "Upload failed");
  }

  return res.json();
}
