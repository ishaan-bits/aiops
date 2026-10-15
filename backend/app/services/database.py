from __future__ import annotations

import os
import sqlite3

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "app.db")


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = _connect()
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            storage_path TEXT NOT NULL,
            file_size INTEGER DEFAULT 0,
            chunk_count INTEGER DEFAULT 0,
            status TEXT DEFAULT 'uploaded',
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            created_at TEXT DEFAULT (datetime('now'))
        );
        """
    )
    conn.commit()
    conn.close()


# ── Documents ───────────────────────────────────────────────────────

def list_documents() -> list[dict]:
    conn = _connect()
    rows = conn.execute("SELECT * FROM documents ORDER BY id DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_document(doc_id: int) -> dict | None:
    conn = _connect()
    row = conn.execute("SELECT * FROM documents WHERE id = ?", (doc_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def create_document(filename: str, storage_path: str, file_size: int) -> dict:
    conn = _connect()
    cur = conn.execute(
        "INSERT INTO documents (filename, storage_path, file_size) VALUES (?, ?, ?)",
        (filename, storage_path, file_size),
    )
    conn.commit()
    doc_id = cur.lastrowid
    conn.close()
    return get_document(doc_id)


def update_document(doc_id: int, fields: dict) -> None:
    if not fields:
        return
    columns = ", ".join(f"{key} = ?" for key in fields)
    conn = _connect()
    conn.execute(
        f"UPDATE documents SET {columns} WHERE id = ?",
        (*fields.values(), doc_id),
    )
    conn.commit()
    conn.close()


def delete_document(doc_id: int) -> None:
    conn = _connect()
    conn.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
    conn.commit()
    conn.close()


# ── Users ───────────────────────────────────────────────────────────

def get_user(user_id: str) -> dict | None:
    conn = _connect()
    row = conn.execute("SELECT * FROM users WHERE user_id = ?", (user_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def upsert_user(user_id: str, password_hash: str, role: str) -> None:
    conn = _connect()
    conn.execute(
        """
        INSERT INTO users (user_id, password_hash, role) VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET password_hash = excluded.password_hash, role = excluded.role
        """,
        (user_id, password_hash, role),
    )
    conn.commit()
    conn.close()
