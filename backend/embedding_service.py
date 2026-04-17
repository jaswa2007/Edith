import os
import google.generativeai as genai

# Setup Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Generate embeddings for a list of text chunks.
    Uses models/text-embedding-004 for retrieval results.
    """
    if not texts:
        return []
        
    try:
        # We can pass a list of strings directly to embed_content
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=texts,
            task_type="retrieval_document"
        )
        # Result contains 'embedding' which is a list of embeddings if multiple contents are passed
        embeddings = result['embedding']
        return embeddings
    except Exception as e:
        print(f"[Embedding Service] Error generating embeddings: {e}")
        # Fallback or returning empty vectors will break Faiss, raise to pipeline
        raise e

def generate_query_embedding(query: str) -> list[float]:
    """
    Generate a single embedding for the retrieval query.
    """
    try:
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=query,
            task_type="retrieval_query"
        )
        return result['embedding']
    except Exception as e:
        print(f"[Embedding Service] Error generating query embedding: {e}")
        raise e
