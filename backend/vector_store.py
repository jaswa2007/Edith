import faiss
import numpy as np
import os
import json
import pickle

class VectorStore:
    def __init__(self, embedding_dim: int = 3072):
        """
        Initialize FAISS index. We use IndexFlatIP for inner product (cosine similarity)
        Gemini embeddings usually output 3072 dimensions (for gemini-embedding-001).
        """
        self.embedding_dim = embedding_dim
        # Using IndexFlatL2 for L2 distance, or IndexFlatIP for Inner Product
        # We will use IndexFlatL2 as a basic default that doesn't strictly require normalization
        self.index = faiss.IndexFlatL2(embedding_dim)
        
        # Store metadata mapping (index_id -> metadata dictionary)
        self.metadata = {}
        self.current_count = 0

    def add_embeddings(self, embeddings: list[list[float]], metadatas: list[dict]):
        """
        Add embeddings to the Faiss index along with metadata (e.g. original text chunk).
        """
        if not embeddings:
            return

        # Ensure numpy array float32
        embed_np = np.array(embeddings).astype('float32')
        
        # Add to index
        self.index.add(embed_np)
        
        # Store metadata mappings
        for i, meta in enumerate(metadatas):
            self.metadata[self.current_count + i] = meta
            
        self.current_count += len(embeddings)

    def search(self, query_embedding: list[float], top_k: int = 5) -> list[dict]:
        """
        Search for top_k similar vectors and return their metadata.
        """
        if self.current_count == 0:
            return []

        # Ensure 2D numpy array for FAISS
        query_np = np.array([query_embedding]).astype('float32')
        
        # Perform search -> D = distances, I = indices
        D, I = self.index.search(query_np, min(top_k, self.current_count))
        
        results = []
        for dist, idx in zip(D[0], I[0]):
            if idx != -1 and idx in self.metadata:
                res = self.metadata[idx].copy()
                res["score"] = float(dist)
                results.append(res)
                
        return results

    def save_index(self, directory: str, index_name: str):
        """
        Save the FAISS index and metadata to a specified directory.
        """
        os.makedirs(directory, exist_ok=True)
        
        # Save FAISS index
        faiss.write_index(self.index, os.path.join(directory, f"{index_name}.index"))
        
        # Save metadata mapping
        with open(os.path.join(directory, f"{index_name}_meta.pkl"), "wb") as f:
            pickle.dump({"metadata": self.metadata, "current_count": self.current_count}, f)
            
    def load_index(self, directory: str, index_name: str) -> bool:
        """
        Load the FAISS index and metadata from a specified directory.
        Returns True if successful, False otherwise.
        """
        index_path = os.path.join(directory, f"{index_name}.index")
        meta_path = os.path.join(directory, f"{index_name}_meta.pkl")
        
        if not os.path.exists(index_path) or not os.path.exists(meta_path):
            return False
            
        try:
            self.index = faiss.read_index(index_path)
            with open(meta_path, "rb") as f:
                data = pickle.load(f)
                self.metadata = data.get("metadata", {})
                self.current_count = data.get("current_count", 0)
            return True
        except Exception as e:
            print(f"[VectorStore] Failed to load index {index_name}: {e}")
            return False
