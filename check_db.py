import sqlite3
import os

DB_PATH = r"c:\Users\Dev.Baran\Documents\caria_v1\backend\caria.db"

def check_blocks():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT * FROM homepage_blocks")
        rows = cursor.fetchall()
        print(f"Found {len(rows)} blocks:")
        for row in rows:
            print(f"ID: {row['id']}, Type: {row['block_type']}, Title: {row['title']}")
        
        print("\nChecking pages table:")
        cursor.execute("SELECT id, title, slug FROM pages")
        prows = cursor.fetchall()
        for p in prows:
            print(f"ID: {p['id']}, Title: {p['title']}, Slug: {p['slug']}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_blocks()
