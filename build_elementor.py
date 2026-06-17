#!/usr/bin/env python3
"""Generate a native-widget Elementor template for the Meridien Foods homepage.

The featured-products section uses the WooCommerce "Products" widget so its
images/prices come straight from the WooCommerce catalog instead of hardcoded URLs.
"""
import json
import random

# ── palette ─────────────────────────────────────────────
RED      = "#C0271A"
RED_DK   = "#8B1A10"
RED_LT   = "#F5E8E6"
CREAM    = "#FBF7F2"
CHARCOAL = "#1C1C1C"
GRAY     = "#6B6B6B"
WHITE    = "#FFFFFF"
DARK     = "#111111"
SERIF    = "Playfair Display"
SANS     = "Inter"

_used = set()
def eid():
    while True:
        x = ''.join(random.choices('0123456789abcdef', k=8))
        if x not in _used:
            _used.add(x)
            return x

def px(n):
    return {"unit": "px", "size": n, "sizes": []}

def box(t, r, b, l, unit="px"):
    return {"unit": unit, "top": str(t), "right": str(r),
            "bottom": str(b), "left": str(l), "isLinked": False}

def typo(prefix, family=None, size=None, weight=None, lh=None, lh_unit="em",
         ls=None, transform=None):
    s = {f"{prefix}_typography": "custom"}
    if family:    s[f"{prefix}_font_family"] = family
    if size:      s[f"{prefix}_font_size"] = px(size)
    if weight:    s[f"{prefix}_font_weight"] = str(weight)
    if lh:        s[f"{prefix}_line_height"] = {"unit": lh_unit, "size": lh, "sizes": []}
    if ls:        s[f"{prefix}_letter_spacing"] = px(ls)
    if transform: s[f"{prefix}_text_transform"] = transform
    return s

# ── element factories ──────────────────────────────────
def widget(wtype, settings):
    return {"id": eid(), "elType": "widget", "settings": settings,
            "elements": [], "widgetType": wtype}

def column(children, size=100, settings=None):
    s = {"_column_size": size, "_inline_size": size}
    if settings:
        s.update(settings)
    return {"id": eid(), "elType": "column", "settings": s,
            "elements": children, "isInner": False}

def section(columns, settings=None, inner=False):
    s = {"gap": "default"}
    if settings:
        s.update(settings)
    return {"id": eid(), "elType": "section", "settings": s,
            "elements": columns, "isInner": inner}

def bg(color):
    return {"background_background": "classic", "background_color": color}

def heading(title, size_tag="h2", color=CHARCOAL, family=SERIF, fsize=42,
            weight="700", lh=1.15, ls=None, transform=None, align=None,
            margin=None):
    s = {"title": title, "header_size": size_tag, "title_color": color}
    s.update(typo("typography", family=family, size=fsize, weight=weight,
                  lh=lh, ls=ls, transform=transform))
    if align:  s["align"] = align
    if margin: s["_margin"] = margin
    return widget("heading", s)

def text(html, color=GRAY, fsize=15, lh=1.7, align=None, weight=None,
         family=SANS, margin=None):
    s = {"editor": f"<p>{html}</p>", "text_color": color}
    s.update(typo("typography", family=family, size=fsize, weight=weight, lh=lh))
    if align:  s["align"] = align
    if margin: s["_margin"] = margin
    return widget("text-editor", s)

def button(label, url="#", bgc=RED, txt=WHITE, hover_bg=RED_DK, size="md",
           align=None, border=None, border_color=None, margin=None):
    s = {
        "text": label,
        "link": {"url": url, "is_external": "", "nofollow": ""},
        "background_color": bgc,
        "button_text_color": txt,
        "hover_color": txt,
        "button_background_hover_color": hover_bg,
        "border_radius": box(6, 6, 6, 6),
        "text_padding": box(13, 30, 13, 30),
    }
    s.update(typo("typography", family=SANS, size=14, weight="600"))
    if align:        s["align"] = align
    if border:
        s["border_border"] = "solid"
        s["border_width"] = box(border, border, border, border)
        s["border_color"] = border_color or txt
    if margin:       s["_margin"] = margin
    return widget("button", s)

