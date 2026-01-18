import sqlite3
import os
from pathlib import Path

ROOT_DIR = Path(__file__).parent
DB_PATH = ROOT_DIR / 'caria.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print(f"Baza bağlanıldı: {DB_PATH}")
    
    # Create Country Guides Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS country_guides (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        country_name_tr VARCHAR(255) NOT NULL,
        country_name_en VARCHAR(255),
        content_tr TEXT,
        content_en TEXT,
        image_url VARCHAR(255),
        slug VARCHAR(255) UNIQUE NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    print("country_guides tablosu oluşturuldu/kontrol edildi.")
    
    # Create SEO Settings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS seo_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        page_name VARCHAR(255) UNIQUE NOT NULL,
        title_tr VARCHAR(255),
        title_en VARCHAR(255),
        description_tr TEXT,
        description_en TEXT,
        keywords_tr TEXT,
        keywords_en TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    print("seo_settings tablosu oluşturuldu/kontrol edildi.")
    
    conn.commit()
    conn.close()
    print("Veri tabanı güncellendi!")

if __name__ == "__main__":
    init_db()
