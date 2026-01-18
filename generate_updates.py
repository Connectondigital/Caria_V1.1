import json
import re

def clean_html(text):
    if not text: return ""
    # Remove HTML tags
    clean = re.compile('<.*?>')
    text = re.sub(clean, '', text)
    # Replace common entities
    text = text.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&bull;', '•').replace('&pound;', '£').replace('&euro;', '€')
    return text.strip()

def generate_updates():
    with open('extracted_2025_listings.json', 'r', encoding='utf-8') as f:
        listings = json.load(f)
    
    # 1. Generate Python SAMPLE_PROPERTIES
    py_properties = []
    for item in listings:
        py_item = {
            "id": item['id'],
            "slug": item['slug'],
            "title": clean_html(item['title']),
            "location": item['location'],
            "price": item['price'],
            "beds": item['beds'],
            "baths": item['baths'],
            "area": item['area'],
            "image": "/assets/images/placeholder-teal.png", # Always placeholder for these missing assets
            "tag": "NEW 2025",
            "region": item['region']
        }
        py_properties.append(py_item)
    
    with open('py_sample_properties.txt', 'w', encoding='utf-8') as f:
        f.write(json.dumps(py_properties, indent=2))

    # 2. Generate JS properties array for App.js
    js_properties = []
    for item in listings:
        js_item = {
            "id": item['id'],
            "slug": item['slug'],
            "title": clean_html(item['title']),
            "location": item['location'],
            "price": item['price'],
            "beds": item['beds'],
            "baths": item['baths'],
            "area": item['area'],
            "image": "/assets/images/placeholder-teal.png",
            "images": ["/assets/images/placeholder-teal.png"],
            "tag": "NEW 2025",
            "region": item['region'],
            "description": clean_html(item['description'])
        }
        js_properties.append(js_item)
    
    with open('js_app_properties.txt', 'w', encoding='utf-8') as f:
        f.write(json.dumps(js_properties, indent=2))

    print("Generated py_sample_properties.txt and js_app_properties.txt")

if __name__ == "__main__":
    generate_updates()
