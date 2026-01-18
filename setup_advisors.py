
import sqlite3

db_path = 'backend/caria.db'

def setup_advisors():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 1. Create advisors table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS advisors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            title TEXT,
            email TEXT,
            phone TEXT,
            bio_html TEXT,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # 2. Seed an initial advisor (Pilar-style)
    initial_bio = """
    <p>With over 15 years of experience in the North Cyprus luxury real estate market, I provide a bespoke service tailored to those seeking exclusive Mediterranean lifestyles.</p>
    <p>My approach is rooted in transparency, local expertise, and a deep appreciation for the unique architecture of our island.</p>
    """
    
    cursor.execute("SELECT id FROM advisors WHERE slug='pilar-anguita'")
    if not cursor.fetchone():
        cursor.execute("""
            INSERT INTO advisors (name, slug, title, email, phone, bio_html, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            "Pilar Anguita", 
            "pilar-anguita", 
            "Senior Property Advisor", 
            "pilar@cariaestates.com", 
            "+90 548 111 2233",
            initial_bio,
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1200&fit=crop"
        ))
    
    # 3. Update some random listings to this advisor if they exist
    cursor.execute("SELECT id FROM listings LIMIT 5")
    listings = cursor.fetchall()
    if listings:
        cursor.execute("SELECT id FROM advisors WHERE slug='pilar-anguita'")
        advisor_id = cursor.fetchone()[0]
        for (l_id,) in listings:
            cursor.execute("UPDATE listings SET danisman_id=? WHERE id=?", (advisor_id, l_id))

    conn.commit()
    print("Advisors table created and seeded.")
    conn.close()

if __name__ == "__main__":
    setup_advisors()
