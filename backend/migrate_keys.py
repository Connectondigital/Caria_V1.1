import sqlite3
import os

db_path = 'caria.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 1. Update about_content to hakkimizda_metni
    cursor.execute("UPDATE site_content SET content_key = 'hakkimizda_metni' WHERE content_key = 'about_content'")
    
    # 2. Update services_content to hizmetler_ust_metin
    cursor.execute("UPDATE site_content SET content_key = 'hizmetler_ust_metin' WHERE content_key = 'services_content'")
    
    # 3. Add placeholders for vision and mission if they don't exist
    for key, label, section in [
        ('vizyonumuz_metni', 'Vizyonumuz', 'Vision'),
        ('misyonumuz_metni', 'Misyonumuz', 'Mission')
    ]:
        cursor.execute("SELECT id FROM site_content WHERE content_key = ?", (key,))
        if not cursor.fetchone():
            cursor.execute("INSERT INTO site_content (content_key, value_tr, value_en, section) VALUES (?, ?, ?, ?)",
                           (key, f"<p>{label} içeriği burayı doldurun.</p>", "", section))
    
    conn.commit()
    print("Migration successful.")
    conn.close()
else:
    print("DB_NOT_FOUND")
