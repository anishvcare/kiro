"""Scrape all sparefix.co.in product pages and dump to products.json."""
import json
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

from parse import parse_product

SITEMAP = "https://sparefix.co.in/sitemap.xml"
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; product-export/1.0)"}


def get_product_urls():
    xml = requests.get(SITEMAP, headers=HEADERS, timeout=60).text
    urls = re.findall(r"<loc>(https://sparefix\.co\.in/products/details/[^<]+)</loc>", xml)
    # dedupe preserve order
    seen, out = set(), []
    for u in urls:
        if u not in seen:
            seen.add(u)
            out.append(u)
    return out


def fetch_one(url, session, retries=3):
    for attempt in range(retries):
        try:
            r = session.get(url, headers=HEADERS, timeout=45)
            if r.status_code == 200 and len(r.text) > 1000:
                return parse_product(r.text, url)
            time.sleep(1 + attempt)
        except Exception:
            time.sleep(1 + attempt)
    return {"url": url, "error": True}


def main():
    urls = get_product_urls()
    print(f"Total product URLs: {len(urls)}", flush=True)
    results = []
    session = requests.Session()
    done = 0
    with ThreadPoolExecutor(max_workers=24) as ex:
        futs = {ex.submit(fetch_one, u, session): u for u in urls}
        for fut in as_completed(futs):
            d = fut.result()
            results.append(d)
            done += 1
            if done % 50 == 0:
                print(f"  {done}/{len(urls)} done", flush=True)
    # order by url to be deterministic
    results.sort(key=lambda d: d.get("url", ""))
    with open("products.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    errs = [r for r in results if r.get("error")]
    print(f"Scraped {len(results)} products, {len(errs)} errors", flush=True)
    if errs:
        for e in errs[:20]:
            print("  ERROR:", e["url"], flush=True)


if __name__ == "__main__":
    main()
