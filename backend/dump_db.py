import sqlite3
import os

db_path = 'caria.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT id, content_key, section FROM site_content")
    rows = cursor.fetchall()
    for row in rows:
        print(f"ID: {row['id']} | Key: {row['content_key']} | Section: {row['section']}")
    conn.close()
else:
    print(f"Database not found at {db_path}")
