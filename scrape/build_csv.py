"""Build a WooCommerce product-importer CSV from products.json."""
import csv
import json

IN = "products.json"
OUT = "sparefix_woocommerce_products.csv"

# Standard WooCommerce product CSV importer columns
COLUMNS = [
    "ID",
    "Type",
    "SKU",
    "Name",
    "Published",
    "Is featured?",
    "Visibility in catalog",
    "Short description",
    "Description",
    "Tax status",
    "Tax class",
    "In stock?",
    "Stock",
    "Backorders allowed?",
    "Sold individually?",
    "Weight (kg)",
    "Length (cm)",
    "Width (cm)",
    "Height (cm)",
    "Allow customer reviews?",
    "Purchase note",
    "Sale price",
    "Regular price",
    "Categories",
    "Tags",
    "Shipping class",
    "Images",
    "Position",
]


def main():
    data = json.load(open(IN, encoding="utf-8"))

    with open(OUT, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=COLUMNS)
        w.writeheader()
        for d in data:
            desc = d.get("description_html") or d.get("description_text") or ""
            short = d.get("short_description") or d.get("description_text") or ""
            row = {
                "ID": "",
                "Type": "simple",
                "SKU": "SF-" + d.get("product_id", ""),
                "Name": d.get("name", ""),
                "Published": 1,
                "Is featured?": 0,
                "Visibility in catalog": "visible",
                "Short description": short,
                "Description": desc,
                "Tax status": "taxable",
                "Tax class": "",
                "In stock?": 1,
                "Stock": "",
                "Backorders allowed?": 0,
                "Sold individually?": 0,
                "Weight (kg)": "",
                "Length (cm)": "",
                "Width (cm)": "",
                "Height (cm)": "",
                "Allow customer reviews?": 1,
                "Purchase note": "",
                "Sale price": d.get("sale_price", ""),
                "Regular price": d.get("regular_price", ""),
                "Categories": d.get("wc_category", ""),
                "Tags": "",
                "Shipping class": "",
                "Images": ", ".join(d.get("images", [])),
                "Position": 0,
            }
            w.writerow(row)

    print("Wrote", OUT, "with", len(data), "products")


if __name__ == "__main__":
    main()
