from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse, urldefrag
from playwright.sync_api import sync_playwright
import uvicorn

app = FastAPI()

class CrawlRequest(BaseModel):
    url: str

def crawl_page(url, browser):
    try:
        print(f"[*] Scraping rendered DOM: {url}")
        
        page = browser.new_page()
        
        # FIX 1: Use 'domcontentloaded' instead of 'load' to prevent hanging on heavy images
        page.goto(url, timeout=30000, wait_until="domcontentloaded")
        
        print("[*] Waiting for JavaScript to hydrate the UI...")
        page.wait_for_timeout(4000) 
        
        html = page.content()
        soup = BeautifulSoup(html, 'html.parser')
        
        forms = len(soup.find_all('form')) + len(soup.find_all('input'))
        ui = len(soup.find_all('button')) + len(soup.find_all('img'))
        links = soup.find_all('a', href=True)
        
        base_domain = urlparse(url).netloc
        internal_links = set()
        
        for link in links:
            if link.has_attr('href'):
                full_url = urljoin(url, link['href'])
                
                # FIX 2: Strip out '#' anchor tags so we don't scrape the same page multiple times
                full_url, _ = urldefrag(full_url)
                
                # FIX 3: Ignore non-HTML files that crash the headless browser
                if full_url.lower().endswith(('.pdf', '.jpg', '.png', '.zip', '.mp4', '.gif')):
                    continue
                    
                if urlparse(full_url).netloc == base_domain:
                    internal_links.add(full_url)
                
        print(f"[+] Success: {forms} Forms, {ui} UIs, {len(links)} Endpoints")
        page.close()
        
        return {"forms": forms, "ui": ui, "links": len(links), "internal_links": list(internal_links)}
        
    except Exception as e:
        print(f"[!] Failed on {url} | Error: {str(e)}")
        try:
            page.close()
        except:
            pass
        return {"forms": 0, "ui": 0, "links": 0, "internal_links": []}

@app.post("/api/scrape")
def scrape_domain(request: CrawlRequest):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        home_data = crawl_page(request.url, browser)
        total_forms = home_data["forms"]
        total_ui = home_data["ui"]
        total_endpoints = home_data["links"]
        
        # Convert the set to a list before slicing
        pages_to_crawl = list(home_data["internal_links"])[:5]
        
        for page_url in pages_to_crawl:
            # FIX 4: Prevent crawling the exact base URL again if it got added to the links
            if page_url.rstrip('/') != request.url.rstrip('/'):
                sub_data = crawl_page(page_url, browser)
                total_forms += sub_data["forms"]
                total_ui += sub_data["ui"]
                total_endpoints += sub_data["links"]

        print(f"--- TOTALS FOR {request.url} ---")
        print(f"Forms: {total_forms}, UI: {total_ui}, Endpoints: {total_endpoints}")

        browser.close()

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