def icon_box(emoji, title, desc, title_color=WHITE, desc_color="rgba(255,255,255,0.5)",
             box_bg="rgba(255,255,255,0.05)", border="rgba(255,255,255,0.1)"):
    """Approximate the design cards with an html widget (icon + title + desc)."""
    html = (
        f'<div style="background:{box_bg};border:1px solid {border};'
        f'border-radius:10px;padding:20px;height:100%;">'
        f'<div style="font-size:26px;margin-bottom:10px;">{emoji}</div>'
        f'<div style="font-size:14px;font-weight:600;color:{title_color};'
        f'margin-bottom:5px;font-family:Inter,sans-serif;">{title}</div>'
        f'<div style="font-size:12px;color:{desc_color};line-height:1.6;'
        f'font-family:Inter,sans-serif;">{desc}</div></div>'
    )
    return widget("html", {"html": html})

def image_widget(url, link="#"):
    return widget("image", {
        "image": {"url": url, "id": "", "source": "library"},
        "link_to": "custom",
        "link": {"url": link, "is_external": "", "nofollow": ""},
    })

content = []

# ── 1. HEADER / NAV ─────────────────────────────────────
logo = heading("Meridien Foods", "div", WHITE, SERIF, 22, "700", 1.2,
               margin=box(0, 0, 0, 0))
nav_html = widget("html", {"html":
    '<div style="display:flex;gap:32px;flex-wrap:wrap;align-items:center;'
    'font-family:Inter,sans-serif;">' +
    ''.join(f'<a href="#" style="color:rgba(255,255,255,0.8);text-decoration:none;'
            f'font-size:14px;font-weight:500;">{t}</a>'
            for t in ["Home", "Shop", "Categories", "About Us", "FAQs", "Contact"]) +
    '</div>'})
phone_cta = widget("html", {"html":
    '<div style="display:flex;gap:16px;align-items:center;justify-content:flex-end;'
    'flex-wrap:wrap;font-family:Inter,sans-serif;">'
    '<a href="tel:+918714136486" style="color:rgba(255,255,255,0.7);font-size:13px;'
    'text-decoration:none;">&#128222; +91 87141 36486</a>'
    '<a href="https://wa.me/918714136486?text=Hi%2C%20I%20want%20to%20order%20from%20Meridien%20Foods" '
    'style="background:#C0271A;color:#fff;font-size:13px;font-weight:600;'
    'padding:9px 20px;border-radius:6px;text-decoration:none;">Order Now</a></div>'})

content.append(section(
    [column([logo], 25, {"content_position": "center"}),
     column([nav_html], 45, {"content_position": "center"}),
     column([phone_cta], 30, {"content_position": "center"})],
    settings={**bg(CHARCOAL), "padding": box(12, 48, 12, 48),
              "gap": "no"}))

