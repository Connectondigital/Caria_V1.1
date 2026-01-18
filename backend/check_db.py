import sqlite3
import json

def check_db():
    conn = sqlite3.connect('caria.db')
    cursor = conn.cursor()
    
    # Check tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [t[0] for t in cursor.fetchall()]
    print(f"Tables: {tables}")
    
    # Check listings count
    if 'listings' in tables:
        cursor.execute("SELECT count(*) FROM listings")
        count = cursor.fetchone()[0]
        print(f"Listings count: {count}")
        
    # Check site_content
    if 'site_content' in tables:
        cursor.execute("SELECT content_key, section FROM site_content")
        contents = cursor.fetchall()
        print(f"Site Content: {contents}")

    conn.close()

if __name__ == '__main__':
    check_db()
