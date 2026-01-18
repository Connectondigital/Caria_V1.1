import pymysql
import json
from datetime import datetime, date

def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError ("Type %s not serializable" % type(obj))

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
            cursor.execute("SHOW TABLES")
            tables = [list(t.values())[0] for t in cursor.fetchall()]
            
            bina_tables = [t for t in tables if 'bina' in t]
            results = {}
            
            for table in bina_tables:
                try:
                    cursor.execute(f"SELECT COUNT(*) as count FROM `{table}` WHERE `tarih` LIKE '2025%' OR `pyear` = '2025'")
                    count_2025 = cursor.fetchone()['count']
                    
                    cursor.execute(f"SELECT MAX(`tarih`) as latest_date FROM `{table}`")
                    latest_date = cursor.fetchone()['latest_date']
                    
                    results[table] = {
                        "count_2025": count_2025,
                        "latest_date": str(latest_date)
                    }
                    
                    if count_2025 > 0:
                        cursor.execute(f"SELECT kimlik, pname, pprice, tarih, pyear, pmainpic FROM `{table}` WHERE `tarih` LIKE '2025%' OR `pyear` = '2025' LIMIT 5")
                        results[table]["samples"] = cursor.fetchall()
                except Exception as e:
                    results[table] = {"error": str(e)}

            print(json.dumps(results, indent=2, default=json_serial))

        connection.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    explore_db()