# ── 2. HERO ─────────────────────────────────────────────
hero_children = [
    heading("Fresh \u00b7 Hygienic \u00b7 Premium", "div", RED, SANS, 12, "600",
            1.4, ls=2, transform="uppercase", margin=box(0, 0, 18, 0)),
    heading("Premium Meat, Delivered <em style='color:#C0271A;font-style:normal'>Fresh</em> to Your Door",
            "h1", WHITE, SERIF, 60, "900", 1.05, margin=box(0, 0, 20, 0)),
    text("Trusted by hotels, restaurants, caterers &amp; retail stores across South India. "
         "Premium processed meats &mdash; FSSAI certified, halal assured, cold-chain delivered to your door.",
         color="rgba(255,255,255,0.65)", fsize=16, lh=1.7, margin=box(0, 0, 30, 0)),
    section([
        column([button("Shop Now", "#")], 50),
        column([button("WhatsApp Order",
                        "https://wa.me/918714136486?text=Hi%2C%20I%20want%20to%20place%20an%20order",
                        bgc="rgba(0,0,0,0)", txt="rgba(255,255,255,0.85)",
                        hover_bg="rgba(255,255,255,0.1)", border=1.5,
                        border_color="rgba(255,255,255,0.3)")], 50),
    ], settings={"gap": "narrow", "content_width": "full"}, inner=True),
    widget("html", {"html":
        '<div style="display:flex;gap:28px;margin-top:36px;flex-wrap:wrap;'
        'font-family:Inter,sans-serif;">' +
        ''.join('<div style="display:flex;align-items:center;gap:8px;'
                'color:rgba(255,255,255,0.6);font-size:13px;">'
                f'<span style="width:32px;height:32px;border-radius:50%;'
                'background:rgba(192,39,26,0.2);display:inline-flex;align-items:center;'
                f'justify-content:center;font-size:15px;">{i}</span>{t}</div>'
                for i, t in [("&#129482;", "Cold Chain Delivery"),
                             ("&#9989;", "FSSAI Certified"),
                             ("&#9889;", "Same-Day Dispatch")]) +
        '</div>'}),
]
content.append(section(
    [column(hero_children, 100)],
    settings={
        **bg(CHARCOAL),
        "background_image": {"url": "https://placehold.co/1600x900/1C1C1C/C0271A?text=Hero+Image", "id": ""},
        "background_position": "center center", "background_size": "cover",
        "background_overlay_background": "classic",
        "background_overlay_color": "rgba(28,28,28,0.85)",
        "min_height": px(580), "padding": box(80, 48, 80, 48),
    }))

# ── 3. DELIVERY STRIP ───────────────────────────────────
strip_items = ["&#128666; Free delivery above &#8377;500",
               "&#128230; Vacuum-sealed packaging",
               "&#129482; Cold chain maintained",
               "&#9989; 100% halal certified",
               "&#127961; Chennai \u00b7 Coimbatore \u00b7 Kochi"]
strip_html = ('<div style="display:flex;gap:24px 40px;align-items:center;'
              'justify-content:center;flex-wrap:wrap;font-family:Inter,sans-serif;">' +
              '<span style="color:rgba(255,255,255,0.3);">|</span>'.join(
                  f'<span style="color:rgba(255,255,255,0.92);font-size:13px;'
                  f'font-weight:500;">{t}</span>' for t in strip_items) +
              '</div>')
content.append(section([column([widget("html", {"html": strip_html})], 100)],
                       settings={**bg(RED), "padding": box(14, 48, 14, 48)}))

# ── 4. CATEGORIES ───────────────────────────────────────
cats = [("chicken.png", "Chicken", "20+ products"),
        ("Mutton.png", "Mutton", "12+ products"),
        ("seafood.png", "Seafood", "15+ products"),
        ("Buffalo.png", "Buffalo", "8+ products"),
        ("Rabbit.png", "Rabbit", "4+ products"),
        ("Quails.png", "Quails", "5+ products"),
        ("Turkey.png", "Turkey", "6+ products"),
        ("Ducky.png", "Duck", "5+ products")]
BASE = "https://site.meridienfoods.com/option1/wp-content/uploads/2026/06/"

def cat_card(img, name, count):
    html = (
        '<a href="#" style="display:block;background:#fff;border:1px solid #E8DDD6;'
        'border-radius:12px;padding:24px 16px;text-align:center;text-decoration:none;'
        'color:#1C1C1C;font-family:Inter,sans-serif;height:100%;">'
        f'<img src="{BASE}{img}" alt="{name}" '
        'style="width:80px;height:80px;object-fit:contain;margin:0 auto 14px;display:block;" '
        f'onerror="this.src=\'https://placehold.co/80x80/FBF7F2/C0271A?text={name}\'">'
        f'<div style="font-size:14px;font-weight:600;margin-bottom:4px;">{name}</div>'
        f'<div style="font-size:12px;color:#6B6B6B;">{count}</div></a>')
    return widget("html", {"html": html})

cat_rows = []
for r in range(2):
    cols = [column([cat_card(*cats[r * 4 + i])], 25) for i in range(4)]
    cat_rows.append(section(cols, settings={"gap": "default", "content_width": "full"}, inner=True))

