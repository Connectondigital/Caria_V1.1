import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'caria.db')

def migrate():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Add gallery column to listings
    cursor.execute("PRAGMA table_info(listings)")
    existing_columns = [column[1] for column in cursor.fetchall()]
    
    if 'gallery' not in existing_columns:
        print("Adding gallery column to listings...")
        cursor.execute("ALTER TABLE listings ADD COLUMN gallery TEXT")
    
    # Create feature_definitions table
    print("Creating feature_definitions table...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS feature_definitions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL, -- 'interior', 'exterior', 'general'
            label_tr TEXT NOT NULL,
            label_en TEXT NOT NULL
        )
    """)
    
    # Optional: Seed some common features if empty
    cursor.execute("SELECT COUNT(*) FROM feature_definitions")
    if cursor.fetchone()[0] == 0:
        print("Seeding initial features...")
        initial_features = [
            ('interior', 'Klima', 'Air Conditioning'),
            ('interior', 'Beyaz Eşya', 'White Goods'),
            ('interior', 'Mobilyalı', 'Furnished'),
            ('interior', 'Yerden Isıtma', 'Underfloor Heating'),
            ('interior', 'Şömine', 'Fireplace'),
            ('exterior', 'Yüzme Havuzu', 'Swimming Pool'),
            ('exterior', 'Otopark', 'Parking'),
            ('exterior', 'Bahçe', 'Garden'),
            ('exterior', 'Deniz Manzarası', 'Sea View'),
            ('exterior', 'Barbekü', 'BBQ Area')
        ]
        cursor.executemany("INSERT INTO feature_definitions (category, label_tr, label_en) VALUES (?, ?, ?)", initial_features)
            
    conn.commit()
    conn.close()
    print("Migration completed.")

if __name__ == "__main__":
    migrate()
