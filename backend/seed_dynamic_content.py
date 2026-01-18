import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'caria.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

contents = [
    ('hero_title', 'CARIA ESTATES', 'hero'),
    ('hero_subtitle', 'Exclusive Mediterranean Living', 'hero'),
    ('hero_btn_text', 'Explore Properties', 'hero'),
    ('hero_slider_btn_text', 'Explore More', 'hero'),
    ('intro_text', 'Caria Estates provides expert guidance and luxury real estate services in Northern Cyprus. We combine local insight with global standards to offer a refined, transparent property experience. Whether you are seeking a coastal retreat, investment opportunity, or your dream Mediterranean home, our dedicated team is here to guide you every step of the way.', 'intro'),
    ('footer_address', '123 Harbor Road, Kyrenia\nNorthern Cyprus', 'footer'),
    ('footer_phone', '+90 548 123 4567', 'footer'),
    ('footer_email', 'info@cariaestates.com', 'footer'),
    ('footer_slogan', '"Beyond property, we deliver lifestyle. Northern Cyprus\'s premium real estate experience."', 'footer'),
    ('social_instagram', 'https://instagram.com/cariaestates', 'social'),
    ('social_facebook', 'https://facebook.com/cariaestates', 'social'),
    ('social_linkedin', 'https://linkedin.com/company/cariaestates', 'social'),
    ('hakkimizda_metni', '<h2>Caria Estates | Hakkımızda</h2><p>20 yılı aşkın tecrübemizle Akdeniz’in en seçkin gayrimenkullerini sizlerle buluşturuyoruz. Kuzey Kıbrıs, Türkiye ve İtalya’daki uzman ekiplerimizle hayalinizdeki yaşama giden yolda yanınızdayız.</p>', 'about'),
    ('vizyonumuz_metni', '<p>Akdeniz’in en güvenilir ve yenilikçi gayrimenkul danışmanlık firması olarak, müşterilerimize sadece bir ev değil, bir yaşam stili sunmak.</p>', 'about'),
    ('misyonumuz_metni', '<p>Şeffaf, profesyonel ve sonuç odaklı hizmet anlayışımızla, her müşterimizin gayrimenkul yatırım sürecini keyifli ve kazançlı bir deneyime dönüştürmek.</p>', 'about')
]

for key, val, section in contents:
    cursor.execute("""
        INSERT INTO site_content (content_key, value_tr, section)
        VALUES (?, ?, ?)
        ON CONFLICT(content_key) DO UPDATE SET
        value_tr=excluded.value_tr,
        section=excluded.section
    """, (key, val, section))

conn.commit()
conn.close()
print("Database seeded successfully with dynamic content keys.")
