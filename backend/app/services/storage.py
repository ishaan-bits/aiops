from __future__ import annotations

import os

UPLOADS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))


def _safe_path(storage_path: str) -> str:
    full = os.path.abspath(os.path.join(UPLOADS_DIR, os.path.basename(storage_path)))
    if not full.startswith(UPLOADS_DIR + os.sep):
        raise ValueError("Invalid storage path")
    return full


def save_file(data: bytes, storage_path: str) -> str:
    full = _safe_path(storage_path)
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    with open(full, "wb") as f:
        f.write(data)
    return full


def delete_file(storage_path: str) -> None:
    full = _safe_path(storage_path)
    if os.path.exists(full):
        os.remove(full)


def get_path(storage_path: str) -> str:
    return _safe_path(storage_path)
