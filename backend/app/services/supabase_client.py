"""Reusable Supabase admin client using service role key.

Provides Storage and DB operations via REST API.
No Python SDK dependency — uses stdlib urllib only.
"""
from __future__ import annotations

import json
import os
import urllib.request
import urllib.error
from typing import Any, Dict, List, Optional


SUPABASE_BUCKET = "documents"


def _get_config():
    return (
        os.getenv("SUPABASE_URL", ""),
        os.getenv("SUPABASE_SERVICE_ROLE_KEY", ""),
    )


def _rest_request(
    method: str, path: str, body: Any = None, params: str = "", extra_headers: Optional[Dict] = None
) -> Any:
    url, key = _get_config()
    if not url or not key:
        raise RuntimeError("Supabase credentials not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)")

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
        raise RuntimeError(f"Supabase REST error {e.code}: {err_body[:500]}")


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
    rows = _rest_request("POST", "documents", {
        "filename": filename,
        "storage_path": storage_path,
        "file_size": file_size,
        "status": "uploaded",
    })
    return rows[0]


def db_list_documents() -> List[Dict]:
    return _rest_request("GET", "documents", params="order=created_at.desc")


def db_get_document(doc_id: int) -> Optional[Dict]:
    rows = _rest_request("GET", "documents", params=f"id=eq.{doc_id}&select=*")
    return rows[0] if rows else None


def db_delete_document(doc_id: int) -> None:
    _rest_request("DELETE", "documents", params=f"id=eq.{doc_id}")


def db_update_document(doc_id: int, updates: Dict) -> None:
    _rest_request("PATCH", "documents", updates, params=f"id=eq.{doc_id}")