cats_header = section([
    column([heading("SHOP BY TYPE", "div", RED, SANS, 11, "600", 1.4, ls=2.5,
                    transform="uppercase", margin=box(0, 0, 10, 0)),
            heading("What are you cooking today?", "h2", CHARCOAL, SERIF, 42, "700",
                    1.15)], 70),
    column([button("View all categories", "#", bgc="rgba(0,0,0,0)", txt=RED,
                   hover_bg=RED, border=1.5, border_color=RED, align="right")], 30,
           {"content_position": "bottom"}),
], settings={"gap": "default", "content_width": "full"}, inner=True)

content.append(section(
    [column([cats_header] + cat_rows, 100)],
    settings={**bg(CREAM), "padding": box(80, 48, 80, 48)}))

# ── 5. FEATURED PRODUCTS (WooCommerce) ──────────────────
prod_header = column([
    heading("BESTSELLERS", "div", RED, SANS, 11, "600", 1.4, ls=2.5,
            transform="uppercase", margin=box(0, 0, 10, 0)),
    heading("Popular Products", "h2", CHARCOAL, SERIF, 42, "700", 1.15,
            margin=box(0, 0, 30, 0)),
], 100)

# WooCommerce "Products" widget (Elementor Pro). Images & prices come from WooCommerce.
# Tuned: 4x2 bestsellers, clean homepage layout (no pagination/ordering/count).
# No category/featured restriction -> shows any products (ordered by popularity).
woo_products = widget("woocommerce-products", {
    "_title": "Featured Products",
    # Layout
    "columns": "4",
    "rows": "2",
    "paginate": "",                 # no pagination on homepage
    "allow_order": "",              # hide the "default sorting" dropdown
    "show_result_count": "",        # hide "Showing 1-8 of N results"
    # Ordering -> show bestsellers / most popular first
    "orderby": "popularity",
    "order": "desc",
    # Query / source -> all products, no featured/category filter
    "query_post_type": "product",
    "query_query_id": "mf_featured",
    "query_include": [],
    "query_exclude": [],
    "query_avoid_duplicates": "",
    # Card content toggles (WooCommerce catalog drives image/title/price)
    "show_rating": "yes",
    "show_add_to_cart": "yes",
    "show_sale_flash": "yes",
    # Spacing to match the cream product cards
    "column_gap": {"unit": "px", "size": 20, "sizes": []},
    "row_gap": {"unit": "px", "size": 20, "sizes": []},
})

view_all = column([button("Browse All Products", "#", bgc="rgba(0,0,0,0)", txt=RED,
                          hover_bg=RED, border=1.5, border_color=RED, align="center",
                          margin=box(36, 0, 0, 0))], 100)

content.append(section(
    [column([
        section([prod_header], settings={"content_width": "full"}, inner=True),
        section([column([woo_products], 100)], settings={"content_width": "full"}, inner=True),
        section([view_all], settings={"content_width": "full"}, inner=True),
    ], 100)],
    settings={**bg(WHITE), "padding": box(80, 48, 80, 48)}))

# ── 6. WHY MERIDIEN ─────────────────────────────────────
why_cards = [("&#127777;", "Cold chain delivery", "Maintained below 4\u00b0C from our unit to your door"),
             ("&#9989;", "FSSAI certified", "Processed in a licensed, hygienic facility"),
             ("&#128278;", "Halal assured", "100% halal certified across all meat categories"),
             ("&#128230;", "Vacuum sealed", "Extended freshness, zero contamination packaging")]
why_card_rows = []
for r in range(2):
    cols = [column([icon_box(*why_cards[r * 2 + i])], 50) for i in range(2)]
    why_card_rows.append(section(cols, settings={"content_width": "full"}, inner=True))

why_left = column([
    heading("WHY MERIDIEN FOODS", "div", RED, SANS, 11, "600", 1.4, ls=2.5,
            transform="uppercase", margin=box(0, 0, 14, 0)),
    heading("Quality you can taste, hygiene you can trust", "h2", WHITE, SERIF, 40,
            "700", 1.15, margin=box(0, 0, 20, 0)),
    text("Since 2014, Meridien Foods has been the preferred supplier for hotels, "
         "restaurants, caterers, and retail stores across South India. Every cut is "
         "processed in our FSSAI-certified facility and cold-chain handled from source "
         "to your kitchen.", color="rgba(255,255,255,0.6)", fsize=15, lh=1.75,
         margin=box(0, 0, 30, 0)),
] + why_card_rows, 50)

