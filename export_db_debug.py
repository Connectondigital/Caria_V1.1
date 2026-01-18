import sqlite3
import json

def export_db_to_json():
    try:
        conn = sqlite3.connect('backend/caria.db')
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        tables = ['listings', 'advisors', 'site_content', 'sliders', 'country_guides', 'homepage_blocks']
        data = {}
        
        for table in tables:
            cursor.execute(f"SELECT * FROM {table}")
            rows = cursor.fetchall()
            data[table] = [dict(row) for row in rows]
            
        with open('debug_db_export.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        print("Export successful: debug_db_export.json")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    export_db_to_json()
