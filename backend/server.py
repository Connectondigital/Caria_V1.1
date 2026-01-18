import sqlite3
from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DB_PATH = ROOT_DIR / 'caria.db'

# Database Connection Helper
def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# Models
class LoginRequest(BaseModel):
    email: str
    password: str

class SliderItem(BaseModel):
    title: str
    image_url: str
    link: Optional[str] = "#"
    display_order: int = 0
    active: bool = True

class SiteContent(BaseModel):
    content_key: str
    value_tr: str
    value_en: Optional[str] = ""
    section: str

class CountryGuide(BaseModel):
    id: Optional[int] = None
    country_name_tr: str
    country_name_en: Optional[str] = ""
    content_tr: Optional[str] = ""
    content_en: Optional[str] = ""
    image_url: Optional[str] = ""
    slug: str

class SEOSetting(BaseModel):
    id: Optional[int] = None
    page_name: str
    title_tr: Optional[str] = ""
    title_en: Optional[str] = ""
    description_tr: Optional[str] = ""
    description_en: Optional[str] = ""
    keywords_tr: Optional[str] = ""
    keywords_en: Optional[str] = ""

class Page(BaseModel):
    id: Optional[int] = None
    title: str
    slug: str
    content_html: Optional[str] = ""
    banner_title: Optional[str] = ""
    banner_url: Optional[str] = ""
    active: int = 1
    gallery_json: Optional[str] = "[]"

class HomepageBlock(BaseModel):
    id: Optional[int] = None
    block_type: str
    title: Optional[str] = ""
    subtitle: Optional[str] = ""
    content: Optional[str] = ""
    image_url: Optional[str] = ""
    video_url: Optional[str] = ""
    display_order: int = 0
    active: bool = True

class Advisor(BaseModel):
    id: Optional[int] = None
    name: str
    slug: str
    title: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    bio_html: Optional[str] = ""
    image_url: Optional[str] = ""

