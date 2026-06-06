#!/usr/bin/env python3
"""
Profit Loop product exporter.

Scrapes the public QuickSell catalogue that powers justbuyindia.com, applies a
configurable price markup, removes all "Just Buy India" branding (replacing it
with "Profit Loop"), and produces a WooCommerce-ready product CSV plus a raw
JSON dump.

No authentication is required: the catalogue exposes a public, same-origin
paginated products API.

Usage:
    python exporter.py                       # scrape everything -> ./output/
    python exporter.py --markup 10           # 10% price markup (default)
    python exporter.py --price-source discounted   # which field is "current price"
    python exporter.py --catalogue <id>      # limit to one catalogue
    python exporter.py --limit 50            # stop after N products (testing)

Outputs (in --out-dir, default ./output):
    products_raw.json          full normalized product records
    woocommerce_import.csv     ready for WooCommerce > Products > Import
"""

import argparse
import csv
import json
import re
import sys
import time
import urllib.request
import urllib.error
from html import unescape

# --------------------------------------------------------------------------- #
# Configuration
# --------------------------------------------------------------------------- #

BASE_URL = "https://www.justbuyindia.com"
API_PATH = "/api/amalgam/paginated/filtered"

# Internal QuickSell company identifier used by this catalogue (the userId that
# image CDN paths are keyed on). Discovered from the page's amalgam-json blob.
COMPANY_ID = "-Ny9l1TXLO7pdHgCYLxB"
CURRENCY_CODE = "INR"
PAGE_SIZE = 30  # API returns 30 products per page

# Catalogues (id -> human title). Pulled from the site's amalgam-json metadata.
CATALOGUES = {
    "-NyUshFTzvdyqeJhs9KK": "Home & Kitchen",
    "-NyUshjPSOMpmERl2GqD": "Trending Product",
    "-O93hZFQydkS4F0z63Mi": "Mobile & Car Accessories",
    "-O8qiGsLuQFqRtWeDcqh": "Speakers & Headphones",
    "-NyUshdAUD_pK3Pf8mRm": "Kids / Winter & Rainy Season Unique Gadgets",
    "-O1Gtrq5Mf-o6Y6bmVix": "Diwali Lighting & Decoration",
    "-O8HtblI6TfvzAB86Hnp": "Jhalar & Ladia & Curtain Light",
    "-OaA1gWG66JlARpLKUC_": "Luxury Design Table Lamp & Lights",
    "-O8p6oYq0r62dcNbbXgw": "Fancy Decorative Lamp & Lights",
    "-OWZTsS8E4E2wCnQ9aFs": "Seasonal Trending Product",
    # Two additional catalogue ids advertised by the site without titles:
    "-O8qgsVjDyXgqpMuVCv_": "More Products",
    "-OZ8ondr2DG_wIliZRB-": "More Products",
}

# Company-level minimum order quantity (from companyExperiments.minOrderQuantity).
DEFAULT_MOQ = 3

# Branding replacement rules. Order matters (longest / most specific first).
# Case-insensitive, whitespace-tolerant.
BRAND_PATTERNS = [
    (re.compile(r"just\s*buy\s*india", re.IGNORECASE), "Profit Loop"),
    (re.compile(r"justbuy\s*india", re.IGNORECASE), "Profit Loop"),
    (re.compile(r"just\s*buy", re.IGNORECASE), "Profit Loop"),
    (re.compile(r"justbuyindia", re.IGNORECASE), "Profit Loop"),
    (re.compile(r"justbuydelhi", re.IGNORECASE), "Profit Loop"),
]

NEW_BRAND = "Profit Loop"


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #

def rebrand(text):
    """Strip every trace of the source brand and replace with Profit Loop."""
    if not text:
        return text
    cleaned = unescape(str(text))
    for pattern, replacement in BRAND_PATTERNS:
        cleaned = pattern.sub(replacement, cleaned)
    # Collapse any accidental double spaces introduced by replacement.
    cleaned = re.sub(r"[ \t]{2,}", " ", cleaned).strip()
    return cleaned


