const API_BASE_URL = "http://localhost:8000";

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface KPI {
  label: string;
  value: string;
  change: string | null;
  changeType: "positive" | "negative" | "neutral";
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface Chart {
  id: string;
  title: string;
  type: "line" | "bar" | "donut" | "horizontalBar";
  data: ChartDataPoint[];
}

export interface TableColumn {
  key: string;
  label: string;
}

export interface TableRow {
  values: Record<string, string | number>;
}

export interface Table {
  title: string;
  columns: TableColumn[];
  rows: TableRow[];
}

export interface ReportResponse {
  title: string;
  template: string;
  generated_at: string;
  summary: string;
  kpis: KPI[];
  charts: Chart[];
  tables: Table[];
}

export async function fetchReportTemplates(): Promise<ReportTemplate[]> {
  const res = await fetch(`${API_BASE_URL}/reports/templates`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to fetch templates" }));
    throw new Error(err.detail || "Failed to fetch templates");
  }
  return res.json();
}

export async function generateReport(templateId: string): Promise<ReportResponse> {
  const res = await fetch(`${API_BASE_URL}/reports/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ template: templateId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to generate report" }));
    throw new Error(err.detail || "Failed to generate report");
  }
  return res.json();
}
