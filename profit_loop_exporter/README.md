# Profit Loop — JustBuyIndia → WooCommerce Exporter

A self-contained Python tool that scrapes every product from the catalogue that
powers `justbuyindia.com`, applies a price markup, removes all original
branding (replacing it with **Profit Loop**), and produces a **WooCommerce-ready
CSV** plus a raw JSON dump.

## What it does

| Requirement | How it's handled |
|---|---|
| Product name, price, description | Pulled from the catalogue's public products API |
| Minimum order quantity (MOQ) | Set from the store's catalogue-level MOQ (**3**) |
| Image URLs | All product images, ordered, comma-separated for WooCommerce |
| Price +10% | `Regular price = current price × 1.10` (configurable) |
| Remove original branding | Every variant of the old brand is replaced with **Profit Loop** |

## How the data is sourced

`justbuyindia.com` is a single-page **QuickSell** catalogue. It exposes a public,
same-origin paginated products API (no login/token required):

```
POST https://www.justbuyindia.com/api/amalgam/paginated/filtered
Content-Type: application/json

{
  "companyId": "-Ny9l1TXLO7pdHgCYLxB",
  "catalogueId": "<catalogue id>",
  "currencyCode": "INR",
  "page": 1,
  "catalogueShowOutOfStock": true
}
```

The response returns 30 products per page including name, `price` (MRP),
`discounted_price` (current selling price), images, and catalogue info. The tool
walks all 12 catalogues and pages through every product.

### Price interpretation

Each product has two prices:
- `price` — the listed **MRP** (kept in the CSV as `Meta: source_mrp`)
- `discounted_price` — the **current selling price**

By default the markup is applied to the **current selling price**:

```
Regular price = discounted_price × 1.10
```

Switch this with `--price-source` if you'd rather mark up the MRP.

## Usage

Requires only Python 3 (standard library — no `pip install` needed).

```bash
# Scrape everything, +10% markup, write to ./output/
python exporter.py

# Custom markup
python exporter.py --markup 15

# Mark up the MRP instead of the selling price
python exporter.py --price-source mrp

# Quick test: only the first 20 products
python exporter.py --limit 20

# A single catalogue (note the '=' because ids start with '-')
python exporter.py --catalogue=-NyUshFTzvdyqeJhs9KK
```

### Options

| Flag | Default | Description |
|---|---|---|
| `--markup` | `10` | Percentage added to the current price |
| `--price-source` | `auto` | `auto` (discounted, else MRP), `discounted`, or `mrp` |
| `--catalogue` | all | Restrict to one or more catalogue ids (repeatable) |
| `--limit` | `0` | Stop after N products (0 = no limit) |
| `--out-dir` | `output` | Output directory |

## Output

`output/woocommerce_import.csv` — import via **WooCommerce → Products → Import**.

Columns: `Type, SKU, Name, Published, Is featured?, Visibility in catalog,
Short description, Description, In stock?, Regular price, Categories, Images,
Meta: minimum_allowed_quantity, Meta: _wholesale_min_order_qty,
Meta: source_mrp, Meta: source_current_price`.

`output/products_raw.json` — full normalized records (both prices, all images,
category, MOQ, stock) for any custom processing.

### Importing into WooCommerce

1. WordPress admin → **Products → Import**.
2. Upload `woocommerce_import.csv`.
3. WooCommerce auto-maps the standard columns; the `Images` column accepts the
   external CDN URLs and sideloads them into the media library on import.
4. **MOQ:** WooCommerce core has no native minimum-order-quantity field. The CSV
   ships the value in two meta columns (`minimum_allowed_quantity` and
   `_wholesale_min_order_qty`) so it works with common plugins such as
   *Min/Max Quantities* or *Wholesale* extensions. Map the meta key your plugin
   expects during import.

## Latest run

- **1,451** products exported across 12 catalogues
- **1,428** priced (23 had no price set at the source → imported as price-on-request)
- **1,528** image URLs captured
- **0** original-branding strings remaining in the output
