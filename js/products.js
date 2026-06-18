/* =====================================================================
   Meridien Foods — Product data layer
   ---------------------------------------------------------------------
   The product grid is rendered from a "fetch" so it behaves exactly
   like a WooCommerce shop page. In production, point WOO_ENDPOINT at the
   WooCommerce Store/REST API and the same render code will work:

     GET /wp-json/wc/store/v1/products
     GET /wp-json/wc/v3/products?consumer_key=...&consumer_secret=...

   `fetchProducts()` tries the live endpoint first, then gracefully falls
   back to the bundled sample catalogue below so the page always renders.
   ===================================================================== */

const WOO_ENDPOINT = ""; // e.g. "https://meridienfoods.com/wp-json/wc/store/v1/products"

/* Base image folder on the live Meridien Foods site (used as primary src,
   with a generated placeholder fallback if an image is missing). */
const IMG = "https://meridienfoods.com/assets/images/";

/* Category master list (mirrors the live site menu) */
const CATEGORIES = [
  { slug: "chicken",  name: "Chicken",        icon: "🍗" },
  { slug: "seafood",  name: "Fish & Seafood", icon: "🐟" },
  { slug: "mutton",   name: "Mutton",         icon: "🥩" },
  { slug: "buffalo",  name: "Buffalo",        icon: "🐃" },
  { slug: "pork",     name: "Pork",           icon: "🥓" },
  { slug: "duck",     name: "Duck",           icon: "🦆" },
  { slug: "quail",    name: "Quail",          icon: "🐦" },
  { slug: "rabbit",   name: "Rabbit",         icon: "🐇" },
  { slug: "turkey",   name: "Turkey",         icon: "🦃" }
];

const BRANDS = ["Tasty Nibbles", "Meridien Select", "Ocean Catch", "Farm Fresh", "Prime Cuts"];

/* Sample catalogue — shaped like WooCommerce Store API objects
   ({ id, name, prices, categories, images, ... }) so swapping in the
   real endpoint needs zero render changes. */
const SAMPLE_PRODUCTS = [
  { id: 1,  name: "Smoked Bacon",          category: "pork",    price: 320, regular: 380, rating: 4.8, sold: 420, image: IMG + "bacon_1.png",              tag: "Best Seller" },
  { id: 2,  name: "Chicken Burger Patty",  category: "chicken", price: 240, regular: 240, rating: 4.6, sold: 510, image: IMG + "burger_patty.png",         tag: "" },
  { id: 3,  name: "Chicken Legs",          category: "chicken", price: 180, regular: 220, rating: 4.7, sold: 980, image: IMG + "chicken-legs.jpg",         tag: "Best Seller" },
  { id: 4,  name: "Fresh Mackerel Steak",  category: "seafood", price: 260, regular: 260, rating: 4.5, sold: 300, image: IMG + "fresh-mackerel-steak.jpg", tag: "" },
  { id: 5,  name: "Chicken Sausages",      category: "chicken", price: 210, regular: 250, rating: 4.6, sold: 640, image: IMG + "Sausages.png",             tag: "Sale" },
  { id: 6,  name: "Pepperoni",             category: "pork",    price: 350, regular: 350, rating: 4.9, sold: 270, image: IMG + "Pepperoni.png",            tag: "" },
  { id: 7,  name: "Tiger Prawns",          category: "seafood", price: 480, regular: 560, rating: 4.8, sold: 410, image: IMG + "calories.jpg",             tag: "Sale" },
  { id: 8,  name: "Mutton Curry Cut",      category: "mutton",  price: 720, regular: 720, rating: 4.7, sold: 360, image: "",                               tag: "" },
  { id: 9,  name: "Boneless Chicken Breast", category: "chicken", price: 290, regular: 320, rating: 4.6, sold: 870, image: "",                            tag: "" },
  { id: 10, name: "Buffalo Boneless",      category: "buffalo", price: 410, regular: 410, rating: 4.4, sold: 190, image: "",                               tag: "" },
  { id: 11, name: "Whole Duck",            category: "duck",    price: 540, regular: 600, rating: 4.5, sold: 120, image: "",                               tag: "Sale" },
  { id: 12, name: "Quail (Pack of 4)",     category: "quail",   price: 380, regular: 380, rating: 4.6, sold: 95,  image: "",                               tag: "New" },
  { id: 13, name: "Rabbit Whole",          category: "rabbit",  price: 620, regular: 620, rating: 4.3, sold: 60,  image: "",                               tag: "" },
  { id: 14, name: "Turkey Breast",         category: "turkey",  price: 690, regular: 760, rating: 4.7, sold: 150, image: "",                               tag: "Sale" },
  { id: 15, name: "Pomfret Whole",         category: "seafood", price: 520, regular: 520, rating: 4.6, sold: 240, image: "",                               tag: "" },
  { id: 16, name: "Mutton Boneless",       category: "mutton",  price: 880, regular: 950, rating: 4.8, sold: 320, image: "",                               tag: "Best Seller" }
];

/* Normalises a WooCommerce Store API product into our card shape. */
function normaliseWoo(p) {
  const price = Number(p.prices?.sale_price || p.prices?.price || 0) / 100;
  const regular = Number(p.prices?.regular_price || p.prices?.price || 0) / 100;
  return {
    id: p.id,
    name: p.name,
    category: (p.categories?.[0]?.slug) || "other",
    price: price || regular,
    regular: regular || price,
    rating: Number(p.average_rating) || 4.5,
    sold: p.total_sales || 0,
    image: p.images?.[0]?.src || "",
    tag: p.on_sale ? "Sale" : ""
  };
}

/* Returns a Promise of products — live first, sample fallback. */
async function fetchProducts() {
  if (WOO_ENDPOINT) {
    try {
      const res = await fetch(WOO_ENDPOINT, { headers: { Accept: "application/json" } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length) return data.map(normaliseWoo);
      }
    } catch (err) {
      console.warn("Woo fetch failed, using sample catalogue:", err);
    }
  }
  // Simulate async fetch latency for a smooth skeleton-loading experience
  return new Promise((resolve) => setTimeout(() => resolve(SAMPLE_PRODUCTS), 450));
}
