from __future__ import annotations

import json
import logging
import os
import urllib.request

log = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an enterprise AI assistant for AIOps.

Answer ONLY from the provided document context.
If the answer is unavailable in the context, clearly say you could not find it.
Never hallucinate contract clauses, numbers, or facts not present in the context.
Be concise and professional."""

GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"
# Groq's edge (Cloudflare) rejects urllib's default User-Agent with error 1010.
GROQ_USER_AGENT = "groq-python/1.0"


def groq_available() -> bool:
    return bool(os.getenv("GROQ_API_KEY", "").strip())


def _groq_chat(messages: list[dict], temperature: float) -> str:
    body = json.dumps(
        {
            "model": os.getenv("GROQ_MODEL", "openai/gpt-oss-120b"),
            "messages": messages,
            "temperature": temperature,
        }
    ).encode()
    request = urllib.request.Request(
        GROQ_CHAT_URL,
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {os.getenv('GROQ_API_KEY', '').strip()}",
            "User-Agent": GROQ_USER_AGENT,
        },
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=90) as resp:
        data = json.loads(resp.read().decode())
    return data["choices"][0]["message"]["content"]


def _ollama_chat(messages: list[dict], temperature: float) -> str:
    import ollama

    response = ollama.chat(
        model=os.getenv("OLLAMA_MODEL", "phi3:mini"),
        messages=messages,
        options={"temperature": temperature},
    )
    return response["message"]["content"]


def chat(messages: list[dict], temperature: float = 0.2) -> str:
    """Generate a chat completion via Groq when GROQ_API_KEY is set, else local Ollama."""
    if groq_available():
        return _groq_chat(messages, temperature)
    return _ollama_chat(messages, temperature)


def unavailable_message(error: Exception) -> str:
    if groq_available():
        return f"AI inference failed: {error}"
    return (
        "AI inference is currently unavailable. Set GROQ_API_KEY on the backend, "
        "or run Ollama locally with `ollama serve` and the phi3:mini model pulled."
    )


def generate_answer(question: str, contexts: list[str]) -> dict:
    """Generate an answer from retrieved contexts."""
    context_block = "\n\n---\n\n".join(
        f"[Context {i+1}]\n{ctx}" for i, ctx in enumerate(contexts)
    )

    user_prompt = f"""Document Context:
{context_block}

Question: {question}

Answer based ONLY on the context above:"""

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]

    try:
        return {"answer": chat(messages, temperature=0.2), "sources": []}
    except Exception as e:
        log.exception("LLM answer generation failed")
        return {"answer": unavailable_message(e), "sources": []}
