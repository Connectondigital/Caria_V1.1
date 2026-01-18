import sqlite3
import os
import sys

# Hardcoded data from server.py for migration
SAMPLE_PROPERTIES = [
  {
    "id": 1, "slug": "luxury-villa-kyrenia", "title": "Luxury Sea View Villa", "location": "Kyrenia, Northern Cyprus",
    "price": "£850,000", "beds": 4, "baths": 3, "area": "320", "plotSize": "850", "reference": "CE-KYR-001",
    "image": "https://images.unsplash.com/photo-1694967832949-09984640b143?w=800&h=600&fit=crop", "tag": "NEW LISTING", "region": "KYRENIA"
  },
  {
    "id": 2, "slug": "penthouse-iskele", "title": "Modern Penthouse", "location": "Iskele, Northern Cyprus",
    "price": "£425,000", "beds": 3, "baths": 2, "area": "185", "image": "https://images.unsplash.com/photo-1642976975710-1d8890dbf5ab?w=800&h=600&fit=crop",
    "tag": "FOR SALE", "region": "ISKELE"
  },
  {
    "id": 3, "slug": "beachfront-apartment-famagusta", "title": "Beachfront Apartment", "location": "Famagusta, Northern Cyprus",
    "price": "£295,000", "beds": 2, "baths": 2, "area": "120", "image": "https://images.unsplash.com/photo-1739140019682-05bd100b5a5e?w=800&h=600&fit=crop",
    "tag": "EXCLUSIVE", "region": "FAMAGUSTA"
  },
  {
    "id": 11, "slug": "luxury-villa-ozankoy-494383", "title": "Girne Ozanköy'de 4+1 Özel Tasarım Lüks Villa", "location": "Ozankoy, Kyrenia",
    "price": "£1,160,000", "beds": 4, "baths": 4, "area": "308", "image": "/assets/images/properties/prop-11/image-0.jpeg",
    "tag": "NEW LISTING", "region": "KYRENIA"
  },
  {
    "id": 13, "slug": "sea-view-studio-long-beach-494120", "title": "Long Beach Grand Sapphire Studio Apartment", "location": "Long Beach, Iskele",
    "price": "£95,000", "beds": 0, "baths": 1, "area": "45", "image": "/assets/images/properties/prop-13/image-0.jpeg",
    "tag": "NEW LISTING", "region": "ISKELE"
  }
  # ... more can be added if needed, but these are for testing the migration flow
]

def migrate():
    db_path = os.path.join(os.path.dirname(__file__), 'caria.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    for p in SAMPLE_PROPERTIES:
        cursor.execute('''
            INSERT OR REPLACE INTO listings (slug, title, location, price, beds, baths, area, plotSize, reference, image, tag, region)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (p['slug'], p['title'], p['location'], p['price'], p.get('beds', 0), p.get('baths', 0), p.get('area', 'N/A'), p.get('plotSize', 'N/A'), p.get('reference', 'N/A'), p['image'], p['tag'], p['region']))
    
    conn.commit()
    conn.close()
    print("Migration successful")

if __name__ == "__main__":
    migrate()
