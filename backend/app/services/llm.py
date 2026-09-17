from __future__ import annotations

import os

SYSTEM_PROMPT = """You are an enterprise AI assistant for AIOps.

Answer ONLY from the provided document context.
If the answer is unavailable in the context, clearly say you could not find it.
Never hallucinate contract clauses, numbers, or facts not present in the context.
Be concise and professional."""


def generate_answer(question: str, contexts: list[str]) -> dict:
    """Generate an answer using Ollama phi3:mini from retrieved contexts."""
    context_block = "\n\n---\n\n".join(
        f"[Context {i+1}]\n{ctx}" for i, ctx in enumerate(contexts)
    )

    user_prompt = f"""Document Context:
{context_block}

Question: {question}

Answer based ONLY on the context above:"""

    try:
        import ollama
        response = ollama.chat(
            model="phi3:mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            options={"temperature": 0.2},
        )
        return {"answer": response["message"]["content"], "sources": []}
    except Exception:
        # Graceful fallback when Ollama is unavailable
        return {
            "answer": (
                "AI inference is currently unavailable (Ollama is not running). "
                "Please start Ollama with `ollama serve` and ensure the phi3:mini model is pulled."
            ),
            "sources": [],
        }
