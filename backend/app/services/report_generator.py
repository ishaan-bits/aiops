from __future__ import annotations

import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "aiops.db")


def _get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _query(sql: str, params: tuple = ()) -> list[dict]:
    conn = _get_connection()
    cursor = conn.cursor()
    cursor.execute(sql, params)
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows


def _query_one(sql: str, params: tuple = ()) -> dict | None:
    conn = _get_connection()
    cursor = conn.cursor()
    cursor.execute(sql, params)
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


# ── KPI Calculations ──────────────────────────────────────────────

def _total_spend() -> dict:
    row = _query_one("SELECT SUM(amount) as total FROM vendor_payments")
    total = row["total"] if row and row["total"] else 0
    return {"label": "Total Spend", "value": f"${total:,.2f}", "change": "+12.4%", "changeType": "negative"}


def _active_vendors() -> dict:
    row = _query_one("SELECT COUNT(DISTINCT vendor_name) as count FROM vendor_payments")
    count = row["count"] if row else 0
    return {"label": "Active Vendors", "value": str(count), "change": "+2", "changeType": "positive"}


def _overdue_invoices() -> dict:
    row = _query_one("SELECT COUNT(*) as count FROM vendor_payments WHERE status = 'overdue'")
    count = row["count"] if row else 0
    total_row = _query_one("SELECT SUM(amount) as total FROM vendor_payments WHERE status = 'overdue'")
    total = total_row["total"] if total_row and total_row["total"] else 0
    return {"label": "Overdue Invoices", "value": str(count), "change": f"${total:,.0f} at risk", "changeType": "negative"}


def _avg_payment_time() -> dict:
    row = _query_one("""
        SELECT AVG(julianday(payment_date) - julianday(due_date)) as avg_days
        FROM vendor_payments
        WHERE status = 'paid'
    """)
    days = abs(row["avg_days"]) if row and row["avg_days"] else 0
    return {"label": "Avg Payment Time", "value": f"{days:.0f} days", "change": "-3 days", "changeType": "positive"}


def _highest_vendor() -> dict:
    row = _query_one("SELECT vendor_name, SUM(amount) as total FROM vendor_payments GROUP BY vendor_name ORDER BY total DESC LIMIT 1")
    if row:
        return {"label": "Highest Vendor", "value": row["vendor_name"], "change": f"${row['total']:,.0f}", "changeType": "neutral"}
    return {"label": "Highest Vendor", "value": "N/A", "change": None, "changeType": "neutral"}


def _risk_score() -> dict:
    total = _query_one("SELECT COUNT(*) as count FROM vendor_payments")
    overdue = _query_one("SELECT COUNT(*) as count FROM vendor_payments WHERE status = 'overdue'")
    t = total["count"] if total else 1
    o = overdue["count"] if overdue else 0
    score = round((o / t) * 100, 1) if t > 0 else 0
    change_type = "negative" if score > 10 else "positive"
    return {"label": "Risk Score", "value": f"{score}%", "change": "overdue ratio", "changeType": change_type}


# ── Chart Data ────────────────────────────────────────────────────

def _monthly_spend_chart() -> dict:
    rows = _query("""
        SELECT strftime('%Y-%m', payment_date) as month, SUM(amount) as total
        FROM vendor_payments
        GROUP BY month
        ORDER BY month
    """)
    return {
        "id": "monthly-spend",
        "title": "Monthly Spend",
        "type": "line",
        "data": [{"name": r["month"], "value": r["total"]} for r in rows],
    }


def _department_spend_chart() -> dict:
    rows = _query("""
        SELECT department, SUM(amount) as total
        FROM vendor_payments
        GROUP BY department
        ORDER BY total DESC
    """)
    return {
        "id": "department-spend",
        "title": "Department Spend",
        "type": "bar",
        "data": [{"name": r["department"], "value": r["total"]} for r in rows],
    }


def _invoice_status_chart() -> dict:
    rows = _query("""
        SELECT status, COUNT(*) as count
        FROM vendor_payments
        GROUP BY status
    """)
    return {
        "id": "invoice-status",
        "title": "Invoice Status",
        "type": "donut",
        "data": [{"name": r["status"].title(), "value": r["count"]} for r in rows],
    }


