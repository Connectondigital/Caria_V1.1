import sqlite3
import os

def seed():
    db_path = os.path.join(os.path.dirname(__file__), 'caria.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Seed Sliders
    cursor.execute("SELECT COUNT(*) FROM sliders")
    if cursor.fetchone()[0] == 0:
        sliders = [
            ('Luxury Villas in Kyrenia', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&h=1080&fit=crop', '/properties', 1),
            ('Beachfront Apartments in Iskele', 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1920&h=1080&fit=crop', '/properties', 2)
        ]
        cursor.executemany("INSERT INTO sliders (title, image_url, link, display_order) VALUES (?, ?, ?, ?)", sliders)

    # Seed Country Guides
    cursor.execute("SELECT COUNT(*) FROM country_guides")
    if cursor.fetchone()[0] == 0:
        guides = [
            ('Northern Cyprus', 'North Cyprus', 'Guide to Northern Cyprus...', 'Northern Cyprus is a beautiful island...', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop', 'northern-cyprus'),
            ('Turkey', 'Turkey', 'Guide to Turkey...', 'Turkey offers a unique blend of culture...', 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=600&fit=crop', 'turkey'),
            ('Italy', 'Italy', 'Guide to Italy...', 'Italy is the heart of the Mediterranean...', 'https://images.unsplash.com/photo-1523906834658-6e24ef23a6f8?w=800&h=600&fit=crop', 'italy')
        ]
        cursor.executemany("INSERT INTO country_guides (country_name_tr, country_name_en, content_tr, content_en, image_url, slug) VALUES (?, ?, ?, ?, ?, ?)", guides)

    conn.commit()
    conn.close()
    print("Seeding completed.")

if __name__ == '__main__':
    seed()
