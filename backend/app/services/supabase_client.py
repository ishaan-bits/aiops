"""Supabase client — Storage (REST) + Database (direct PostgreSQL).

Storage uses HTTP against the Supabase Storage REST API.
Database uses psycopg2 direct connection — bypasses PostgREST and RLS entirely.
"""
from __future__ import annotations

import json
import logging
import os
import urllib.request
import urllib.error
from typing import Any, Dict, List, Optional

log = logging.getLogger(__name__)

SUPABASE_BUCKET = "documents"

# ── Config ───────────────────────────────────────────────────────────────

def _get_storage_config() -> tuple[str, str]:
    return (
        os.getenv("SUPABASE_URL", ""),
        os.getenv("SUPABASE_SERVICE_KEY", ""),
    )


def _get_db_config() -> str:
    """Return the direct PostgreSQL connection string."""
    return os.getenv("SUPABASE_DB_URL", "")


# ── Storage (HTTP REST) ─────────────────────────────────────────────────

def storage_upload(file_bytes: bytes, storage_path: str, content_type: str = "application/octet-stream") -> None:
    url, key = _get_storage_config()
    if not url or not key:
        raise RuntimeError("Supabase Storage not configured (SUPABASE_URL / SUPABASE_SERVICE_KEY)")

    upload_url = f"{url}/storage/v1/object/{SUPABASE_BUCKET}/{storage_path}"
    req = urllib.request.Request(upload_url, data=file_bytes, method="POST")
    req.add_header("apikey", key)
    req.add_header("Authorization", f"Bearer {key}")
    req.add_header("Content-Type", content_type)
    req.add_header("x-upsert", "false")

    try:
        with urllib.request.urlopen(req) as resp:
            resp.read()
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        raise RuntimeError(f"Storage upload failed ({e.code}): {err[:500]}")


def storage_delete(storage_path: str) -> None:
    url, key = _get_storage_config()
    if not url or not key:
        return

    delete_url = f"{url}/storage/v1/object/{SUPABASE_BUCKET}/{storage_path}"
    req = urllib.request.Request(delete_url, method="DELETE")
    req.add_header("apikey", key)
    req.add_header("Authorization", f"Bearer {key}")

    try:
        with urllib.request.urlopen(req) as resp:
            resp.read()
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return
        err = e.read().decode()
        raise RuntimeError(f"Storage delete failed ({e.code}): {err[:500]}")


def storage_download(storage_path: str) -> bytes:
    url, key = _get_storage_config()
    if not url or not key:
        raise RuntimeError("Supabase Storage not configured")

    download_url = f"{url}/storage/v1/object/{SUPABASE_BUCKET}/{storage_path}"
    req = urllib.request.Request(download_url)
    req.add_header("apikey", key)
    req.add_header("Authorization", f"Bearer {key}")

    try:
        with urllib.request.urlopen(req) as resp:
            return resp.read()
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Storage download failed ({e.code}): {storage_path}")


# ── Database (direct PostgreSQL — bypasses RLS) ─────────────────────────

def _get_db_conn():
    import psycopg2
    conn_str = _get_db_config()
    if not conn_str:
        raise RuntimeError("SUPABASE_DB_URL not configured")
    return psycopg2.connect(conn_str)


def create_document(filename: str, storage_path: str, file_size: int) -> Dict:
    conn = _get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO public.documents (filename, storage_path, file_size, status)
                   VALUES (%s, %s, %s, 'uploaded')
                   RETURNING id, filename, storage_path, file_size, chunk_count, status, created_at""",
                (filename, storage_path, file_size),
            )
            row = cur.fetchone()
            conn.commit()
            cols = [desc[0] for desc in cur.description]
            result = dict(zip(cols, row))
            log.info("create_document OK: id=%s", result["id"])
            return result
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def list_documents() -> List[Dict]:
    conn = _get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, filename, storage_path, file_size, chunk_count, status, created_at "
                "FROM public.documents ORDER BY created_at DESC"
            )
            cols = [desc[0] for desc in cur.description]
            return [dict(zip(cols, row)) for row in cur.fetchall()]
    finally:
        conn.close()


def get_document(doc_id: int) -> Optional[Dict]:
    conn = _get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, filename, storage_path, file_size, chunk_count, status, created_at "
                "FROM public.documents WHERE id = %s",
                (doc_id,),
            )
            row = cur.fetchone()
            if not row:
                return None
            cols = [desc[0] for desc in cur.description]
            return dict(zip(cols, row))
    finally:
        conn.close()


def delete_document(doc_id: int) -> None:
    conn = _get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM public.documents WHERE id = %s", (doc_id,))
            conn.commit()
    finally:
        conn.close()


def update_document(doc_id: int, updates: Dict) -> None:
    if not updates:
        return
    set_clause = ", ".join(f"{k} = %s" for k in updates)
    values = list(updates.values()) + [doc_id]
    conn = _get_db_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(f"UPDATE public.documents SET {set_clause} WHERE id = %s", values)
            conn.commit()
    finally:
        conn.close()
