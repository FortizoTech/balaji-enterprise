import os
import asyncio
from playwright.async_api import async_playwright
from urllib.parse import urljoin, urlparse

async def download_images(page, base_url, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    print(f"Scraping {base_url} for images with Playwright...")
    
    try:
        await page.goto(base_url, timeout=60000)
        # Wait a bit for dynamic content
        await asyncio.sleep(2)
        
        # Get all image sources
        img_srcs = await page.evaluate('''() => {
            const imgs = Array.from(document.querySelectorAll('img'));
            return imgs.map(img => img.src).filter(src => src);
        }''')
        
        downloaded = 0
        for src in img_srcs:
            img_url = urljoin(base_url, src)
            
            # Filter for likely relevant assets
            if any(ext in img_url.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                try:
                    img_name = os.path.basename(urlparse(img_url).path)
                    if not img_name:
                        continue
                        
                    target_path = os.path.join(output_dir, img_name)
                    
                    if os.path.exists(target_path):
                        continue
                    
                    # Use page context to download to bypass protection
                    response = await page.request.get(img_url)
                    if response.status == 200:
                        with open(target_path, 'wb') as f:
                            f.write(await response.body())
                        print(f"Downloaded: {img_name}")
                        downloaded += 1
                except Exception as e:
                    print(f"Error downloading {img_url}: {e}")
                    
        print(f"Total images downloaded from {base_url}: {downloaded}")
    except Exception as e:
        print(f"Failed to scrape {base_url}: {e}")

async def main():
    WEBSITE_URL = "https://jbalaji.com"
    ASSETS_DIR = "public/assets/scraped"
    
    PAGES = [
        "/",
        "/gallery/"
    ]
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        for page_path in PAGES:
            full_url = urljoin(WEBSITE_URL, page_path)
            await download_images(page, full_url, ASSETS_DIR)
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
