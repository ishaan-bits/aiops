const API_BASE_URL = "http://localhost:8000";

export interface RAGSource {
  document: string;
  page: number;
  score: number;
}

export interface RAGAskResponse {
  answer: string;
  sources: RAGSource[];
}

export interface RAGIndexResponse {
  document_id: number;
  filename: string;
  chunks_indexed: number;
}

export async function indexDocument(documentId: number): Promise<RAGIndexResponse> {
  const res = await fetch(`${API_BASE_URL}/rag/index/${documentId}`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Indexing failed" }));
    throw new Error(err.detail || "Indexing failed");
  }
  return res.json();
}

export async function askQuestion(question: string): Promise<RAGAskResponse> {
  const res = await fetch(`${API_BASE_URL}/rag/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Query failed" }));
    throw new Error(err.detail || "Query failed");
  }
  return res.json();
}
