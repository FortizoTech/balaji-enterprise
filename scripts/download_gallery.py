"""
Download high-resolution images from jbalaji.com gallery.
Run: python scripts/download_gallery.py
"""
import asyncio
import os
import re
import urllib.request
from playwright.async_api import async_playwright

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 'gallery')
os.makedirs(OUTPUT_DIR, exist_ok=True)

URLS_TO_SCRAPE = [
    'https://jbalaji.com/gallery/',
    'https://jbalaji.com/',
]

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        )
        page = await context.new_page()
        
        all_images = []

        for url in URLS_TO_SCRAPE:
            print(f'Scraping: {url}')
            try:
                await page.goto(url, wait_until='networkidle', timeout=30000)
                # Extract all image src attributes
                srcs = await page.evaluate('''() => {
                    const imgs = document.querySelectorAll('img');
                    return Array.from(imgs).map(img => img.src || img.getAttribute('data-src') || '');
                }''')
                srcs = [s for s in srcs if s and ('http' in s) and not s.endswith('.svg')]
                print(f'  Found {len(srcs)} images')
                all_images.extend(srcs)
            except Exception as e:
                print(f'  Error scraping {url}: {e}')

        await browser.close()

        # Deduplicate
        all_images = list(dict.fromkeys(all_images))
        print(f'\nTotal unique images found: {len(all_images)}')

        # Filter for likely high-res images (exclude small icons/logos)
        high_res = []
        for url in all_images:
            lurl = url.lower()
            # Skip known small files / icons / admin assets
            if any(x in lurl for x in ['logo', 'favicon', 'icon', 'avatar', 'wp-admin', '150x150', '100x', '-50x', 'thumb']):
                continue
            high_res.append(url)

        print(f'High-res candidate images: {len(high_res)}')

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
            'Referer': 'https://jbalaji.com/',
        }

        downloaded = 0
        for i, img_url in enumerate(high_res[:20]):  # Download max 20 images
            ext = img_url.split('?')[0].split('.')[-1]
            if ext.lower() not in ['jpg', 'jpeg', 'png', 'webp']:
                ext = 'jpg'
            filename = f'gallery-{i+1:02d}.{ext}'
            filepath = os.path.join(OUTPUT_DIR, filename)
            try:
                req = urllib.request.Request(img_url, headers=headers)
                with urllib.request.urlopen(req, timeout=15) as resp:
                    data = resp.read()
                    # Only save images larger than 50KB (skip tiny icons)
                    if len(data) > 50_000:
                        with open(filepath, 'wb') as f:
                            f.write(data)
                        print(f'  Downloaded: {filename} ({len(data)//1024}KB) <- {img_url[:80]}')
                        downloaded += 1
                    else:
                        print(f'  Skipped (too small {len(data)//1024}KB): {img_url[:80]}')
            except Exception as e:
                print(f'  Error downloading {img_url[:80]}: {e}')

        print(f'\nDone. Downloaded {downloaded} high-res images to: {OUTPUT_DIR}')

asyncio.run(main())
