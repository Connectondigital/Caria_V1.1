import sqlite3
from pathlib import Path

def migrate():
    db_path = Path('backend/caria.db')
    if not db_path.exists():
        print(f"Error: Database not found at {db_path}")
        return

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # 1. Create inquiries table
        print("Creating 'inquiries' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS inquiries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                message TEXT,
                property_id INTEGER,
                status TEXT DEFAULT 'new',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 1b. Create pages table
        print("Creating 'pages' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS pages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                content_html TEXT,
                banner_title TEXT,
                banner_url TEXT,
                active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Check for missing columns in pages
        cursor.execute("PRAGMA table_info(pages)")
        page_columns = [col[1] for col in cursor.fetchall()]
        if "banner_title" not in page_columns:
            print("Adding banner_title to pages...")
            cursor.execute("ALTER TABLE pages ADD COLUMN banner_title TEXT")

        # 1c. Create menus table
        print("Creating 'menus' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS menus (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                url TEXT NOT NULL,
                menu_type TEXT DEFAULT 'header', -- 'header' or 'footer'
                display_order INTEGER DEFAULT 0
            )
        """)

        # 2. Add missing columns to listings table
        print("Updating 'listings' table schema...")
        columns_to_add = [
            ("beds_room_count", "INTEGER DEFAULT 0"),
            ("baths_count", "INTEGER DEFAULT 0"),
            ("plot_area", "TEXT"),
            ("closed_area", "TEXT")
        ]

        # Check existing columns
        cursor.execute("PRAGMA table_info(listings)")
        existing_columns = [col[1] for col in cursor.fetchall()]

        for col_name, col_def in columns_to_add:
            if col_name not in existing_columns:
                print(f"Adding column {col_name}...")
                cursor.execute(f"ALTER TABLE listings ADD COLUMN {col_name} {col_def}")

        conn.commit()
        print("Migration completed successfully.")
        conn.close()
    except Exception as e:
        print(f"Migration Error: {e}")

if __name__ == "__main__":
    migrate()
