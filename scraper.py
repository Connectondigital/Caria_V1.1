import os
import json
import requests
from bs4 import BeautifulSoup
import time
import random
from concurrent.futures import ThreadPoolExecutor

# Configuration
BASE_URL = "https://www.101evler.com"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,tr;q=0.8",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Cache-Control": "max-age=0",
}

# Property IDs and URLs (Manual override if pattern fails)
PROPERTY_LINKS = {
    11: "https://www.101evler.com/en/cyprus/property-for-sale/kyrenia/ozankoy/luxury-villa/494383",
    12: "https://www.101evler.com/en/cyprus/property-for-sale/kyrenia/esentepe/modern-villa/494123",
    13: "https://www.101evler.com/en/cyprus/property-for-sale/iskele/long-beach/studio/494120",
    14: "https://www.101evler.com/en/cyprus/property-for-sale/iskele/long-beach/studio/491211",
    15: "https://www.101evler.com/en/cyprus/property-for-sale/kyrenia/dogankoy/villa/494379",
    16: "https://www.101evler.com/en/cyprus/property-for-sale/kyrenia/esentepe/flat/459983",
    17: "https://www.101evler.com/en/cyprus/property-for-sale/kyrenia/catalkoy/villa/482100",
    18: "https://www.101evler.com/en/cyprus/property-for-sale/famagusta/yeni-bogazici/villa/491329",
    19: "https://www.101evler.com/en/cyprus/property-for-sale/lefke/gaziveren/flat/451390",
    20: "https://www.101evler.com/en/cyprus/property-for-sale/kyrenia/edremit/villa/491500", # Using 491500 as a representative for Edremit if not specified
}

IMAGE_BASE_DIR = "frontend/public/assets/images/properties"

def download_image(url, folder, filename):
    try:
        if not os.path.exists(folder):
            os.makedirs(folder)
        
        path = os.path.join(folder, filename)
        if os.path.exists(path):
            return path
            
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code == 200:
            with open(path, 'wb') as f:
                f.write(response.content)
            return path
    except Exception as e:
        print(f"Error downloading {url}: {e}")
    return None

def scrape_property(prop_id, url):
    print(f"Scraping Property {prop_id}: {url}")
    session = requests.Session()
    session.headers.update(HEADERS)
    
    try:
        # Get English version
        resp_en = session.get(url, timeout=15)
        soup_en = BeautifulSoup(resp_en.text, 'html.parser')
        
        # Get Turkish version
        url_tr = url.replace("/en/", "/tr/")
        resp_tr = session.get(url_tr, timeout=15)
        soup_tr = BeautifulSoup(resp_tr.text, 'html.parser')
        
        data = {
            "id": prop_id,
            "url": url,
            "title": soup_en.find("h1").text.strip() if soup_en.find("h1") else "Property",
            "price": "",
            "description_en": "",
            "description_tr": "",
            "specs": {},
            "images": []
        }
        
        # Price
        price_tag = soup_en.select_one(".propDetailPrice")
        if price_tag:
            data["price"] = price_tag.text.strip()
            
        # Description
        desc_en = soup_en.select_one(".propDetailDescription")
        if desc_en:
            data["description_en"] = desc_en.get_text(separator="\n").strip()
            
        desc_tr = soup_tr.select_one(".propDetailDescription")
        if desc_tr:
            data["description_tr"] = desc_tr.get_text(separator="\n").strip()
            
        # Specs
        specs = soup_en.select(".prop-spec-item")
        for spec in specs:
            label = spec.select_one(".prop-spec-label")
            value = spec.select_one(".prop-spec-value")
            if label and value:
                data["specs"][label.text.strip()] = value.text.strip()
                
        # Images
        # Looking for splide slides or fancybox links
        img_tags = soup_en.select("a[data-fancybox='gallery-mobile']")
        if not img_tags:
            img_tags = soup_en.select(".splide__slide img")
            
        img_urls = []
        for tag in img_tags:
            link = tag.get("href") or tag.get("data-lazy") or tag.get("src")
            if link and link.startswith("http"):
                img_urls.append(link)
            elif link and link.startswith("/"):
                img_urls.append(BASE_URL + link)
        
        data["images"] = list(dict.fromkeys(img_urls)) # Remove duplicates
        
        # Limit images for performance but get at least a good amount
        to_download = data["images"][:10]
        
        prop_folder = os.path.join(IMAGE_BASE_DIR, f"prop-{prop_id}")
        downloaded_paths = []
        
        for i, img_url in enumerate(to_download):
            ext = ".jpg"
            if ".png" in img_url.lower(): ext = ".png"
            filename = f"image-{i}{ext}"
            local_path = download_image(img_url, prop_folder, filename)
            if local_path:
                # Store relative path for frontend
                downloaded_paths.append(f"/assets/images/properties/prop-{prop_id}/{filename}")
        
        data["local_images"] = downloaded_paths
        return data
        
    except Exception as e:
        print(f"Error scraping {prop_id}: {e}")
        return None

def main():
    results = []
    for prop_id, url in PROPERTY_LINKS.items():
        res = scrape_property(prop_id, url)
        if res:
            results.append(res)
        time.sleep(random.uniform(1, 3)) # Polite scraping
        
    with open("scraped_data.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully scraped {len(results)} properties.")

if __name__ == "__main__":
    main()
