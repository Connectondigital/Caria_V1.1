import sqlite3
import json

def force_seed_blocks():
    conn = sqlite3.connect('backend/caria.db')
    cursor = conn.cursor()
    
    # Check for Hero
    cursor.execute("SELECT id FROM homepage_blocks WHERE block_type = 'hero'")
    if not cursor.fetchone():
        cursor.execute("""
            INSERT INTO homepage_blocks (block_type, title, subtitle, video_url, active, display_order)
            VALUES ('hero', 'Luxury Real Estate', 'Your dream home awaits in Northern Cyprus', '/assets/videos/hero.mp4', 1, 1)
        """)
        print("Seeded Hero")

    # Check for Stats
    cursor.execute("SELECT id FROM homepage_blocks WHERE block_type = 'stats'")
    if not cursor.fetchone():
        stats_content = json.dumps([
            {"label": "Experince", "value": "15+"},
            {"label": "Properties", "value": "2500+"},
            {"label": "Happy Clients", "value": "1200+"}
        ])
        cursor.execute("""
            INSERT INTO homepage_blocks (block_type, title, content, active, display_order)
            VALUES ('stats', 'Caria by Numbers', ?, 1, 2)
        """, (stats_content,))
        print("Seeded Stats")

    # Check for Services
    cursor.execute("SELECT id FROM homepage_blocks WHERE block_type = 'services'")
    if not cursor.fetchone():
        services_content = json.dumps([
            {"title": "Property Buy", "desc": "We help you find the best property."},
            {"title": "After Sale", "desc": "We support you even after the sale."},
            {"title": "Legal Advice", "desc": "Secure your investment with our experts."},
            {"title": "Architecture", "desc": "Custom design your dream space."}
        ])
        cursor.execute("""
            INSERT INTO homepage_blocks (block_type, title, content, active, display_order)
            VALUES ('services', 'Our Services', ?, 1, 3)
        """, (services_content,))
        print("Seeded Services")
            
    conn.commit()
    conn.close()

if __name__ == "__main__":
    force_seed_blocks()
