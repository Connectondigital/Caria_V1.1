import sqlite3
import json
from pathlib import Path

def explore_sqlite():
    db_path = Path('backend/caria.db')
    if not db_path.exists():
        print(f"Error: Database not found at {db_path}")
        return

    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # List tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row['name'] for row in cursor.fetchall()]
        print(f"Tables: {tables}")

        for table in tables:
            print(f"\n--- Schema: {table} ---")
            cursor.execute(f"PRAGMA table_info({table})")
            info = cursor.fetchall()
            for col in info:
                print(f"  {col['name']} ({col['type']})")

            # Sample data
            cursor.execute(f"SELECT * FROM {table} LIMIT 2")
            samples = [dict(row) for row in cursor.fetchall()]
            print(f"  Sample: {json.dumps(samples, indent=2, default=str)}")

        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    explore_sqlite()
