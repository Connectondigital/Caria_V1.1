import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'caria.db')
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

print("--- SITE CONTENT ---")
cursor.execute("SELECT * FROM site_content")
for row in cursor.fetchall():
    print(dict(row))

print("\n--- SLIDERS ---")
cursor.execute("SELECT * FROM sliders")
for row in cursor.fetchall():
    print(dict(row))

print("\n--- LISTINGS (Sample) ---")
cursor.execute("SELECT id, title, slug FROM listings LIMIT 5")
for row in cursor.fetchall():
    print(dict(row))

conn.close()
