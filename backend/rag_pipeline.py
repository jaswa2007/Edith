from vector_store import VectorStore
from embedding_service import generate_embeddings, generate_query_embedding
from retrieval_service import chunk_text, rank_chunks
import hashlib
import os

VECTOR_CACHE_DIR = os.path.join(os.path.dirname(__file__), "vector_cache")
os.makedirs(VECTOR_CACHE_DIR, exist_ok=True)


V_STORE = VectorStore(embedding_dim=3072)

def prepare_rag_context(study_text: str, query: str, top_k: int = 5) -> str:
    
    if not study_text or len(study_text.strip()) < 500:

        return study_text
        
    print(f"[RAG Pipeline] Starting RAG processing for query: '{query}'")
    
    
    text_hash = hashlib.md5(study_text.encode('utf-8')).hexdigest()
    
    local_store = VectorStore(embedding_dim=3072)

    if local_store.load_index(VECTOR_CACHE_DIR, text_hash):
        print(f"[RAG Pipeline] Cache HIT for document hash: {text_hash}")
    else:
        print(f"[RAG Pipeline] Cache MISS. Computing embeddings for {text_hash}...")
        chunks = chunk_text(study_text, max_words=200)
        print(f"[RAG Pipeline] Split text into {len(chunks)} chunks.")
        
        
        print("[RAG Pipeline] Generating embeddings...")
        embeddings = generate_embeddings(chunks)
        
        
        metadatas = [{"text": c} for c in chunks]
        local_store.add_embeddings(embeddings, metadatas)
        local_store.save_index(VECTOR_CACHE_DIR, text_hash)
        print(f"[RAG Pipeline] Saved index to cache for {text_hash}")
    

    query_embed = generate_query_embedding(query)
    
    raw_results = local_store.search(query_embed, top_k=top_k * 2) 
    
    ranked_results = rank_chunks(raw_results, query)
    
    
    final_results = ranked_results[:top_k]
    retrieved_texts = [res["text"] for res in final_results]
    context = "\n\n---\n\n".join(retrieved_texts)
    
    print(f"[RAG Pipeline] Retrieved {len(retrieved_texts)} highly relevant chunks out of {len(raw_results)} candidates.")
    return context
