import sqlite3
import os

def init_db():
    db_path = os.path.join(os.path.dirname(__file__), 'caria.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Listings Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS listings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE,
        title TEXT,
        location TEXT,
        price TEXT,
        beds INTEGER,
        baths INTEGER,
        area TEXT,
        plotSize TEXT,
        reference TEXT,
        image TEXT,
        tag TEXT,
        region TEXT
    )
    ''')

    # Site Content Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS site_content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content_key TEXT UNIQUE,
        value_tr TEXT,
        value_en TEXT,
        section TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Sliders Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS sliders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        image_url TEXT,
        link TEXT,
        display_order INTEGER,
        active BOOLEAN DEFAULT 1
    )
    ''')

    # Media Assets Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS media_assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        file_url TEXT,
        file_type TEXT,
        alt_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Seed some data if empty
    cursor.execute("SELECT COUNT(*) FROM site_content")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO site_content (content_key, value_tr, section) VALUES (?, ?, ?)", 
                       ('welcome_msg', 'Caria Estates - Mükemmel Yaşam Alanınıza Hoş Geldiniz', 'hero'))
    
    conn.commit()
    conn.close()
    print(f"Database initialized at {db_path}")

if __name__ == "__main__":
    init_db()
