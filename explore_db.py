import pymysql
import json

def explore_db():
    try:
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password='',
            database='old_caria',
            cursorclass=pymysql.cursors.DictCursor
        )
        with connection.cursor() as cursor:
            # 1. List all tables
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            print(f"Tables in old_caria: {[list(t.values())[0] for t in tables]}")
            
            # 2. Check each bina table for 2025 data
            bina_tables = [list(t.values())[0] for t in tables if 'bina' in list(t.values())[0]]
            print(f"Checking tables: {bina_tables}")
            
            for table in bina_tables:
                # Check date formats and counts
                print(f"\n--- Exploring table: {table} ---")
                
                # Check for 2025 in tarih (date) or pyear (year)
                cursor.execute(f"SELECT COUNT(*) as count FROM `{table}` WHERE `tarih` LIKE '2025%' OR `pyear` = '2025'")
                count_2025 = cursor.fetchone()['count']
                print(f"Listings from 2025: {count_2025}")
                
                if count_2025 > 0:
                    cursor.execute(f"SELECT * FROM `{table}` WHERE `tarih` LIKE '2025%' OR `pyear` = '2025' LIMIT 5")
                    samples = cursor.fetchall()
                    print(f"Sample data for 2025: {json.dumps(samples, indent=2, default=str)}")
                else:
                    # Check most recent data to see if 2025 is just around the corner or if format is different
                    cursor.execute(f"SELECT * FROM `{table}` ORDER BY `tarih` DESC LIMIT 1")
                    latest = cursor.fetchone()
                    print(f"Latest listing in {table}: {latest['tarih'] if latest else 'None'}")

            # 3. Check ensellar just in case user wasn't mistaken
            if 'enseller' in [list(t.values())[0] for t in tables]:
                print("\n--- Exploring table: enseller ---")
                cursor.execute("SELECT * FROM `enseller` LIMIT 2")
                print(f"enseller sample: {json.dumps(cursor.fetchall(), indent=2, default=str)}")

        connection.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    explore_db()
