import os
import json
import subprocess

# Configuration
DATA_FILE = "scraped_data.json"
IMAGE_BASE_DIR = "frontend/public/assets/images/properties"

def download_image(url, folder, filename):
    if not os.path.exists(folder):
        os.makedirs(folder)
    
    path = os.path.join(folder, filename)
    print(f"Downloading {url} to {path}...")
    
    # Use curl.exe as it bypasses some issues and was confirmed working
    try:
        subprocess.run(["curl.exe", "-s", "-L", url, "-o", path], check=True)
        return True
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return False

def main():
    if not os.path.exists(DATA_FILE):
        print(f"Error: {DATA_FILE} not found.")
        return

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        properties = json.load(f)

    for prop in properties:
        prop_id = prop["id"]
        remote_urls = prop.get("remote_images", [])
        
        prop_folder = os.path.join(IMAGE_BASE_DIR, f"prop-{prop_id}")
        local_paths = []
        
        for i, url in enumerate(remote_urls):
            ext = ".jpg"
            if ".png" in url.lower(): ext = ".png"
            elif ".jpeg" in url.lower(): ext = ".jpeg"
            
            filename = f"image-{i}{ext}"
            if download_image(url, prop_folder, filename):
                local_paths.append(f"/assets/images/properties/prop-{prop_id}/{filename}")
        
        prop["local_images"] = local_paths

    # Update the JSON with local paths
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(properties, f, ensure_ascii=False, indent=2)

    print("Image download complete.")

if __name__ == "__main__":
    main()
