import sqlite3
import os

DB_PATH = "caria.db"

def migrate():
    print("Starting migration...")
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # 1. Check if we need to migrate
    cursor.execute("PRAGMA table_info(advisors)")
    columns = [col['name'] for col in cursor.fetchall()]
    
    if 'fullName' in columns:
        print("Database already migrated or contains 'fullName'.")
    else:
        # Create new table with updated schema
        print("Creating new advisors table...")
        cursor.execute("ALTER TABLE advisors RENAME TO advisors_old")
        
        cursor.execute("""
            CREATE TABLE advisors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fullName TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                title_tr TEXT,
                title_en TEXT,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                whatsappPhone TEXT,
                portraitUrl TEXT,
                coverImageUrl TEXT,
                bioRichTextTR TEXT,
                bioRichTextEN TEXT,
                languages TEXT,
                regions TEXT,
                specialties TEXT,
                socialLinks TEXT,
                isActive BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Migrate data from old to new
        print("Migrating data...")
        cursor.execute("SELECT * FROM advisors_old")
        old_data = cursor.fetchall()
        
        for row in old_data:
            # Simple mapping
            cursor.execute("""
                INSERT INTO advisors (id, fullName, slug, title_tr, title_en, email, phone, bioRichTextTR, bioRichTextEN, portraitUrl, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                row['id'], 
                row['name'], 
                row['slug'], 
                row['title'], 
                row['title'], 
                row['email'], 
                row['phone'], 
                row['bio_html'], 
                row['bio_html'], 
                row['image_url'], 
                row['created_at']
            ))
            
        cursor.execute("DROP TABLE advisors_old")
        print("Data migration complete.")

    conn.commit()
    conn.close()
    print("Migration finished successfully.")

if __name__ == "__main__":
    migrate()
