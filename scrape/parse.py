"""Parsing helpers for sparefix.co.in product pages."""
import re
import html as ihtml


def clean(s):
    if s is None:
        return ""
    s = ihtml.unescape(s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


# Mobile Ic subcategory display names (leaf category name -> True)
MOBILE_IC_SUBCATS = {
    "IPHONE IC", "WTR RF", "LIGHT&AUDIO IC", "POWER AND SERIES",
    "MEDIATEK (MTK)", "S2MU", "HI", "BQ", "SM", "PM IC",
    "PA-1", "PA-2", "PA-3", "CHARGING & MIXED",
}


def parse_product(html, url):
    d = {"url": url}

    # Title -> "NAME in CATEGORY | Sparefix"
    m = re.search(r"<title>(.*?)</title>", html, re.S)
    title = clean(m.group(1)) if m else ""
    title = re.sub(r"\s*\|\s*Sparefix\s*$", "", title)

    # Name from product-title h4
    m = re.search(r'<h4 class="product-title">(.*?)</h4>', html, re.S)
    name = clean(m.group(1)) if m else ""

    leaf_cat = ""
    if " in " in title:
        # name part may contain ' in ' too; split on last ' in '
        idx = title.rfind(" in ")
        t_name = title[:idx].strip()
        leaf_cat = title[idx + 4:].strip()
        if not name:
            name = clean(t_name)
    d["name"] = name or clean(title)
    d["leaf_category"] = clean(leaf_cat)

    # Short description (p.text-muted right after product-title)
    m = re.search(r'<h4 class="product-title">.*?</h4>\s*<p class="text-muted">(.*?)</p>', html, re.S)
    d["short_description"] = clean(m.group(1)) if m else ""

    # Full description block
    m = re.search(r'<div class="col-12 description overflow-auto description_img">(.*?)</div>', html, re.S)
    if m:
        desc_html = m.group(1).strip()
        d["description_html"] = desc_html
        d["description_text"] = clean(re.sub(r"<[^>]+>", " ", desc_html))
    else:
        d["description_html"] = ""
        d["description_text"] = ""

    # Prices from the variants hidden input
    price = special = ""
    m = re.search(r'data-price="([\d.]+)"\s+data-special_price="([\d.]*)"', html)
    if m:
        price = m.group(1)
        special = m.group(2)
    else:
        m = re.search(r'<meta itemprop="price" content="([\d.]+)"', html)
        if m:
            price = m.group(1)

    def f(x):
        try:
            return float(x)
        except (TypeError, ValueError):
            return None

    p = f(price)
    sp = f(special)
    if p is not None and sp is not None and 0 < sp < p:
        d["regular_price"] = ("%g" % p)
        d["sale_price"] = ("%g" % sp)
    elif p is not None:
        d["regular_price"] = ("%g" % p)
        d["sale_price"] = ""
    else:
        d["regular_price"] = ""
        d["sale_price"] = ""

    # Gallery images: main slides have class="zoom_03"
    imgs = []
    # restrict to the preview gallery wrapper to avoid related products
    gm = re.search(r'gallery-top-1.*?(?=image-Thumbnail-container|gallery-thumbs-1)', html, re.S)
    scope = gm.group(0) if gm else html
    for m in re.finditer(r'<img[^>]+src="(https://sparefix\.co\.in/uploads/[^"]+)"[^>]*class="zoom_03"', scope):
        u = m.group(1)
        if u not in imgs:
            imgs.append(u)
    if not imgs:
        # fallback to data-image
        m = re.search(r'data-image="(https://sparefix\.co\.in/uploads/[^"]+)"', html)
        if m:
            imgs.append(m.group(1))
    # drop logo/favicon if any slipped in
    imgs = [u for u in imgs if "favicon" not in u and "/logo" not in u]
    d["images"] = imgs

    # SKU / product id
    m = re.search(r'data-product-id="(\d+)"', html)
    d["product_id"] = m.group(1) if m else ""

    # Category path for WooCommerce
    leaf = d["leaf_category"]
    if leaf in MOBILE_IC_SUBCATS:
        d["wc_category"] = "Mobile Ic > " + leaf
    elif leaf:
        d["wc_category"] = leaf
    else:
        d["wc_category"] = "Uncategorized"

    return d


if __name__ == "__main__":
    import sys, json
    h = open(sys.argv[1], encoding="utf-8").read()
    print(json.dumps(parse_product(h, sys.argv[1]), indent=2, ensure_ascii=False))
