import sqlite3
import json

def seed_pages():
    conn = sqlite3.connect('backend/caria.db')
    cursor = conn.cursor()
    
    pages = [
        ('Hakkımızda', 'about', '<h1>Hakkımızda</h1><p>Caria Estates hakkında bilgiler...</p>', 'Biz Kimiz?', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920'),
        ('Hizmetlerimiz', 'services', '<h1>Hizmetlerimiz</h1><p>Sunduğumuz profesyonel hizmetler...</p>', 'Profesyonel Hizmetler', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920'),
        ('Satın Al', 'buy', '<h1>Gayrimenkul Satın Al</h1><p>Satılık portföyümüzü keşfedin...</p>', 'Hayalinizdeki Evi Bulun', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920'),
        ('Kiralama', 'rent', '<h1>Gayrimenkul Kiralama</h1><p>Kiralık ev seçeneklerimiz...</p>', 'Konforlu Yaşam Alanları', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920'),
        ('İletişim', 'contact', '<h1>İletişim</h1><p>Bize her zaman ulaşabilirsiniz.</p>', 'Bize Ulaşın', 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?w=1920')
    ]
    
    for title, slug, content, b_title, b_url in pages:
        cursor.execute("SELECT id FROM pages WHERE slug = ?", (slug,))
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO pages (title, slug, content_html, banner_title, banner_url, active, gallery_json)
                VALUES (?, ?, ?, ?, ?, 1, '[]')
            """, (title, slug, content, b_title, b_url))
            print(f"Seeded: {slug}")
        else:
            print(f"Skipped (exists): {slug}")
            
    conn.commit()
    conn.close()

if __name__ == "__main__":
    seed_pages()
