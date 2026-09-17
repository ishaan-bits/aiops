from __future__ import annotations

import sqlite3
import os
import re

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "aiops.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS vendor_payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vendor_name TEXT NOT NULL,
            invoice_number TEXT NOT NULL,
            amount REAL NOT NULL,
            currency TEXT NOT NULL DEFAULT 'USD',
            category TEXT NOT NULL,
            department TEXT NOT NULL,
            status TEXT NOT NULL,
            payment_date TEXT NOT NULL,
            due_date TEXT NOT NULL,
            description TEXT
        )
    """)

    cursor.execute("SELECT COUNT(*) FROM vendor_payments")
    if cursor.fetchone()[0] == 0:
        seed_data = [
            ("Acme Logistics", "INV-2024-0847", 184000.00, "USD", "Logistics", "Supply Chain", "paid", "2024-11-15", "2024-12-15", "Q4 freight charges"),
            ("TechVista Solutions", "INV-2024-0848", 92500.00, "USD", "Software", "IT", "paid", "2024-11-18", "2024-12-18", "Annual SaaS license renewal"),
            ("GreenLeaf Supplies", "INV-2024-0849", 34200.00, "USD", "Office Supplies", "Admin", "pending", "2024-11-20", "2024-12-20", "Office consumables bulk order"),
            ("Metro Transport Co.", "INV-2024-0850", 156750.00, "USD", "Logistics", "Supply Chain", "paid", "2024-11-22", "2024-12-22", "Regional distribution fees"),
            ("DataForge Inc.", "INV-2024-0851", 245000.00, "USD", "Software", "IT", "pending", "2024-11-25", "2024-12-25", "Data analytics platform"),
            ("SteelWorks Ltd.", "INV-2024-0852", 67800.00, "USD", "Raw Materials", "Manufacturing", "paid", "2024-11-28", "2024-12-28", "Steel components order"),
            ("CleanAir Services", "INV-2024-0853", 12400.00, "USD", "Facilities", "Admin", "overdue", "2024-10-01", "2024-11-01", "HVAC maintenance contract"),
            ("QuickPrint Media", "INV-2024-0854", 8900.00, "USD", "Marketing", "Marketing", "paid", "2024-11-30", "2024-12-30", "Marketing collateral printing"),
            ("Pacific Energy Corp.", "INV-2024-0855", 43200.00, "USD", "Utilities", "Facilities", "pending", "2024-12-01", "2025-01-01", "Electricity and gas Q4"),
            ("Global Telecom", "INV-2024-0856", 28750.00, "USD", "Telecom", "IT", "paid", "2024-12-03", "2025-01-03", "Enterprise phone system"),
            ("SafeGuard Security", "INV-2024-0857", 55600.00, "USD", "Security", "Facilities", "pending", "2024-12-05", "2025-01-05", "Security patrol services"),
            ("FreshBite Catering", "INV-2024-0858", 19800.00, "USD", "Hospitality", "Admin", "paid", "2024-12-08", "2025-01-08", "Annual company event catering"),
            ("Acme Logistics", "INV-2024-0859", 213500.00, "USD", "Logistics", "Supply Chain", "paid", "2024-12-10", "2025-01-10", "Express shipping premium"),
            ("TechVista Solutions", "INV-2024-0860", 147000.00, "USD", "Software", "IT", "pending", "2024-12-12", "2025-01-12", "Cloud infrastructure upgrade"),
            ("Metro Transport Co.", "INV-2024-0861", 89400.00, "USD", "Logistics", "Supply Chain", "overdue", "2024-10-15", "2024-11-15", "Warehouse transport fees"),
            ("SteelWorks Ltd.", "INV-2024-0862", 112300.00, "USD", "Raw Materials", "Manufacturing", "paid", "2024-12-15", "2025-01-15", "Aluminum alloy procurement"),
            ("GreenLeaf Supplies", "INV-2024-0863", 7650.00, "USD", "Office Supplies", "Admin", "pending", "2024-12-18", "2025-01-18", "Ergonomic desk accessories"),
            ("DataForge Inc.", "INV-2024-0864", 318000.00, "USD", "Software", "IT", "paid", "2024-12-20", "2025-01-20", "ML model training platform"),
            ("Pacific Energy Corp.", "INV-2024-0865", 51800.00, "USD", "Utilities", "Facilities", "overdue", "2024-10-20", "2024-11-20", "Utility billing correction"),
            ("Global Telecom", "INV-2024-0866", 34200.00, "USD", "Telecom", "IT", "pending", "2024-12-22", "2025-01-22", "5G network rollout Phase 2"),
            ("SafeGuard Security", "INV-2024-0867", 41200.00, "USD", "Security", "Facilities", "paid", "2024-12-24", "2025-01-24", "Access control system update"),
            ("Acme Logistics", "INV-2024-0868", 167300.00, "USD", "Logistics", "Supply Chain", "pending", "2024-12-27", "2025-01-27", "Year-end bulk shipment"),
            ("FreshBite Catering", "INV-2024-0869", 15400.00, "USD", "Hospitality", "Admin", "paid", "2024-12-28", "2025-01-28", "Holiday party catering"),
            ("QuickPrint Media", "INV-2024-0870", 22100.00, "USD", "Marketing", "Marketing", "pending", "2024-12-30", "2025-01-30", "Annual report design & print"),
        ]
        cursor.executemany(
            "INSERT INTO vendor_payments (vendor_name, invoice_number, amount, currency, category, department, status, payment_date, due_date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            seed_data,
        )

    conn.commit()
    conn.close()


def validate_sql(query: str) -> str | None:
    """Validate that the query is a SELECT statement. Returns error message or None."""
    cleaned = query.strip().rstrip(";")
    first_word = cleaned.split()[0].upper() if cleaned.split() else ""
    if first_word != "SELECT":
        return "Only SELECT statements are allowed."
    forbidden = ["INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "CREATE", "TRUNCATE", "GRANT", "REVOKE"]
    for keyword in forbidden:
        if re.search(rf"\b{keyword}\b", cleaned, re.IGNORECASE):
            if keyword != "SELECT":
                return f"Statement contains forbidden keyword: {keyword}"
    return None


def execute_query(query: str):
    """Execute a validated SELECT query and return results."""
    error = validate_sql(query)
    if error:
        raise ValueError(error)

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(query)
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        rows = [dict(row) for row in cursor.fetchall()]
        return {"columns": columns, "rows": rows}
    finally:
        conn.close()


def get_table_schema():
    """Return the schema of vendor_payments for SQL generation context."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(vendor_payments)")
    schema = [{"name": row["name"], "type": row["type"], "notnull": bool(row["notnull"])} for row in cursor.fetchall()]
    conn.close()
    return schema


def get_sample_data():
    """Return sample rows for context."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vendor_payments LIMIT 3")
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows


init_db()
