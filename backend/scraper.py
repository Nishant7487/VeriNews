import httpx
from bs4 import BeautifulSoup
import random
import logging

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0"
]

async def fetch_article_from_url(url: str):
    try:
        headers = {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Referer": "https://www.google.com/"
        }
        
        async with httpx.AsyncClient(verify=False, follow_redirects=True) as client:
            response = await client.get(url, headers=headers, timeout=15.0)
            
            if response.status_code != 200:
                logging.error(f"Failed to fetch URL. Status: {response.status_code}")
                return None
                
            soup = BeautifulSoup(response.text, "lxml")
            
            paragraphs = soup.find_all('p')
            article_text = " ".join([p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 20])
            
            if not article_text or len(article_text.split()) < 50:
                for script in soup(["script", "style", "header", "footer", "nav", "aside"]):
                    script.extract()
                text = soup.get_text(separator=' ')
                lines = (line.strip() for line in text.splitlines())
                article_text = ' '.join(chunk for chunk in lines if chunk)

            return article_text

    except Exception as e:
        logging.error(f"Scraping error: {e}")
        return None