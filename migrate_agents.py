
import sqlite3

db_path = 'backend/caria.db'

def migrate_agents():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    agents = [
        { "name": "Hakan Okur", "slug": "hakan-okur", "title": "Founder & Property Advisor", "email": "hakan@cariaestates.com", "phone": "+90 548 844 1414", "thumbnail": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=1200&fit=crop" },
        { "name": "Yeliz Okur", "slug": "yeliz-okur", "title": "Director & Sales Manager", "email": "yeliz@cariaestates.com", "phone": "+90 548 111 2233", "thumbnail": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1200&fit=crop" },
        { "name": "Elena Petrova", "slug": "elena-petrova", "title": "Senior Sales Agent", "email": "elena@cariaestates.com", "phone": "+7 900 123 4567", "thumbnail": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=1200&fit=crop" },
        { "name": "Hale Öztürk", "slug": "hale-ozturk", "title": "Sales Representative", "email": "hale@cariaestates.com", "phone": "+90 542 888 7766", "thumbnail": "https://images.unsplash.com/photo-1567532939604-b6b5b0ad2f01?w=800&h=1200&fit=crop" }
    ]

    for agent in agents:
        cursor.execute("SELECT id FROM advisors WHERE slug=?", (agent['slug'],))
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO advisors (name, slug, title, email, phone, image_url, bio_html)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                agent['name'], 
                agent['slug'], 
                agent['title'], 
                agent['email'], 
                agent['phone'], 
                agent['thumbnail'],
                f"<p>{agent['name']} is a dedicated member of our team with extensive knowledge of the local real estate market.</p>"
            ))
            print(f"Migrated agent: {agent['name']}")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate_agents()
