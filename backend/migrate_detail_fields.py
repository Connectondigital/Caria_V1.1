import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'caria.db')

def migrate():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    new_columns = [
        ('balcony', 'TEXT'),
        ('distance_sea', 'TEXT'),
        ('distance_center', 'TEXT'),
        ('distance_airport', 'TEXT')
    ]
    
    # Get existing columns
    cursor.execute("PRAGMA table_info(listings)")
    existing_columns = [column[1] for column in cursor.fetchall()]
    
    for col_name, col_type in new_columns:
        if col_name not in existing_columns:
            print(f"Adding column {col_name}...")
            cursor.execute(f"ALTER TABLE listings ADD COLUMN {col_name} {col_type}")
        else:
            print(f"Column {col_name} already exists.")
            
    conn.commit()
    conn.close()
    print("Migration completed.")

if __name__ == "__main__":
    migrate()
