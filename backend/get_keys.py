import sqlite3
import os

db_path = 'caria.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT content_key FROM site_content")
    rows = cursor.fetchall()
    keys = [row['content_key'] for row in rows]
    print("DATABASE_KEYS: " + ",".join(keys))
    conn.close()
else:
    print("DB_NOT_FOUND")
