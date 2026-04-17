import re

def chunk_text(text: str, max_words: int = 250) -> list[str]:
    """
    Split text into smaller chunks for vector embeddings.
    Attempts to split by paragraphs first, falling back to smaller sentences if needed.
    """
    chunks = []
    
    # Split by newlines (paragraphs)
    paragraphs = re.split(r'\n\s*\n', text)
    
    current_chunk = []
    current_word_count = 0
    
    for p in paragraphs:
        p = p.strip()
        if not p:
            continue
            
        words = p.split()
        word_count = len(words)
        
        # If a single paragraph is too long, forcefully split it by sentences
        if word_count > max_words:
            sentences = re.split(r'(?<=[.!?]) +', p)
            for s in sentences:
                s_words = s.split()
                if current_word_count + len(s_words) > max_words and current_chunk:
                    chunks.append(" ".join(current_chunk))
                    current_chunk = s_words
                    current_word_count = len(s_words)
                else:
                    current_chunk.extend(s_words)
                    current_word_count += len(s_words)
                    
                if current_word_count >= max_words:
                    chunks.append(" ".join(current_chunk))
                    current_chunk = []
                    current_word_count = 0
        else:
            if current_word_count + word_count > max_words and current_chunk:
                chunks.append(" ".join(current_chunk))
                current_chunk = words
                current_word_count = word_count
            else:
                current_chunk.extend(words)
                current_word_count += word_count
                
    if current_chunk:
        chunks.append(" ".join(current_chunk))
        
    return chunks

def rank_chunks(results: list[dict], query: str) -> list[dict]:
    """
    Rerank chunks using a composite score.
    - FAISS Score (lower distance is better, we normalize it to a higher=better score)
    - Keyword Match (overlap of significant words)
    - Length Quality (penalize extremely short chunks)
    """
    if not results:
        return []

    # Get unique words from query for keyword matching (ignore small words)
    query_words = set(w.lower() for w in query.split() if len(w) > 3)
    
    # Extract max distance to invert it
    max_dist = max([r.get("score", 0) for r in results]) if results else 1.0
    if max_dist == 0:
        max_dist = 1.0

    scored_results = []
    for r in results:
        text = r.get("text", "")
        faiss_dist = r.get("score", 0)
        
        # 1. Base FAISS Score (Weight 50%) - Invert so higher is better
        faiss_score = (1.0 - (faiss_dist / max_dist)) * 50
        
        # 2. Keyword Match Score (Weight 30%)
        text_lower = text.lower()
        matches = sum(1 for qw in query_words if qw in text_lower)
        keyword_score = min(matches * 10, 30) # cap at 30
        
        # 3. Length Quality Score (Weight 20%)
        word_count = len(text.split())
        length_score = 0
        if 20 <= word_count <= 250:
            length_score = 20
        elif 10 <= word_count < 20:
            length_score = 10
            
        final_score = faiss_score + keyword_score + length_score
        
        r["composite_score"] = final_score
        scored_results.append(r)
        
    # Sort descending by composite score
    scored_results.sort(key=lambda x: x["composite_score"], reverse=True)
    return scored_results
