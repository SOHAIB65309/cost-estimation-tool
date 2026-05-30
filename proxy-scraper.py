from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import uvicorn

app = FastAPI()

class CrawlRequest(BaseModel):
    url: str

def crawl_page(url, session):
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    try:
        response = session.get(url, headers=headers, timeout=5)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        forms = len(soup.find_all('form')) + len(soup.find_all('input'))
        ui = len(soup.find_all('button')) + len(soup.find_all('img'))
        links = soup.find_all('a', href=True)
        
        # Extract internal links for deep crawling
        base_domain = urlparse(url).netloc
        internal_links = set()
        for link in links:
            full_url = urljoin(url, link['href'])
            if urlparse(full_url).netloc == base_domain:
                internal_links.add(full_url)
                
        return {"forms": forms, "ui": ui, "links": len(links), "internal_links": list(internal_links)}
    except:
        return {"forms": 0, "ui": 0, "links": 0, "internal_links": []}

@app.post("/api/scrape")
def scrape_domain(request: CrawlRequest):
    session = requests.Session()
    
    # Crawl Homepage
    home_data = crawl_page(request.url, session)
    total_forms = home_data["forms"]
    total_ui = home_data["ui"]
    total_endpoints = home_data["links"]
    
    # Deep Crawl up to 5 subpages (*/*)
    pages_to_crawl = home_data["internal_links"][:5]
    for page_url in pages_to_crawl:
        sub_data = crawl_page(page_url, session)
        total_forms += sub_data["forms"]
        total_ui += sub_data["ui"]
        total_endpoints += sub_data["links"]

    return {
        "status": "success",
        "scraped_pages": len(pages_to_crawl) + 1,
        "components": {
            "input_forms": total_forms,
            "ui_components": total_ui,
            "action_endpoints": total_endpoints
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)