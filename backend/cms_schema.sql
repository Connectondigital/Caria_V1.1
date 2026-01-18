-- CMS Database Schema for Caria Estates
-- Table for dynamic site content
CREATE TABLE site_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content_key VARCHAR(255) UNIQUE NOT NULL,
    value_tr TEXT,
    value_en TEXT,
    section VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for media management
CREATE TABLE media_assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    file_url VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    alt_text VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Country Guides
CREATE TABLE country_guides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    country_name_tr VARCHAR(255) NOT NULL,
    country_name_en VARCHAR(255),
    content_tr TEXT,
    content_en TEXT,
    image_url VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for SEO Settings
CREATE TABLE seo_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_name VARCHAR(255) UNIQUE NOT NULL,
    title_tr VARCHAR(255),
    title_en VARCHAR(255),
    description_tr TEXT,
    description_en TEXT,
    keywords_tr TEXT,
    keywords_en TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
