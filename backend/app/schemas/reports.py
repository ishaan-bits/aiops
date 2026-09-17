from __future__ import annotations

from typing import Dict, List, Optional, Union

from pydantic import BaseModel


class ReportTemplate(BaseModel):
    id: str
    name: str
    description: str
    icon: str


class KPI(BaseModel):
    label: str
    value: str
    change: Optional[str] = None
    changeType: str = "neutral"  # "positive", "negative", "neutral"


class ChartDataPoint(BaseModel):
    name: str
    value: float


class Chart(BaseModel):
    id: str
    title: str
    type: str  # "line", "bar", "donut", "horizontalBar"
    data: List[ChartDataPoint]


class TableColumn(BaseModel):
    key: str
    label: str


class TableRow(BaseModel):
    values: Dict[str, Union[str, float, int]]


class Table(BaseModel):
    title: str
    columns: List[TableColumn]
    rows: List[TableRow]


class ReportResponse(BaseModel):
    title: str
    template: str
    generated_at: str
    summary: str
    kpis: List[KPI]
    charts: List[Chart]
    tables: List[Table]


class ReportGenerateRequest(BaseModel):
    template: str
