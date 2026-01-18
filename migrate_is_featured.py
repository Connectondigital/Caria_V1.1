
import sqlite3

db_path = 'backend/caria.db'

def migrate():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE listings ADD COLUMN is_featured BOOLEAN DEFAULT 0")
        conn.commit()
        print("Migrated: Added is_featured to listings.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column is_featured already exists.")
        else:
            print(f"Migration error: {e}")
            
    conn.close()

if __name__ == "__main__":
    migrate()