why_img_html = widget("html", {"html":
    '<div style="border-radius:16px;overflow:hidden;height:480px;position:relative;">'
    '<img src="https://placehold.co/600x480/2A2A2A/C0271A?text=Meat+Processing+Photo" '
    'alt="Meridien Foods processing facility" '
    'style="width:100%;height:100%;object-fit:cover;">'
    '<div style="position:absolute;bottom:20px;left:20px;background:#C0271A;color:#fff;'
    'padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;'
    'font-family:Inter,sans-serif;">&#127981; Coimbatore &amp; Kochi Units</div></div>'})
why_right = column([why_img_html], 50, {"content_position": "center"})

content.append(section([why_left, why_right],
                       settings={**bg(CHARCOAL), "padding": box(80, 48, 80, 48),
                                 "gap": "wide"}))

# ── 7. B2B CUSTOMERS ────────────────────────────────────
b2b = [("&#127976;", "Hotels",
        "Premium cuts for banquets, buffets, and \u00e0 la carte menus. Consistent quality across every batch.",
        ["Bulk packs", "Weekly supply", "Custom cuts"]),
       ("&#127869;", "Restaurants",
        "From QSRs and cloud kitchens to fine dining &mdash; ready-to-cook portions, marinated items, and cold cuts.",
        ["Ready to cook", "Consistent sizing", "Daily delivery"]),
       ("&#127882;", "Caterers",
        "Handle large events without the sourcing stress. Bulk quantities on schedule for weddings and festivals.",
        ["Event volumes", "Pre-order facility", "Halal cert"]),
       ("&#127978;", "Retail Stores",
        "Shelf-ready, vacuum-sealed cold cuts and processed meats under your brand or ours.",
        ["Private label", "Shelf-ready packs", "FSSAI labeled"])]

def b2b_card(emoji, title, desc, tags):
    tag_html = ''.join(
        f'<span style="font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;'
        f'background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.55);'
        f'border:1px solid rgba(255,255,255,0.12);">{t}</span>' for t in tags)
    html = (
        '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);'
        'border-radius:14px;padding:32px 24px 28px;height:100%;font-family:Inter,sans-serif;">'
        '<div style="width:56px;height:56px;border-radius:12px;background:rgba(192,39,26,0.15);'
        'display:flex;align-items:center;justify-content:center;font-size:26px;'
        f'margin-bottom:20px;">{emoji}</div>'
        f'<div style="font-size:18px;font-weight:700;color:#fff;margin-bottom:8px;'
        f'font-family:\'Playfair Display\',serif;">{title}</div>'
        f'<div style="font-size:13px;color:rgba(255,255,255,0.5);line-height:1.65;'
        f'margin-bottom:20px;">{desc}</div>'
        f'<div style="display:flex;flex-wrap:wrap;gap:6px;">{tag_html}</div></div>')
    return widget("html", {"html": html})

b2b_top = section([
    column([heading("WHO WE SUPPLY TO", "div", RED, SANS, 11, "600", 1.4, ls=2.5,
                    transform="uppercase", margin=box(0, 0, 12, 0)),
            heading("Built for businesses that demand the best", "h2", WHITE, SERIF,
                    40, "700", 1.15, margin=box(0, 0, 10, 0)),
            text("From cloud kitchens to five-star banquet halls &mdash; Meridien Foods "
                 "powers South India's food businesses with consistent, bulk-ready, "
                 "cold-chain delivered meat.", color="rgba(255,255,255,0.55)",
                 fsize=15, lh=1.6)], 65),
    column([button("Get a bulk quote",
                   "https://wa.me/918714136486?text=Hi%2C%20I%20am%20a%20business%20owner%20and%20want%20to%20discuss%20bulk%20supply%20from%20Meridien%20Foods",
                   align="right")], 35, {"content_position": "bottom"}),
], settings={"content_width": "full"}, inner=True)