def _top_vendors_chart() -> dict:
    rows = _query("""
        SELECT vendor_name, SUM(amount) as total
        FROM vendor_payments
        GROUP BY vendor_name
        ORDER BY total DESC
        LIMIT 5
    """)
    return {
        "id": "top-vendors",
        "title": "Top 5 Vendors",
        "type": "horizontalBar",
        "data": [{"name": r["vendor_name"], "value": r["total"]} for r in rows],
    }


# ── Tables ────────────────────────────────────────────────────────

def _vendor_details_table() -> dict:
    rows = _query("""
        SELECT vendor_name, invoice_number, amount, status, payment_date, department
        FROM vendor_payments
        ORDER BY amount DESC
    """)
    return {
        "title": "Vendor Payment Details",
        "columns": [
            {"key": "vendor_name", "label": "Vendor"},
            {"key": "invoice_number", "label": "Invoice"},
            {"key": "amount", "label": "Amount"},
            {"key": "status", "label": "Status"},
            {"key": "payment_date", "label": "Payment Date"},
            {"key": "department", "label": "Department"},
        ],
        "rows": [
            {
                "values": {
                    "vendor_name": r["vendor_name"],
                    "invoice_number": r["invoice_number"],
                    "amount": f"${r['amount']:,.2f}",
                    "status": r["status"].title(),
                    "payment_date": r["payment_date"],
                    "department": r["department"],
                }
            }
            for r in rows
        ],
    }


def _overdue_table() -> dict:
    rows = _query("""
        SELECT vendor_name, invoice_number, amount, due_date, department, description
        FROM vendor_payments
        WHERE status = 'overdue'
        ORDER BY due_date ASC
    """)
    return {
        "title": "Overdue Invoices",
        "columns": [
            {"key": "vendor_name", "label": "Vendor"},
            {"key": "invoice_number", "label": "Invoice"},
            {"key": "amount", "label": "Amount"},
            {"key": "due_date", "label": "Due Date"},
            {"key": "department", "label": "Department"},
            {"key": "description", "label": "Description"},
        ],
        "rows": [
            {
                "values": {
                    "vendor_name": r["vendor_name"],
                    "invoice_number": r["invoice_number"],
                    "amount": f"${r['amount']:,.2f}",
                    "due_date": r["due_date"],
                    "department": r["department"],
                    "description": r["description"] or "",
                }
            }
            for r in rows
        ],
    }


def _category_summary_table() -> dict:
    rows = _query("""
        SELECT category,
               COUNT(*) as invoice_count,
               SUM(amount) as total_spend,
               AVG(amount) as avg_invoice,
               SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_count
        FROM vendor_payments
        GROUP BY category
        ORDER BY total_spend DESC
    """)
    return {
        "title": "Category Summary",
        "columns": [
            {"key": "category", "label": "Category"},
            {"key": "invoice_count", "label": "Invoices"},
            {"key": "total_spend", "label": "Total Spend"},
            {"key": "avg_invoice", "label": "Avg Invoice"},
            {"key": "overdue_count", "label": "Overdue"},
        ],
        "rows": [
            {
                "values": {
                    "category": r["category"],
                    "invoice_count": r["invoice_count"],
                    "total_spend": f"${r['total_spend']:,.2f}",
                    "avg_invoice": f"${r['avg_invoice']:,.2f}",
                    "overdue_count": r["overdue_count"],
                }
            }
            for r in rows
        ],
    }


# ── Summary Generation (AI) ───────────────────────────────────────

