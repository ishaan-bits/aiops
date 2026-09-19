"""Supabase PostgreSQL helpers for persistent document metadata."""
from __future__ import annotations

import json
import os
import urllib.request
import urllib.error
from typing import Any, Dict, List, Optional


def _get_config():
    return os.getenv("SUPABASE_URL", ""), os.getenv("SUPABASE_SERVICE_KEY", "")


def _request(method: str, path: str, body: Any = None, params: str = "") -> Any:
    url, key = _get_config()
    if not url or not key:
        raise RuntimeError("Supabase credentials not configured")

    full_url = f"{url}/rest/v1/{path}"
    if params:
        full_url += f"?{params}"

    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(full_url, data=data, method=method)
    req.add_header("apikey", key)
    req.add_header("Authorization", f"Bearer {key}")
    req.add_header("Content-Type", "application/json")
    req.add_header("Prefer", "return=representation")

    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read().decode()
            return json.loads(raw) if raw else []
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        raise RuntimeError(f"Supabase DB error {e.code}: {err_body[:300]}")


def db_register_document(filename: str, storage_path: str, size: int = 0) -> int:
    rows = _request("POST", "documents", {
        "filename": filename,
        "storage_path": storage_path,
        "file_size": size,
        "status": "uploaded",
    })
    return rows[0]["id"]


def db_list_documents() -> List[Dict]:
    return _request("GET", "documents", params="order=id.desc")


def db_get_document(doc_id: int) -> Optional[Dict]:
    rows = _request("GET", "documents", params=f"id=eq.{doc_id}&select=*")
    return rows[0] if rows else None


def db_update_document(doc_id: int, updates: Dict):
    _request("PATCH", "documents", updates, params=f"id=eq.{doc_id}")