b2b_cards = section([column([b2b_card(*b2b[i])], 25) for i in range(4)],
                    settings={"content_width": "full"}, inner=True)

stats = [("200+", "Business clients served"),
         ("3", "Cities with active B2B delivery"),
         ("10+", "Years supplying the food industry")]
stats_html = ('<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;'
              'background:rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;'
              'margin-top:40px;font-family:Inter,sans-serif;">' +
              ''.join('<div style="background:rgba(255,255,255,0.03);padding:28px 24px;'
                      'text-align:center;">'
                      f'<div style="font-family:\'Playfair Display\',serif;font-size:36px;'
                      f'font-weight:700;color:#C0271A;margin-bottom:5px;">{n}</div>'
                      f'<div style="font-size:13px;color:rgba(255,255,255,0.5);">{l}</div>'
                      '</div>' for n, l in stats) + '</div>')
b2b_stats = section([column([widget("html", {"html": stats_html})], 100)],
                    settings={"content_width": "full"}, inner=True)

b2b_cta = section([
    column([button("WhatsApp for bulk enquiry",
                   "https://wa.me/918714136486?text=Hi%2C%20I%20need%20a%20bulk%20meat%20supply%20quote%20for%20my%20business",
                   bgc="#25D366", hover_bg="#1da851", align="right")], 50),
    column([button("\U0001F4DE Call us directly", "tel:+918714136486",
                   bgc="rgba(0,0,0,0)", txt="rgba(255,255,255,0.75)",
                   hover_bg="rgba(255,255,255,0.1)", border=1,
                   border_color="rgba(255,255,255,0.2)", align="left")], 50),
], settings={"content_width": "full", "_margin": box(40, 0, 0, 0)}, inner=True)

content.append(section(
    [column([b2b_top, b2b_cards, b2b_stats, b2b_cta], 100)],
    settings={**bg(CHARCOAL), "padding": box(80, 48, 80, 48)}))

# ── 8. DELIVERY CITIES ──────────────────────────────────
cities = [("Chennai", "Same-day delivery available"),
          ("Coimbatore", "Head office &amp; processing unit"),
          ("Kochi", "Kerala distribution hub")]

def city_card(name, tag):
    html = (
        '<div style="background:#fff;border:1px solid #E8DDD6;border-radius:12px;'
        'overflow:hidden;text-align:center;font-family:Inter,sans-serif;height:100%;">'
        f'<img src="https://placehold.co/400x160/1C1C1C/C0271A?text={name}" alt="{name}" '
        'style="width:100%;height:160px;object-fit:cover;display:block;">'
        '<div style="padding:20px;">'
        f'<div style="font-family:\'Playfair Display\',serif;font-size:20px;font-weight:700;'
        f'color:#1C1C1C;margin-bottom:5px;">{name}</div>'
        f'<div style="font-size:12px;color:#C0271A;font-weight:600;">{tag}</div></div></div>')
    return widget("html", {"html": html})

cities_inner = section([column([city_card(*c)], 33) for c in cities],
                       settings={"content_width": "full"}, inner=True)
cities_head = section([column([
    heading("WE DELIVER TO", "div", RED, SANS, 11, "600", 1.4, ls=2.5,
            transform="uppercase", margin=box(0, 0, 10, 0)),
    heading("Our delivery cities", "h2", CHARCOAL, SERIF, 42, "700", 1.15,
            margin=box(0, 0, 14, 0)),
    text("Premium meat delivered the same day or next day across South India's major cities.",
         color=GRAY, fsize=15, lh=1.7, margin=box(0, 0, 30, 0)),
], 100)], settings={"content_width": "full"}, inner=True)

content.append(section([column([cities_head, cities_inner], 100)],
                       settings={**bg(CREAM), "padding": box(80, 48, 80, 48)}))