def http_post_json(url, payload, retries=3, backoff=2.0):
    """POST JSON and return parsed JSON, with simple retry/backoff."""
    data = json.dumps(payload).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Origin": BASE_URL,
        "Referer": BASE_URL + "/",
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
        ),
    }
    last_err = None
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, data=data, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=30) as resp:
                body = resp.read().decode("utf-8")
                if not body.strip():
                    return {}
                return json.loads(body)
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as exc:
            last_err = exc
            if attempt < retries:
                time.sleep(backoff * attempt)
    raise RuntimeError(f"Request to {url} failed after {retries} attempts: {last_err}")


def fetch_catalogue_products(catalogue_id):
    """Yield raw product dicts for one catalogue, paging until exhausted."""
    page = 1
    seen = 0
    total = None
    while True:
        payload = {
            "companyId": COMPANY_ID,
            "catalogueId": catalogue_id,
            "currencyCode": CURRENCY_CODE,
            "page": page,
            "returnAggregatedTags": False,
            "catalogueShowOutOfStock": True,
        }
        result = http_post_json(BASE_URL + API_PATH, payload)
        products = result.get("products") or {}
        ids = result.get("productIds") or []
        if total is None:
            total = result.get("totalProducts", 0)
        if not ids:
            break
        for pid in ids:
            prod = products.get(pid)
            if prod:
                yield prod
                seen += 1
        page += 1
        if total and seen >= total:
            break
        # Safety stop: if a page returns fewer than PAGE_SIZE we are at the end.
        if len(ids) < PAGE_SIZE:
            break
        time.sleep(0.15)  # be polite to the API


def extract_images(prod):
    """Return image URLs ordered by 'position'."""
    pics = prod.get("pictures") or {}
    ordered = sorted(
        pics.values(),
        key=lambda p: p.get("position") if isinstance(p.get("position"), int) else 999,
    )
    urls = [p.get("url") for p in ordered if p.get("url")]
    if not urls and prod.get("pictureUrl"):
        urls = [prod["pictureUrl"]]
    # De-duplicate while preserving order.
    out, seen = [], set()
    for u in urls:
        if u not in seen:
            seen.add(u)
            out.append(u)
    return out


def choose_current_price(prod, price_source):
    """Resolve the 'current price' the markup is applied to.

    price_source:
      auto       -> discounted_price when present and > 0, else price
      discounted -> always discounted_price (fallback to price)
      mrp        -> always price (the listed/MRP value)
    """
    price = prod.get("price")
    disc = prod.get("discounted_price")
    price = float(price) if isinstance(price, (int, float)) else None
    disc = float(disc) if isinstance(disc, (int, float)) else None

    if price_source == "mrp":
        return price
    if price_source == "discounted":
        return disc if disc and disc > 0 else price
    # auto
    if disc and disc > 0:
        return disc
    return price


def normalize(prod, catalogue_title, markup_pct, price_source):
    """Turn a raw QuickSell product into a clean, rebranded record."""
    current_price = choose_current_price(prod, price_source)
    new_price = None
    if current_price is not None:
        new_price = round(current_price * (1 + markup_pct / 100.0), 2)

    images = extract_images(prod)
    name = rebrand(prod.get("name") or "").strip()
    description = rebrand(prod.get("description") or "").strip()

    return {
        "id": prod.get("id"),
        "sku": "PL-" + str(prod.get("id") or "").lstrip("-"),
        "name": name,
        "description": description,
        "category": rebrand(catalogue_title),
        "currency": prod.get("currency") or CURRENCY_CODE,
        "source_mrp": prod.get("price"),
        "source_discounted_price": prod.get("discounted_price"),
        "current_price": current_price,
        "new_price": new_price,
        "markup_pct": markup_pct,
        "min_order_quantity": DEFAULT_MOQ,
        "in_stock": not bool(prod.get("sold_out")),
        "images": images,
        "primary_image": images[0] if images else "",
    }


