const API_BASE_URL = "http://localhost:8000";

export interface SQLGenerateResponse {
  sql: string;
  explanation: string;
}

export interface SQLExecuteResponse {
  columns: string[];
  rows: Record<string, unknown>[];
  row_count: number;
}

export interface TableSchema {
  table: string;
  columns: { name: string; type: string; notnull: boolean }[];
  sample: Record<string, unknown>[];
}

export async function generateSQL(question: string): Promise<SQLGenerateResponse> {
  const res = await fetch(`${API_BASE_URL}/sql/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Generation failed" }));
    throw new Error(err.detail || "Generation failed");
  }
  return res.json();
}

export async function executeSQL(sql: string): Promise<SQLExecuteResponse> {
  const res = await fetch(`${API_BASE_URL}/sql/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Execution failed" }));
    throw new Error(err.detail || "Execution failed");
  }
  return res.json();
}

export async function fetchSchema(): Promise<TableSchema> {
  const res = await fetch(`${API_BASE_URL}/sql/schema`);
  if (!res.ok) throw new Error("Failed to fetch schema");
  return res.json();
}