# ── 9. TESTIMONIALS ─────────────────────────────────────
tests = [("\"The chicken lollipops came perfectly packed and tasted amazing. Couldn't "
          "tell the difference from fresh &mdash; that's how good the cold chain is.\"",
          "Arjun Rajan", "Chennai", "AR"),
         ("\"We've been ordering from Meridien for our restaurant. Quality is consistent, "
          "prices are fair, and delivery is always on time. Highly recommend!\"",
          "Priya Krishnan", "Coimbatore", "PK"),
         ("\"The Sheekh Kababs were a hit at our party. Fresh, well-seasoned, and vacuum "
          "sealed &mdash; arrived in perfect condition to Kochi.\"",
          "Sameer Mohammed", "Kochi", "SM")]

def test_card(quote, name, city, initials):
    html = (
        '<div style="background:#fff;border:1px solid #E8DDD6;border-radius:12px;'
        'padding:24px;height:100%;font-family:Inter,sans-serif;">'
        '<div style="color:#E8A020;font-size:15px;margin-bottom:12px;letter-spacing:2px;">'
        '&#9733;&#9733;&#9733;&#9733;&#9733;</div>'
        f'<p style="font-size:14px;color:#1C1C1C;line-height:1.7;margin:0 0 18px;'
        f'font-style:italic;">{quote}</p>'
        '<div style="display:flex;align-items:center;gap:10px;">'
        '<div style="width:38px;height:38px;border-radius:50%;background:#F5E8E6;'
        'display:flex;align-items:center;justify-content:center;font-size:14px;'
        f'font-weight:700;color:#C0271A;">{initials}</div><div>'
        f'<div style="font-size:13px;font-weight:600;color:#1C1C1C;">{name}</div>'
        f'<div style="font-size:12px;color:#6B6B6B;">{city}</div></div></div></div>')
    return widget("html", {"html": html})

test_inner = section([column([test_card(*t)], 33) for t in tests],
                     settings={"content_width": "full"}, inner=True)
test_head = section([column([
    heading("CUSTOMER REVIEWS", "div", RED, SANS, 11, "600", 1.4, ls=2.5,
            transform="uppercase", margin=box(0, 0, 10, 0)),
    heading("What our customers say", "h2", CHARCOAL, SERIF, 42, "700", 1.15,
            margin=box(0, 0, 30, 0)),
], 100)], settings={"content_width": "full"}, inner=True)

content.append(section([column([test_head, test_inner], 100)],
                       settings={**bg(WHITE), "padding": box(80, 48, 80, 48)}))

# ── 10. CTA BANNER ──────────────────────────────────────
cta_left = column([
    heading("Ready to order?", "h2", WHITE, SERIF, 36, "700", 1.15, margin=box(0, 0, 10, 0)),
    text("Shop online or WhatsApp us &mdash; we'll handle the rest.",
         color="rgba(255,255,255,0.85)", fsize=15, lh=1.6),
], 60)
cta_right = section([
    column([button("Shop Online", "#", bgc=WHITE, txt=RED, hover_bg="#f1f1f1")], 50),
    column([button("WhatsApp Order",
                   "https://wa.me/918714136486?text=Hi%2C%20I%20want%20to%20order%20from%20Meridien%20Foods",
                   bgc="#25D366", hover_bg="#1da851")], 50),
], settings={"content_width": "full", "gap": "narrow"}, inner=True)
content.append(section(
    [cta_left, column([cta_right], 40, {"content_position": "center"})],
    settings={**bg(RED), "padding": box(70, 48, 70, 48)}))

# ── 11. FOOTER ──────────────────────────────────────────
footer_brand = column([
    heading("Meridien Foods", "div", WHITE, SERIF, 24, "700", 1.2, margin=box(0, 0, 12, 0)),
    text("Premium processed meats delivered fresh across South India. FSSAI certified, "
         "halal assured, cold chain maintained from our facility to your door since 2014.",
         color="rgba(255,255,255,0.6)", fsize=13, lh=1.75, margin=box(0, 0, 20, 0)),
    widget("html", {"html":
        '<div style="font-family:Inter,sans-serif;">'
        '<a href="tel:+918714136486" style="color:rgba(255,255,255,0.7);text-decoration:none;'
        'font-size:13px;display:block;margin-bottom:6px;">&#128222; +91 87141 36486</a>'
        '<a href="mailto:info@meridienfoods.com" style="color:rgba(255,255,255,0.7);'
        'text-decoration:none;font-size:13px;display:block;">&#9993; info@meridienfoods.com</a></div>'}),
], 40)

