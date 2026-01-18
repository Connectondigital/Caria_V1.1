import sqlite3
import os

def update_schema():
    db_path = os.path.join(os.path.dirname(__file__), 'caria.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    columns_to_add = [
        ("kocan_tipi", "TEXT"),
        ("ozellikler_ic", "TEXT"),
        ("ozellikler_dis", "TEXT"),
        ("pdf_brosur", "TEXT"),
        ("advisor_id", "INTEGER"),
        ("status", "TEXT"),
        ("description", "TEXT")
    ]

    cursor.execute("PRAGMA table_info(listings)")
    existing_columns = [col[1] for col in cursor.fetchall()]

    for col_name, col_type in columns_to_add:
        if col_name not in existing_columns:
            print(f"Adding column {col_name}...")
            cursor.execute(f"ALTER TABLE listings ADD COLUMN {col_name} {col_type}")

    conn.commit()
    conn.close()
    print("Schema updated successfully.")

if __name__ == "__main__":
    update_schema()
