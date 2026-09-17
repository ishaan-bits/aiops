from __future__ import annotations

import re

from fastapi import APIRouter, HTTPException

from ..schemas.sql import (
    SQLExecuteRequest,
    SQLExecuteResponse,
    SQLGenerateRequest,
    SQLGenerateResponse,
)
from ..services.sql import execute_query, get_sample_data, get_table_schema

router = APIRouter(prefix="/sql", tags=["sql"])

AGG_MAP = {
    "total": "SUM(amount)",
    "sum": "SUM(amount)",
    "average": "AVG(amount)",
    "avg": "AVG(amount)",
    "count": "COUNT(*)",
    "number": "COUNT(*)",
    "how many": "COUNT(*)",
    "maximum": "MAX(amount)",
    "max": "MAX(amount)",
    "minimum": "MIN(amount)",
    "min": "MIN(amount)",
    "highest": "MAX(amount)",
    "lowest": "MIN(amount)",
    "largest": "MAX(amount)",
    "smallest": "MIN(amount)",
}

COL_MAP = {
    "vendor": "vendor_name",
    "vendors": "vendor_name",
    "vendor_name": "vendor_name",
    "category": "category",
    "categories": "category",
    "department": "department",
    "departments": "department",
    "status": "status",
    "payment_status": "status",
    "invoice": "invoice_number",
    "invoices": "invoice_number",
    "date": "payment_date",
    "payment_date": "payment_date",
    "due_date": "due_date",
    "description": "description",
}

STATUS_VALUES = {"overdue", "pending", "paid"}


def _clean(text: str) -> str:
    """Strip trailing punctuation and extra whitespace."""
    return re.sub(r"[?!.,;:]+$", "", text).strip()


def _resolve_col(word: str) -> str | None:
    """Map a natural-language word to a column name."""
    w = _clean(word).lower()
    return COL_MAP.get(w)


def _find_agg(text: str) -> tuple[str, str] | None:
    """Find an aggregate function mention in text. Returns (agg_sql, label)."""
    t = text.lower()
    for key, sql in AGG_MAP.items():
        if key in t:
            return sql, key
    return None


def generate_sql(question: str) -> tuple[str, str]:
    q = _clean(question)
    select_parts: list[str] = []
    group_by: list[str] = []
    where_clauses: list[str] = []
    order_by: list[str] = []
    is_aggregate = False
    agg_label = ""

    # Detect status filters
    q_lower = q.lower()
    for status in STATUS_VALUES:
        if status in q_lower:
            where_clauses.append(f"status = '{status}'")

    # Detect LIMIT ("top N", "first N", "limit N")
    limit_match = re.search(r"(?:top|first|limit)\s+(\d+)", q_lower)
    limit = int(limit_match.group(1)) if limit_match else None

    # Detect aggregate — skip if "top N" is used (implies individual rows)
    agg = _find_agg(q) if not limit else None
    if agg:
        agg_sql, agg_label = agg
        is_aggregate = True

        # Detect group-by after "by" / "per" / "for each" etc.
        group_match = re.search(
            r"(?:by|per|for each|grouped by|broken down by)\s+([a-z_]+)",
            q_lower,
        )
        if group_match:
            col = _resolve_col(group_match.group(1))
            if col:
                select_parts.append(col)
                group_by.append(col)
                select_parts.append(f"{agg_sql} AS result")
            else:
                select_parts.append(f"{agg_sql} AS result")
        else:
            select_parts.append(f"{agg_sql} AS result")
    else:
        # Non-aggregate: detect column mentions
        for keyword, col in COL_MAP.items():
            if re.search(rf"\b{re.escape(keyword)}\b", q_lower):
                if col not in select_parts:
                    select_parts.append(col)

        if not select_parts:
            select_parts.append("*")

    # Detect explicit group-by (even without aggregate)
    if not group_by:
        gb_match = re.search(
            r"(?:group\s+by|per|for each)\s+([a-z_]+)",
            q_lower,
        )
        if gb_match:
            col = _resolve_col(gb_match.group(1))
            if col and col not in select_parts:
                select_parts.insert(0, col)
                group_by.append(col)

    # Detect WHERE from "where" clause
    where_match = re.search(r"where\s+(.+?)(?:\s+and\b|\s+order\b|\s+group\b|$)", q_lower)
    if where_match:
        where_text = where_match.group(1).strip()
        for keyword, col in COL_MAP.items():
            if keyword in where_text:
                val_match = re.search(
                    rf"{keyword}\s+(?:is\s+)?['\"]?([a-z][\w\s]*?)['\"]?(?:\s+and\b|\s+order\b|$)",
                    where_text,
                    re.IGNORECASE,
                )
                if val_match:
                    val = val_match.group(1).strip()
                    if val.lower() not in STATUS_VALUES:
                        where_clauses.append(f"{col} = '{val}'")
                break

    # Detect ORDER BY
    order_match = re.search(r"order\s+by\s+([a-z_]+)\s*(asc|desc)?", q_lower)
    if order_match:
        col = _resolve_col(order_match.group(1))
        direction = (order_match.group(2) or "asc").upper()
        if col:
            order_by.append(f"{col} {direction}")
    elif limit and not is_aggregate:
        order_by.append("amount DESC")
    elif is_aggregate and not group_by:
        order_by.append("result DESC")

    # Build SQL
    sql = f"SELECT {', '.join(select_parts)} FROM vendor_payments"
    if where_clauses:
        sql += f" WHERE {' AND '.join(where_clauses)}"
    if group_by:
        sql += f" GROUP BY {', '.join(group_by)}"
    if order_by:
        sql += f" ORDER BY {', '.join(order_by)}"
    if limit:
        sql += f" LIMIT {limit}"
    sql += ";"

    # Build explanation
    parts: list[str] = []
    if is_aggregate:
        parts.append(f"Calculates {agg_label} across records")
    else:
        parts.append("Retrieves records from vendor_payments")
    if where_clauses:
        parts.append(f"filtered by {', '.join(where_clauses)}")
    if group_by:
        parts.append(f"grouped by {', '.join(group_by)}")
    if order_by:
        parts.append(f"ordered by {', '.join(order_by)}")
    if limit:
        parts.append(f"limited to {limit} rows")

    explanation = ". ".join(parts) + "." if parts else "SELECT query."
    return sql, explanation


@router.post("/generate", response_model=SQLGenerateResponse)
async def generate_sql_query(request: SQLGenerateRequest):
    sql, explanation = generate_sql(request.question)
    return SQLGenerateResponse(sql=sql, explanation=explanation)


@router.post("/execute", response_model=SQLExecuteResponse)
async def execute_sql_query(request: SQLExecuteRequest):
    try:
        result = execute_query(request.sql)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return SQLExecuteResponse(
        columns=result["columns"],
        rows=result["rows"],
        row_count=len(result["rows"]),
    )


@router.get("/schema")
async def get_schema():
    return {
        "table": "vendor_payments",
        "columns": get_table_schema(),
        "sample": get_sample_data(),
    }