# Helper to seed initial pages if missing
def seed_initial_pages(db):
    cursor = db.cursor()
    initial_pages = [
        ("Anasayfa", "home", "<h1>Hoşgeldiniz</h1>", "Caria Estates'e Hoşgeldiniz", "/assets/hero-video.mp4"),
        ("Hakkımızda", "about", "<p>Caria Estates hakkında...</p>", "Biz Kimiz?", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"),
        ("Hizmetlerimiz", "services", "<ul><li>Gayrimenkul Danışmanlığı</li></ul>", "Hizmetlerimiz", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"),
        ("Satın Al", "buy", "<p>Satılık portföyümüz...</p>", "Gayrimenkul Satın Al", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"),
        ("Kirala", "rent", "<p>Kiralık ilanlarımız...</p>", "Kiralık Gayrimenkuller", "https://images.unsplash.com/photo-1613490493576-7fde63acd811"),
        ("İletişim", "contact", "<p>Bize ulaşın...</p>", "İletişime Geçin", "https://images.unsplash.com/photo-1628744276664-2d03a9baecaa"),
    ]
    for title, slug, content, b_title, b_url in initial_pages:
        cursor.execute("SELECT id FROM pages WHERE slug = ?", (slug,))
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO pages (title, slug, content_html, banner_title, banner_url)
                VALUES (?, ?, ?, ?, ?)
            """, (title, slug, content, b_title, b_url))
    db.commit()

class Menu(BaseModel):
    id: Optional[int] = None
    title: str
    url: str
    menu_type: str = "header"
    display_order: int = 0

class Inquiry(BaseModel):
    id: Optional[int] = None
    name: str
    email: Optional[str] = ""
    phone: Optional[str] = ""
    message: Optional[str] = ""
    property_id: Optional[int] = None
    status: Optional[str] = "new"
    created_at: Optional[str] = None

class Property(BaseModel):
    id: Optional[int] = None
    slug: str
    title: str
    location: Optional[str] = ""
    price: Optional[str] = ""
    beds: Optional[int] = 0
    baths: Optional[int] = 0
    area: Optional[str] = ""
    plotSize: Optional[str] = ""
    reference: Optional[str] = ""
    image: Optional[str] = ""
    tag: Optional[str] = ""
    region: Optional[str] = ""
    kocan_tipi: Optional[str] = ""
    ozellikler_ic: Optional[str] = ""
    ozellikler_dis: Optional[str] = ""
    pdf_brosur: Optional[str] = ""
    advisor_id: Optional[int] = None
    status: Optional[str] = "published"
    description: Optional[str] = ""
    description_en: Optional[str] = ""
    beds_room_count: Optional[str] = "1"
    baths_count: Optional[str] = "1"
    plot_area: Optional[str] = ""
    closed_area: Optional[str] = ""
    is_featured: bool = False
    title_en: Optional[str] = ""

# Routes
api_router = APIRouter(prefix="/api")

@api_router.get("/")
async def root():
    return {"status": "online", "message": "Caria Estates API (SQLite)"}

@api_router.get("/properties")
async def get_properties(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM listings")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@api_router.post("/properties")
async def add_property(item: Property, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    if item.id:
        cursor.execute("""
            UPDATE listings SET 
            slug=?, title=?, location=?, price=?, beds=?, baths=?, area=?, plotSize=?, reference=?, image=?, tag=?, region=?, 
            kocan_tipi=?, ozellikler_ic=?, ozellikler_dis=?, pdf_brosur=?, advisor_id=?, status=?, description=?,
            description_en=?, beds_room_count=?, baths_count=?, plot_area=?, closed_area=?, is_featured=?, title_en=?
            WHERE id=?
        """, (item.slug, item.title, item.location, item.price, item.beds, item.baths, item.area, item.plotSize, item.reference, item.image, item.tag, item.region, 
              item.kocan_tipi, item.ozellikler_ic, item.ozellikler_dis, item.pdf_brosur, item.advisor_id, item.status, item.description,
              item.description_en, item.beds_room_count, item.baths_count, item.plot_area, item.closed_area, item.is_featured, item.title_en, item.id))
    else:
        cursor.execute("""
            INSERT INTO listings (slug, title, location, price, beds, baths, area, plotSize, reference, image, tag, region, kocan_tipi, ozellikler_ic, ozellikler_dis, pdf_brosur, advisor_id, status, description, description_en, beds_room_count, baths_count, plot_area, closed_area, is_featured, title_en)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (item.slug, item.title, item.location, item.price, item.beds, item.baths, item.area, item.plotSize, item.reference, item.image, item.tag, item.region, 
              item.kocan_tipi, item.ozellikler_ic, item.ozellikler_dis, item.pdf_brosur, item.advisor_id, item.status, item.description, item.description_en,
              item.beds_room_count, item.baths_count, item.plot_area, item.closed_area, item.is_featured, item.title_en))
    db.commit()
    return {"status": "success", "id": cursor.lastrowid if not item.id else item.id}

@api_router.get("/properties/{slug}")
async def get_property(slug: str, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM listings WHERE slug=?", (slug,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Property not found")
    return dict(row)

@api_router.delete("/properties/{id}")
async def delete_property(id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM listings WHERE id=?", (id,))
    db.commit()
    return {"status": "success"}

# Inquiry Endpoints
@api_router.get("/inquiries")
async def get_inquiries(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM inquiries ORDER BY created_at DESC")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@api_router.post("/inquiries")
async def add_inquiry(item: Inquiry, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("""
        INSERT INTO inquiries (name, email, phone, message, property_id, status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (item.name, item.email, item.phone, item.message, item.property_id, item.status))
    db.commit()
    return {"status": "success", "id": cursor.lastrowid}

@api_router.delete("/inquiries/{id}")
async def delete_inquiry(id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM inquiries WHERE id=?", (id,))
    db.commit()
    return {"status": "success"}

@api_router.post("/auth/signin")
async def login(request: LoginRequest):
    if request.email == "admin@cariaestates.com" and request.password == "123456":
        return {
            "status": "success",
            "data": {
                "token": "fake-jwt-token",
                "user": {
                    "email": request.email,
                    "name": "Admin User",
                    "role": "admin"
                }
            }
        }
    raise HTTPException(status_code=401, detail="Geçersiz e-posta veya şifre")

# CMS Endpoints
@api_router.get("/cms/sliders")
async def get_sliders(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM sliders WHERE active = 1 ORDER BY display_order")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@api_router.post("/cms/sliders")
async def add_slider(item: SliderItem, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("INSERT INTO sliders (title, image_url, link, display_order, active) VALUES (?, ?, ?, ?, ?)",
                   (item.title, item.image_url, item.link, item.display_order, item.active))
    db.commit()
    return {"status": "success", "id": cursor.lastrowid}

@api_router.get("/cms/content")
async def get_content(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM site_content")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@api_router.post("/cms/content")
@api_router.post("/cms/update")
async def update_content(item: SiteContent, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("""
        INSERT INTO site_content (content_key, value_tr, value_en, section)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(content_key) DO UPDATE SET
        value_tr=excluded.value_tr,
        value_en=excluded.value_en,
        section=excluded.section
    """, (item.content_key, item.value_tr, item.value_en, item.section))
    db.commit()
    return {"status": "success"}

# Country Guides Endpoints
@api_router.get("/cms/country-guides")
async def get_country_guides(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM country_guides")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@api_router.post("/cms/country-guides")
async def update_country_guide(item: CountryGuide, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    if item.id:
        cursor.execute("""
            UPDATE country_guides SET 
            country_name_tr=?, country_name_en=?, content_tr=?, content_en=?, image_url=?, slug=?
            WHERE id=?
        """, (item.country_name_tr, item.country_name_en, item.content_tr, item.content_en, item.image_url, item.slug, item.id))
    else:
        cursor.execute("""
            INSERT INTO country_guides (country_name_tr, country_name_en, content_tr, content_en, image_url, slug)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (item.country_name_tr, item.country_name_en, item.content_tr, item.content_en, item.image_url, item.slug))
    db.commit()
    return {"status": "success"}

# SEO Settings Endpoints
@api_router.get("/cms/seo")
async def get_seo_settings(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM seo_settings")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@api_router.post("/cms/seo")
async def update_seo_settings(item: SEOSetting, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("""
        INSERT INTO seo_settings (page_name, title_tr, title_en, description_tr, description_en, keywords_tr, keywords_en)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(page_name) DO UPDATE SET
        title_tr=excluded.title_tr,
        title_en=excluded.title_en,
        description_tr=excluded.description_tr,
        description_en=excluded.description_en,
        keywords_tr=excluded.keywords_tr,
        keywords_en=excluded.keywords_en
    """, (item.page_name, item.title_tr, item.title_en, item.description_tr, item.description_en, item.keywords_tr, item.keywords_en))
    db.commit()
    return {"status": "success"}

# Dynamic Pages Endpoints
@api_router.get("/cms/pages")
async def get_pages(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM pages ORDER BY created_at DESC")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@api_router.get("/cms/pages/{slug}")
@api_router.get("/pages/{slug}")
async def get_page_by_slug(slug: str, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM pages WHERE slug = ?", (slug,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Page not found")
    return dict(row)

@api_router.post("/cms/pages")
async def save_page(item: Page, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    if item.id:
        cursor.execute("""
            UPDATE pages SET title=?, slug=?, content_html=?, banner_title=?, banner_url=?, active=?, gallery_json=?, updated_at=CURRENT_TIMESTAMP
            WHERE id=?
        """, (item.title, item.slug, item.content_html, item.banner_title, item.banner_url, item.active, item.gallery_json, item.id))
    else:
        cursor.execute("""
            INSERT INTO pages (title, slug, content_html, banner_title, banner_url, active, gallery_json)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (item.title, item.slug, item.content_html, item.banner_title, item.banner_url, item.active, item.gallery_json))
    db.commit()
    return {"status": "success", "id": cursor.lastrowid if not item.id else item.id}

@api_router.delete("/cms/pages/{id}")
async def delete_page(id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM pages WHERE id=?", (id,))
    db.commit()
    return {"status": "success"}

# Menu Endpoints
@api_router.get("/cms/menus")
async def get_menus(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM menus ORDER BY display_order ASC")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@api_router.post("/cms/menus")
async def save_menu(item: Menu, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    if item.id:
        cursor.execute("""
            UPDATE menus SET title=?, url=?, menu_type=?, display_order=?
            WHERE id=?
        """, (item.title, item.url, item.menu_type, item.display_order, item.id))
    else:
        cursor.execute("""
            INSERT INTO menus (title, url, menu_type, display_order)
            VALUES (?, ?, ?, ?)
        """, (item.title, item.url, item.menu_type, item.display_order))
    db.commit()
    return {"status": "success", "id": cursor.lastrowid if not item.id else item.id}

@api_router.delete("/cms/menus/{id}")
async def delete_menu(id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM menus WHERE id=?", (id,))
    db.commit()
    return {"status": "success"}

# Homepage Blocks Endpoints
@api_router.get("/cms/homepage")
@api_router.get("/homepage/blocks")
async def get_homepage_blocks(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM homepage_blocks WHERE active = 1 ORDER BY display_order ASC")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@api_router.post("/cms/homepage")
@api_router.post("/homepage/blocks")
async def save_homepage_block(item: HomepageBlock, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    if item.id:
        cursor.execute("""
            UPDATE homepage_blocks SET 
            block_type=?, title=?, subtitle=?, content=?, image_url=?, video_url=?, display_order=?, active=?, updated_at=CURRENT_TIMESTAMP
            WHERE id=?
        """, (item.block_type, item.title, item.subtitle, item.content, item.image_url, item.video_url, item.display_order, item.active, item.id))
    else:
        cursor.execute("""
            INSERT INTO homepage_blocks (block_type, title, subtitle, content, image_url, video_url, display_order, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (item.block_type, item.title, item.subtitle, item.content, item.image_url, item.video_url, item.display_order, item.active))
    db.commit()
    return {"status": "success", "id": cursor.lastrowid if not item.id else item.id}

@api_router.delete("/cms/homepage/{id}")
async def delete_homepage_block(id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM homepage_blocks WHERE id=?", (id,))
    db.commit()
    return {"status": "success"}

# Advisor Endpoints
@api_router.get("/advisors")
async def get_advisors(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM advisors")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@api_router.get("/advisors/{slug}")
async def get_advisor_by_slug(slug: str, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM advisors WHERE slug = ?", (slug,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Advisor not found")
    
    advisor = dict(row)
    
    # Also fetch this advisor's listings
    cursor.execute("SELECT * FROM listings WHERE advisor_id = ?", (advisor['id'],))
    advisor['listings'] = [dict(r) for r in cursor.fetchall()]
    
    return advisor

@api_router.post("/advisors")
async def save_advisor(item: Advisor, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    if item.id:
        cursor.execute("""
            UPDATE advisors SET name=?, slug=?, title=?, email=?, phone=?, bio_html=?, image_url=?
            WHERE id=?
        """, (item.name, item.slug, item.title, item.email, item.phone, item.bio_html, item.image_url, item.id))
    else:
        cursor.execute("""
            INSERT INTO advisors (name, slug, title, email, phone, bio_html, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (item.name, item.slug, item.title, item.email, item.phone, item.bio_html, item.image_url))
    db.commit()
    return {"status": "success", "id": cursor.lastrowid if not item.id else item.id}

@api_router.delete("/advisors/{id}")
async def delete_advisor(id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM advisors WHERE id=?", (id,))
    db.commit()
    return {"status": "success"}

app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    # Seed initial CMS pages if they don't exist
    with sqlite3.connect(DB_PATH) as conn:
        seed_initial_pages(conn)
    port = int(os.environ.get('PORT', 5001))
    uvicorn.run(app, host="0.0.0.0", port=port)