# --------------------------------------------------------------------------- #
# WooCommerce CSV writer
# --------------------------------------------------------------------------- #

WC_HEADERS = [
    "Type",
    "SKU",
    "Name",
    "Published",
    "Is featured?",
    "Visibility in catalog",
    "Short description",
    "Description",
    "In stock?",
    "Regular price",
    "Categories",
    "Images",
    "Meta: minimum_allowed_quantity",
    "Meta: _wholesale_min_order_qty",
    "Meta: source_mrp",
    "Meta: source_current_price",
]


def write_woocommerce_csv(records, path):
    with open(path, "w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        writer.writerow(WC_HEADERS)
        for r in records:
            short_desc = r["description"][:160] if r["description"] else r["name"]
            writer.writerow([
                "simple",
                r["sku"],
                r["name"],
                1,
                0,
                "visible",
                short_desc,
                r["description"],
                1 if r["in_stock"] else 0,
                r["new_price"] if r["new_price"] is not None else "",
                r["category"],
                ", ".join(r["images"]),
                r["min_order_quantity"],
                r["min_order_quantity"],
                r["source_mrp"] if r["source_mrp"] is not None else "",
                r["current_price"] if r["current_price"] is not None else "",
            ])


# --------------------------------------------------------------------------- #
# Main
# --------------------------------------------------------------------------- #

def main(argv=None):
    parser = argparse.ArgumentParser(description="Export Profit Loop products to WooCommerce.")
    parser.add_argument("--markup", type=float, default=10.0,
                        help="Percentage to add to the current price (default: 10).")
    parser.add_argument("--price-source", choices=["auto", "discounted", "mrp"],
                        default="auto",
                        help="Which source field is the 'current price' (default: auto).")
    parser.add_argument("--catalogue", action="append", default=None,
                        help="Limit to one or more catalogue ids (repeatable).")
    parser.add_argument("--limit", type=int, default=0,
                        help="Stop after N products total (0 = no limit).")
    parser.add_argument("--out-dir", default="output", help="Output directory.")
    args = parser.parse_args(argv)

    import os
    os.makedirs(args.out_dir, exist_ok=True)

    catalogue_ids = args.catalogue if args.catalogue else list(CATALOGUES.keys())

    all_records = []
    seen_ids = set()
    for cid in catalogue_ids:
        title = CATALOGUES.get(cid, "Products")
        print(f"[*] Catalogue {cid} ({title}) ...", flush=True)
        count = 0
        try:
            for prod in fetch_catalogue_products(cid):
                pid = prod.get("id")
                if pid in seen_ids:
                    continue  # product already captured from another catalogue
                seen_ids.add(pid)
                all_records.append(normalize(prod, title, args.markup, args.price_source))
                count += 1
                if args.limit and len(all_records) >= args.limit:
                    break
        except Exception as exc:  # keep partial results on failure
            print(f"    ! error on {cid}: {exc}", file=sys.stderr)
        print(f"    -> {count} products", flush=True)
        if args.limit and len(all_records) >= args.limit:
            break

    raw_path = os.path.join(args.out_dir, "products_raw.json")
    csv_path = os.path.join(args.out_dir, "woocommerce_import.csv")

    with open(raw_path, "w", encoding="utf-8") as fh:
        json.dump(all_records, fh, indent=2, ensure_ascii=False)
    write_woocommerce_csv(all_records, csv_path)

    priced = [r for r in all_records if r["new_price"] is not None]
    print("\n=== Summary ===")
    print(f"Total products exported : {len(all_records)}")
    print(f"Products with a price   : {len(priced)}")
    print(f"Price markup applied    : {args.markup}% (source: {args.price_source})")
    print(f"Raw JSON                : {raw_path}")
    print(f"WooCommerce CSV         : {csv_path}")


if __name__ == "__main__":
    main()
