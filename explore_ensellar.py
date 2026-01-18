import pymysql
import json
from datetime import datetime, date

def json_serial(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError ("Type %s not serializable" % type(obj))

def explore_ensellar():
    try:
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password='',
            database='old_caria',
            cursorclass=pymysql.cursors.DictCursor
        )
        with connection.cursor() as cursor:
            cursor.execute("DESCRIBE ensellar")
            schema = cursor.fetchall()
            
            cursor.execute("SELECT COUNT(*) as count FROM ensellar")
            total_count = cursor.fetchone()['count']
            
            cursor.execute("SELECT * FROM ensellar LIMIT 5")
            samples = cursor.fetchall()
            
            results = {
                "schema": schema,
                "total_count": total_count,
                "samples": samples
            }
            
            print(json.dumps(results, indent=2, default=json_serial))

        connection.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    explore_ensellar()
