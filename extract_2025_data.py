import pymysql
import json
from datetime import datetime, date

def json_serial(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError ("Type %s not serializable" % type(obj))

def extract_2025_data():
    try:
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password='',
            database='old_caria',
            cursorclass=pymysql.cursors.DictCursor
        )
        all_listings = []
        with connection.cursor() as cursor:
            # We'll focus on ent_bina for English listings as requested for the current system
            table = 'ent_bina'
            cursor.execute(f"SELECT * FROM `{table}` WHERE `tarih` LIKE '2025%' OR `pyear` = '2025'")
            listings = cursor.fetchall()
            
            for item in listings:
                # Map old schema to new schema
                # Current schema: id, slug, title, location, price, beds, baths, area, image, images[], tag, region, description
                mapped = {
                    "id": item['kimlik'],
                    "slug": item.get('seo_url') if item.get('seo_url') else f"property-{item['kimlik']}",
                    "title": item['pname'],
                    "location": item.get('bolge_adi', 'Cyprus'), # Need to check if bolge_adi is available or join with bolge table
                    "price": f"£{item['pprice']:,}" if item['pprice'] else "Contact for price",
                    "beds": item.get('oda', 1), # Mapping needed if stored differently
                    "baths": item.get('banyo', 1),
                    "area": item.get('m2', 'N/A'),
                    "image": item['pmainpic'] if item['pmainpic'] else "/assets/images/placeholder-teal.png",
                    "images": [item['pmainpic']] if item['pmainpic'] else ["/assets/images/placeholder-teal.png"],
                    "tag": "NEW 2025",
                    "region": "KYRENIA", # Default or map from bolge
                    "description": item.get('pdetail', 'No description available.'),
                }
                
                # Handle images that might be relative or missing
                if not mapped['image'] or mapped['image'].strip() == "":
                    mapped['image'] = "/assets/images/placeholder-teal.png"
                    mapped['images'] = ["/assets/images/placeholder-teal.png"]
                
                all_listings.append(mapped)

        with open('extracted_2025_listings.json', 'w', encoding='utf-8') as f:
            json.dump(all_listings, f, indent=2, default=json_serial, ensure_ascii=False)
        
        print(f"Successfully extracted {len(all_listings)} listings to extracted_2025_listings.json")

        connection.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_2025_data()
