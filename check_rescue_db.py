import sqlite3

def check_db():
    try:
        conn = sqlite3.connect('backend/caria.db')
        cursor = conn.cursor()
        
        print("--- ADVISORS ---")
        cursor.execute("SELECT name FROM advisors")
        advisors = cursor.fetchall()
        for a in advisors:
            print(a[0])
            
        print("\n--- PROPERTIES ---")
        cursor.execute("SELECT COUNT(*) FROM properties")
        count = cursor.fetchone()[0]
        print(f"Total properties: {count}")
        
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_db()
