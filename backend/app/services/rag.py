from __future__ import annotations

import os
import json
import sqlite3
from typing import List, Dict, Tuple

import faiss
import numpy as np

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "aiops.db")
INDEX_DIR = os.path.join(os.path.dirname(__file__), "..", "faiss_indexes")
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")

_model = None


def _get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_rag_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS rag_documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            file_path TEXT NOT NULL,
            chunk_count INTEGER DEFAULT 0,
            status TEXT DEFAULT 'uploaded',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS rag_chunks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            document_id INTEGER NOT NULL,
            chunk_index INTEGER NOT NULL,
            content TEXT NOT NULL,
            page_number INTEGER DEFAULT 1,
            FOREIGN KEY (document_id) REFERENCES rag_documents(id)
        )
    """)
    conn.commit()
    conn.close()


def register_document(filename: str, file_path: str) -> int:
    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO rag_documents (filename, file_path, status) VALUES (?, ?, 'uploaded')",
        (filename, file_path),
    )
    doc_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return doc_id


def extract_text(file_path: str) -> List[Dict]:
    ext = os.path.splitext(file_path)[1].lower()
    pages = []

    if ext == ".pdf":
        import fitz
        doc = fitz.open(file_path)
        for i, page in enumerate(doc):
            text = page.get_text()
            if text.strip():
                pages.append({"page": i + 1, "text": text})
        doc.close()
    elif ext == ".docx":
        from docx import Document
        doc = Document(file_path)
        full_text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
        if full_text.strip():
            pages.append({"page": 1, "text": full_text})
    else:
        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                text = f.read()
            if text.strip():
                pages.append({"page": 1, "text": text})
        except Exception:
            pages.append({"page": 1, "text": f"[Unable to extract text from {ext} file]"})

    return pages


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 75) -> List[str]:
    words = text.split()
    if len(words) <= chunk_size:
        return [text.strip()] if text.strip() else []
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end]).strip()
        if chunk:
            chunks.append(chunk)
        start += chunk_size - overlap
    return chunks


def create_embeddings(chunks: List[str]) -> np.ndarray:
    model = _get_model()
    embeddings = model.encode(chunks, show_progress_bar=False, convert_to_numpy=True)
    return embeddings.astype(np.float32)


def save_to_faiss(document_id: int) -> int:
    conn = get_db()
    rows = conn.execute(
        "SELECT id, content, page_number FROM rag_chunks WHERE document_id = ? ORDER BY chunk_index",
        (document_id,),
    ).fetchall()
    conn.close()

    if not rows:
        return 0

    chunk_ids = [r["id"] for r in rows]
    texts = [r["content"] for r in rows]

    embeddings = create_embeddings(texts)
    dim = embeddings.shape[1]

    index = faiss.IndexFlatIP(dim)
    faiss.normalize_L2(embeddings)
    index.add(embeddings)

    os.makedirs(INDEX_DIR, exist_ok=True)
    index_path = os.path.join(INDEX_DIR, f"doc_{document_id}.faiss")
    faiss.write_index(index, index_path)

    meta_path = os.path.join(INDEX_DIR, f"doc_{document_id}_meta.json")
    with open(meta_path, "w") as f:
        json.dump({"chunk_ids": chunk_ids, "texts": texts}, f)

    conn = get_db()
    conn.execute(
        "UPDATE rag_documents SET chunk_count = ?, status = 'indexed' WHERE id = ?",
        (len(rows), document_id),
    )
    conn.commit()
    conn.close()

    return len(rows)


def index_document(document_id: int) -> dict:
    conn = get_db()
    doc = conn.execute("SELECT file_path, filename FROM rag_documents WHERE id = ?", (document_id,)).fetchone()
    conn.close()

    if not doc:
        raise ValueError(f"Document {document_id} not found")

    pages = extract_text(doc["file_path"])
    total_chunks = 0
    conn = get_db()

    for page_data in pages:
        chunks = chunk_text(page_data["text"])
        for i, chunk in enumerate(chunks):
            conn.execute(
                "INSERT INTO rag_chunks (document_id, chunk_index, content, page_number) VALUES (?, ?, ?, ?)",
                (document_id, total_chunks + i, chunk, page_data["page"]),
            )
        total_chunks += len(chunks)

    conn.commit()
    conn.close()

    indexed = save_to_faiss(document_id)
    return {"document_id": document_id, "filename": doc["filename"], "chunks_indexed": indexed}


def search_similar(question: str, top_k: int = 5) -> List[Dict]:
    model = _get_model()
    q_embedding = model.encode([question], convert_to_numpy=True).astype(np.float32)
    faiss.normalize_L2(q_embedding)

    results = []
    conn = get_db()
    docs = conn.execute("SELECT id, filename FROM rag_documents WHERE status = 'indexed'").fetchall()
    conn.close()

    for doc in docs:
        index_path = os.path.join(INDEX_DIR, f"doc_{doc['id']}.faiss")
        meta_path = os.path.join(INDEX_DIR, f"doc_{doc['id']}_meta.json")
        if not os.path.exists(index_path):
            continue

        index = faiss.read_index(index_path)
        with open(meta_path, "r") as f:
            meta = json.load(f)

        scores, indices = index.search(q_embedding, min(top_k, index.ntotal))
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0:
                continue
            chunk_id = meta["chunk_ids"][idx]
            conn2 = get_db()
            chunk_row = conn2.execute(
                "SELECT content, page_number FROM rag_chunks WHERE id = ?", (chunk_id,)
            ).fetchone()
            conn2.close()
            if chunk_row:
                results.append({
                    "document": doc["filename"],
                    "page": chunk_row["page_number"],
                    "score": round(float(score), 4),
                    "content": chunk_row["content"],
                })

    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_k]


def generate_answer(question: str) -> dict:
    sources = search_similar(question, top_k=5)

    if not sources:
        return {
            "answer": "No relevant documents found in the knowledge base. Please upload documents first and ensure they are indexed.",
            "sources": [],
        }

    contexts = [s["content"] for s in sources]

    try:
        from .llm import generate_answer as llm_generate
        answer_text = llm_generate(question, contexts)
    except ConnectionError as e:
        raise e
    except Exception as e:
        answer_text = (
            f"Retrieved {len(sources)} relevant sections but could not generate an AI response.\n"
            f"Error: {str(e)}\n\n"
            f"Raw context:\n" + "\n\n".join(
                f"- {s['document']} (Page {s['page']}): {s['content'][:150]}..."
                for s in sources[:3]
            )
        )

    return {
        "answer": answer_text,
        "sources": [{"document": s["document"], "page": s["page"], "score": s["score"]} for s in sources],
    }


init_rag_db()
