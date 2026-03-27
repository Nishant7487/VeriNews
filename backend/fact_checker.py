import os
import httpx
from dotenv import load_dotenv
import re

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_FACT_CHECK_API_KEY")

async def verify_with_google(text: str):
    if not GOOGLE_API_KEY: return None
    
    clean_text = re.sub(r'[^\w\s]', '', text).lower()
    
    trash_words = {"scientists", "recently", "discovered", "breaking", "confirmed", "massive", "secretly", "actually", "reports", "according", "people", "world"}
    
    priority_keywords = {"5g", "covid", "vaccine", "cancer", "radiation", "conspiracy", "leak", "election", "biden", "trump", "modi", "war", "virus"}
    
    all_words = clean_text.split()
    
    meaningful_words = [w for w in all_words if w not in trash_words and len(w) > 4]
    
    found_priority = [w for w in all_words if w in priority_keywords]
    
    final_keywords = (found_priority + meaningful_words)[:6]
    search_query = " ".join(final_keywords)
    
    if not search_query: return None
        
    print(f"DEBUG: Power Query -> {search_query}")
    
    url = f"https://factchecktools.googleapis.com/v1alpha1/claims:search?query={search_query}&key={GOOGLE_API_KEY}"
    
    try:
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.get(url, timeout=10.0)
            if response.status_code == 200:
                data = response.json()
                if "claims" in data and len(data["claims"]) > 0:
                    print("DEBUG: OSINT MATCH FOUND!")
                    claim = data["claims"][0]
                    review = claim.get("claimReview", [{}])[0]
                    return {
                        "claim_made": claim.get("text"),
                        "publisher": review.get("publisher", {}).get("name", "Verified Source"),
                        "rating": review.get("textualRating", "False"),
                        "source_url": review.get("url", "")
                    }
    except Exception: pass
    return None