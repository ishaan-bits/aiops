"""Reusable Supabase admin client using service role key.

Provides Storage and DB operations via REST API.
No Python SDK dependency — uses stdlib urllib only.
"""
from __future__ import annotations

import json
import logging
import os
import traceback
import urllib.request
import urllib.error
from typing import Any, Dict, List, Optional

log = logging.getLogger(__name__)

SUPABASE_BUCKET = "documents"


def _get_config():
    return (
        os.getenv("SUPABASE_URL", ""),
        os.getenv("SUPABASE_SERVICE_KEY", ""),
    )


def _rest_request(
    method: str, path: str, body: Any = None, params: str = "", extra_headers: Optional[Dict] = None
) -> Any:
    url, key = _get_config()
    if not url or not key:
        raise RuntimeError("Supabase credentials not configured (SUPABASE_URL / SUPABASE_SERVICE_KEY)")

    full_url = f"{url}/rest/v1/{path}"
    if params:
        full_url += f"?{params}"

    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(full_url, data=data, method=method)
    req.add_header("apikey", key)
    req.add_header("Authorization", f"Bearer {key}")
    req.add_header("Content-Type", "application/json")
    req.add_header("Prefer", "return=representation")
    if extra_headers:
        for k, v in extra_headers.items():
            req.add_header(k, v)

    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read().decode()
            return json.loads(raw) if raw else []
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        log.error("Supabase REST %s %s → %d: %s", method, full_url, e.code, err_body[:500])
        raise RuntimeError(f"Supabase REST error {e.code}: {err_body[:500]}")


# ── Schema introspection ────────────────────────────────────────────────

def get_documents_table_columns() -> List[Dict]:
    """Query information_schema to discover the actual columns on public.documents."""
    url, key = _get_config()
    if not url or not key:
        raise RuntimeError("Supabase credentials not configured")

    query = (
        "SELECT column_name, data_type, is_nullable, column_default "
        "FROM information_schema.columns "
        "WHERE table_schema = 'public' AND table_name = 'documents' "
        "ORDER BY ordinal_position"
    )
    rpc_url = f"{url}/rest/v1/rpc/get_documents_columns"
    payload = json.dumps({"query_text": query}).encode()

    req = urllib.request.Request(rpc_url, data=payload, method="POST")
    req.add_header("apikey", key)
    req.add_header("Authorization", f"Bearer {key}")
    req.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError:
        pass

    # Fallback: use the PostgREST introspection via SELECT with limit 0
    # This tells us what columns PostgREST sees
    introspect_url = f"{url}/rest/v1/documents?select=*&limit=0"
    req2 = urllib.request.Request(introspect_url)
    req2.add_header("apikey", key)
    req2.add_header("Authorization", f"Bearer {key}")

    try:
        with urllib.request.urlopen(req2) as resp:
            # PostgREST returns column info in response headers or body
            body = resp.read().decode()
            log.info("documents table introspection (limit=0): %s", body[:500])
            return []
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        log.error("documents table introspection failed: %d %s", e.code, err[:500])
        return []


def get_documents_table_columns_via_rest() -> Dict[str, str]:
    """Use a SELECT * with limit=1 to discover what columns PostgREST exposes.

    Returns {column_name: postgrest_type} dict.
    """
    url, key = _get_config()
    if not url or not key:
        return {}

    # The key trick: send an intentionally bad request that forces PostgREST
    # to tell us the column names.  We do a SELECT with an invalid column
    # to get a 400 error that lists valid columns.
    test_url = f"{url}/rest/v1/documents?select=___invalid_column___&limit=1"
    req = urllib.request.Request(test_url)
    req.add_header("apikey", key)
    req.add_header("Authorization", f"Bearer {key}")

    try:
        with urllib.request.urlopen(req) as resp:
            return {}
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        # PostgREST error messages often contain "Available columns:" or column list
        log.info("PostgREST schema probe response: %s", err[:1000])
        return {"_raw_error": err[:1000]}


# ── Storage ──────────────────────────────────────────────────────────────

def storage_upload(file_bytes: bytes, storage_path: str, content_type: str = "application/octet-stream") -> None:
    url, key = _get_config()
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
        err_body = e.read().decode()
        raise RuntimeError(f"Storage upload failed ({e.code}): {err_body[:500]}")


def storage_delete(storage_path: str) -> None:
    url, key = _get_config()
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
        err_body = e.read().decode()
        raise RuntimeError(f"Storage delete failed ({e.code}): {err_body[:500]}")


def storage_download(storage_path: str) -> bytes:
    url, key = _get_config()
    download_url = f"{url}/storage/v1/object/{SUPABASE_BUCKET}/{storage_path}"

    req = urllib.request.Request(download_url)
    req.add_header("apikey", key)
    req.add_header("Authorization", f"Bearer {key}")

    try:
        with urllib.request.urlopen(req) as resp:
            return resp.read()
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Storage download failed ({e.code}): {storage_path}")


# ── Database ─────────────────────────────────────────────────────────────

def db_insert_document(filename: str, storage_path: str, file_size: int) -> Dict:
    payload = {
        "filename": filename,
        "storage_path": storage_path,
        "file_size": file_size,
        "status": "uploaded",
    }
    log.info("db_insert_document payload: %s", json.dumps(payload, indent=2))
    try:
        rows = _rest_request("POST", "documents", payload)
        log.info("db_insert_document success: %s", json.dumps(rows, indent=2, default=str))
        return rows[0]
    except Exception as e:
        log.error("db_insert_document FAILED")
        log.error("  Exception type: %s", type(e).__name__)
        log.error("  Exception message: %s", e)
        log.error("  Traceback:\n%s", traceback.format_exc())
        raise


def db_list_documents() -> List[Dict]:
    return _rest_request("GET", "documents", params="order=created_at.desc")


def db_get_document(doc_id: int) -> Optional[Dict]:
    rows = _rest_request("GET", "documents", params=f"id=eq.{doc_id}&select=*")
    return rows[0] if rows else None


def db_delete_document(doc_id: int) -> None:
    _rest_request("DELETE", "documents", params=f"id=eq.{doc_id}")


def db_update_document(doc_id: int, updates: Dict) -> None:
    _rest_request("PATCH", "documents", updates, params=f"id=eq.{doc_id}")