def footer_links(title, links):
    items = ''.join(f'<li style="margin-bottom:10px;"><a href="#" '
                    f'style="color:rgba(255,255,255,0.6);text-decoration:none;font-size:13px;">{l}</a></li>'
                    for l in links)
    html = (f'<div style="font-family:Inter,sans-serif;"><div style="font-size:12px;'
            f'font-weight:700;letter-spacing:1.5px;text-transform:uppercase;'
            f'color:rgba(255,255,255,0.4);margin-bottom:18px;">{title}</div>'
            f'<ul style="list-style:none;padding:0;margin:0;">{items}</ul></div>')
    return column([widget("html", {"html": html})], 20)

footer_cat = footer_links("Categories", ["Chicken", "Mutton", "Seafood", "Buffalo",
                                          "Quails &amp; Turkey", "Duck &amp; Rabbit"])
footer_company = footer_links("Company", ["About Us", "FAQs", "Contact",
                                          "Privacy Policy", "Refund Policy"])
footer_offices = column([widget("html", {"html":
    '<div style="font-family:Inter,sans-serif;"><div style="font-size:12px;font-weight:700;'
    'letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.4);'
    'margin-bottom:18px;">Our offices</div>'
    '<p style="font-size:12px;line-height:1.8;margin:0 0 14px;color:rgba(255,255,255,0.6);">'
    '13/2, Ramalakshmanan Nager,<br>Anna Nager, Peelamedu,<br>'
    '<strong style="color:rgba(255,255,255,0.8)">Coimbatore</strong> &ndash; 641004</p>'
    '<p style="font-size:12px;line-height:1.8;margin:0;color:rgba(255,255,255,0.6);">'
    'Bluemoon Silver, Jawahar Nagar,<br>Kadavanthara, Ernakulam,<br>'
    '<strong style="color:rgba(255,255,255,0.8)">Kochi</strong> &ndash; 682020</p></div>'})], 20)

footer_main = section([footer_brand, footer_cat, footer_company, footer_offices],
                      settings={"content_width": "full"}, inner=True)
footer_bottom = section([column([widget("html", {"html":
    '<div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;display:flex;'
    'align-items:center;justify-content:space-between;font-size:12px;gap:16px;flex-wrap:wrap;'
    'font-family:Inter,sans-serif;color:rgba(255,255,255,0.5);">'
    '<span>&copy; 2026 Meridien Foods. All rights reserved.</span>'
    '<span style="color:rgba(255,255,255,0.35);">Developed by '
    '<a href="https://www.incomeinn.in" target="_blank" rel="noopener" '
    'style="color:rgba(255,255,255,0.45);">Income Inn Technologies</a></span></div>'})], 100)],
    settings={"content_width": "full", "_margin": box(30, 0, 0, 0)}, inner=True)

content.append(section([column([footer_main, footer_bottom], 100)],
                       settings={**bg(DARK), "padding": box(60, 48, 40, 48)}))

# ── assemble template ───────────────────────────────────
template = {
    "version": "0.4",
    "title": "Meridien Foods - Homepage (Native)",
    "type": "page",
    "content": content,
    "page_settings": {"template": "elementor_canvas"},
}

out = "/projects/sandbox/kiro/meridien-foods-homepage-elementor-native.json"
with open(out, "w", encoding="utf-8") as f:
    json.dump(template, f, ensure_ascii=False, indent=2)

with open(out) as f:
    json.load(f)

# count widgets
def count(els):
    n = 0
    for e in els:
        if e.get("elType") == "widget":
            n += 1
        n += count(e.get("elements", []))
    return n

print("OK - valid JSON")
print("sections:", len(content), "widgets:", count(content))
print("written:", out)
