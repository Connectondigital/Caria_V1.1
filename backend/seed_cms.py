import sqlite3
import json

def update_cms_content():
    conn = sqlite3.connect('backend/caria.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Create table if not exists (should already exist but just in case)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS site_content (
            content_key TEXT PRIMARY KEY,
            value_tr TEXT,
            value_en TEXT,
            section TEXT
        )
    """)

    contents = [
        ('hakkimizda_metni', '<h1>Caria Estates | Hakkımızda</h1><p>20 yılı aşkın tecrübemizle Akdeniz\'in en seçkin gayrimenkullerini sizlerle buluşturuyoruz. Kuzey Kıbrıs, Türkiye ve İtalya\'daki uzman ekiplerimizle hayalinizdeki yaşama giden yolda yanınızdayız.</p>', '', 'About'),
        ('vizyonumuz_metni', '<h2>Vizyonumuz</h2><p>Gayrimenkul sektöründe dürüstlük ve profesyonellik ilkelerimizden ödün vermeden, global ölçekte lider bir danışmanlık firması olmak.</p>', '', 'Vision'),
        ('misyonumuz_metni', '<h2>Misyonumuz</h2><p>Müşterilerimize en doğru yatırım fırsatlarını sunarak, mülk edinme süreçlerini kolaylaştırmak ve satış sonrası hizmetlerimizle kalıcı değer yaratmak.</p>', '', 'Mission'),
        ('hizmetler_ust_metin', '<h1>Profesyonel Gayrimenkul Hizmetleri</h1><p>Caria Estates olarak sadece emlakçı değil, yatırım ortağınızız. Alım, satım, kiralama ve yönetim süreçlerinin tamamında şeffaf hizmet sunuyoruz.</p>', '', 'Services')
    ]

    for key, val_tr, val_en, section in contents:
        cursor.execute("""
            INSERT INTO site_content (content_key, value_tr, value_en, section)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(content_key) DO UPDATE SET
            value_tr=excluded.value_tr,
            value_en=excluded.value_en,
            section=excluded.section
        """, (key, val_tr, val_en, section))
    
    conn.commit()
    print("CMS content updated successfully.")

    # List content
    cursor.execute("SELECT * FROM site_content")
    rows = cursor.fetchall()
    for row in rows:
        print(f"Key: {row['content_key']}, Section: {row['section']}")

    conn.close()

if __name__ == "__main__":
    update_cms_content()