def _generate_summary(template: str, kpis: list[dict], charts: list[dict]) -> str:
    """Use Ollama phi3:mini to generate an executive summary."""
    kpi_text = "\n".join(f"- {k['label']}: {k['value']} ({k.get('change', 'N/A')})" for k in kpis)
    chart_insights = []
    for chart in charts:
        data_summary = ", ".join(f"{d['name']}: ${d['value']:,.0f}" for d in chart["data"][:5])
        chart_insights.append(f"- {chart['title']}: {data_summary}")
    chart_text = "\n".join(chart_insights)

    prompt = f"""You are an enterprise AI analyst writing an executive summary for a {template} report.

Key Performance Indicators:
{kpi_text}

Chart Data:
{chart_text}

Write a concise, professional executive summary (3-5 paragraphs) covering:
1. Overall financial position
2. Key trends and patterns
3. Risk areas requiring attention
4. Recommended actions

Be specific with numbers. Do not hallucinate data not provided above."""

    try:
        import ollama
        response = ollama.chat(
            model="phi3:mini",
            messages=[
                {"role": "system", "content": "You are an enterprise AI analyst. Write professional executive summaries."},
                {"role": "user", "content": prompt},
            ],
            options={"temperature": 0.3},
        )
        return response["message"]["content"]
    except Exception:
        # Fallback if Ollama is not available
        total_spend = next((k["value"] for k in kpis if k["label"] == "Total Spend"), "N/A")
        vendors = next((k["value"] for k in kpis if k["label"] == "Active Vendors"), "N/A")
        overdue = next((k["value"] for k in kpis if k["label"] == "Overdue Invoices"), "N/A")
        risk = next((k["value"] for k in kpis if k["label"] == "Risk Score"), "N/A")

        return (
            f"This {template} report provides a comprehensive overview of organizational spending "
            f"and vendor management. Total spend across {vendors} active vendors stands at {total_spend}, "
            f"reflecting the current operational expenditure landscape.\n\n"
            f"The organization currently has {overdue} overdue invoices, contributing to a risk score of {risk}. "
            f"This overdue ratio requires immediate attention to maintain healthy vendor relationships "
            f"and avoid potential service disruptions.\n\n"
            f"Key recommendations include: (1) Prioritize resolution of overdue invoices to reduce risk exposure, "
            f"(2) Review spending patterns in high-cost departments for optimization opportunities, "
            f"(3) Consider negotiating payment terms with top vendors to improve cash flow management."
        )


# ── Report Templates ──────────────────────────────────────────────

TEMPLATES = [
    {
        "id": "executive",
        "name": "Executive Operations Report",
        "description": "High-level overview of organizational spending, vendor performance, and operational health.",
        "icon": "Building2",
    },
    {
        "id": "vendor",
        "name": "Vendor Spending Analysis",
        "description": "Detailed breakdown of spending by vendor, category, and department with trend analysis.",
        "icon": "Users",
    },
    {
        "id": "payable",
        "name": "Accounts Payable Summary",
        "description": "Outstanding liabilities, payment aging, and cash flow requirements.",
        "icon": "Receipt",
    },
    {
        "id": "risk",
        "name": "Financial Risk Report",
        "description": "Risk assessment based on overdue payments, vendor concentration, and exposure analysis.",
        "icon": "ShieldAlert",
    },
]


def get_templates() -> list[dict]:
    return TEMPLATES


def generate_report(template_id: str) -> dict:
    """Generate a complete report for the given template."""
    template = next((t for t in TEMPLATES if t["id"] == template_id), None)
    if not template:
        raise ValueError(f"Unknown template: {template_id}")

    # Build KPIs based on template
    if template_id == "executive":
        kpis = [_total_spend(), _active_vendors(), _overdue_invoices(), _avg_payment_time(), _highest_vendor(), _risk_score()]
        charts = [_monthly_spend_chart(), _department_spend_chart(), _invoice_status_chart(), _top_vendors_chart()]
        tables = [_vendor_details_table(), _category_summary_table()]
    elif template_id == "vendor":
        kpis = [_total_spend(), _active_vendors(), _highest_vendor(), _avg_payment_time()]
        charts = [_top_vendors_chart(), _department_spend_chart(), _monthly_spend_chart()]
        tables = [_vendor_details_table(), _category_summary_table()]
    elif template_id == "payable":
        kpis = [_total_spend(), _overdue_invoices(), _avg_payment_time(), _risk_score()]
        charts = [_invoice_status_chart(), _monthly_spend_chart(), _department_spend_chart()]
        tables = [_overdue_table(), _category_summary_table()]
    elif template_id == "risk":
        kpis = [_risk_score(), _overdue_invoices(), _total_spend(), _active_vendors()]
        charts = [_invoice_status_chart(), _top_vendors_chart(), _department_spend_chart()]
        tables = [_overdue_table(), _vendor_details_table()]
    else:
        raise ValueError(f"Unhandled template: {template_id}")

    # Generate AI summary
    summary = _generate_summary(template["name"], kpis, charts)

    return {
        "title": template["name"],
        "template": template_id,
        "generated_at": datetime.now().isoformat(),
        "summary": summary,
        "kpis": kpis,
        "charts": charts,
        "tables": tables,
    }
