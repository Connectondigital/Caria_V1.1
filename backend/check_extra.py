import sqlite3

def check_extra():
    conn = sqlite3.connect('caria.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [t[0] for t in cursor.fetchall()]
    
    for table in ['sliders', 'country_guides']:
        if table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            print(f"{table} count: {cursor.fetchone()[0]}")
    
    conn.close()

if __name__ == '__main__':
    check_extra()
