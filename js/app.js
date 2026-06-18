/* =====================================================================
   Meridien Foods — UI logic
   Rendering, scroll animations, lazy images, placeholders, cart.
   ===================================================================== */
(function () {
  "use strict";

  const INR = (n) => "₹" + Number(n).toLocaleString("en-IN");
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- SVG placeholder generator ----------
     If a product/hero image fails to load we drop in a branded,
     appetising SVG placeholder so the layout never breaks. */
  function placeholder(label) {
    const txt = (label || "Meridien Foods").slice(0, 22);
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>
        <defs>
          <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0' stop-color='#ffe2e0'/>
            <stop offset='1' stop-color='#ffd0a8'/>
          </linearGradient>
        </defs>
        <rect width='400' height='300' fill='url(#g)'/>
        <text x='50%' y='44%' font-size='54' text-anchor='middle' dominant-baseline='middle'>🍖</text>
        <text x='50%' y='68%' font-family='Poppins,Arial' font-size='20' font-weight='600'
              fill='#b5121b' text-anchor='middle'>${txt}</text>
      </svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.trim());
  }

  function imgWithFallback(src, label) {
    const ph = placeholder(label);
    if (!src) return ph;
    return src;
  }

  /* ---------- Scroll reveal animations ---------- */
  function initReveal() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.dataset.delay || 0;
          setTimeout(() => el.classList.add("in"), delay);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12 });
    els.forEach((e) => io.observe(e));
  }

  /* ---------- Lazy load images (hero etc.) ---------- */
  function initLazy(scope = document) {
    $$("img.lazy", scope).forEach((img) => {
      const src = img.dataset.src;
      img.src = imgWithFallback(src, img.alt);
      img.addEventListener("error", function handle() {
        img.removeEventListener("error", handle);
        img.src = placeholder(img.alt);
      });
      img.classList.remove("lazy");
    });
  }

  /* ---------- Categories ---------- */
  function renderCategories() {
    const grid = $("#catGrid");
    grid.innerHTML = CATEGORIES.map((c, i) => `
      <button class="cat-card reveal" data-delay="${i * 50}" data-cat="${c.slug}">
        <span class="cat-card__ic">${c.icon}</span>
        <span class="cat-card__name">${c.name}</span>
      </button>`).join("");

    $$(".cat-card", grid).forEach((b) =>
      b.addEventListener("click", () => {
        setFilter(b.dataset.cat);
        document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
      })
    );
  }

  /* ---------- Brands ---------- */
  function renderBrands() {
    const strip = $("#brandStrip");
    strip.innerHTML = BRANDS.map((b) =>
      `<div class="brand-strip__item">${b}</div>`).join("");
  }

  /* ---------- WooCommerce-style product listing ---------- */
  let ALL = [];
  let activeFilter = "all";
  let activeSort = "popularity";

  const stars = (r) => {
    const full = Math.round(r);
    return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
  };

  function productCard(p) {
    const onSale = p.price < p.regular;
    const tag = p.tag || (onSale ? "Sale" : "");
    const tagClass = tag === "Best Seller" ? "is-best" : tag === "New" ? "is-new" : "is-sale";
    return `
      <article class="card reveal" data-cat="${p.category}">
        <div class="card__media">
          ${tag ? `<span class="card__badge ${tagClass}">${tag}</span>` : ""}
          <img src="${imgWithFallback(p.image, p.name)}" alt="${p.name}" loading="lazy"
               onerror="this.onerror=null;this.src='${placeholder(p.name)}'" />
          <button class="card__quick" data-id="${p.id}" aria-label="Quick add">＋</button>
        </div>
        <div class="card__body">
          <span class="card__cat">${(CATEGORIES.find(c => c.slug === p.category) || {}).name || p.category}</span>
          <h3 class="card__title">${p.name}</h3>
          <div class="card__rating"><span class="stars">${stars(p.rating)}</span><em>(${p.rating})</em></div>
          <div class="card__price">
            <span class="now">${INR(p.price)}</span>
            ${onSale ? `<span class="was">${INR(p.regular)}</span>` : ""}
            <span class="unit">/ kg</span>
          </div>
          <button class="btn btn--cart" data-id="${p.id}">Add to cart</button>
        </div>
      </article>`;
  }

  function skeletons(n = 8) {
    return Array.from({ length: n }).map(() =>
      `<div class="card card--skeleton"><div class="sk sk--img"></div>
        <div class="card__body"><div class="sk sk--line"></div>
        <div class="sk sk--line short"></div><div class="sk sk--btn"></div></div></div>`).join("");
  }

  function applySort(list) {
    const arr = [...list];
    switch (activeSort) {
      case "price-asc":  arr.sort((a, b) => a.price - b.price); break;
      case "price-desc": arr.sort((a, b) => b.price - a.price); break;
      case "name":       arr.sort((a, b) => a.name.localeCompare(b.name)); break;
      default:           arr.sort((a, b) => b.sold - a.sold);
    }
    return arr;
  }

  function renderProducts() {
    const grid = $("#productGrid");
    let list = activeFilter === "all" ? ALL : ALL.filter((p) => p.category === activeFilter);
    list = applySort(list);

    $("#wooCount").textContent =
      `Showing ${list.length} of ${ALL.length} ${ALL.length === 1 ? "product" : "products"}`;

    grid.innerHTML = list.map(productCard).join("");
    initReveal();
    bindCardButtons(grid);
  }

  function renderFilters() {
    const wrap = $("#wooFilters");
    const cats = ["all", ...new Set(ALL.map((p) => p.category))];
    wrap.innerHTML = cats.map((c) => {
      const label = c === "all" ? "All" : (CATEGORIES.find(x => x.slug === c) || {}).name || c;
      return `<button class="chip ${c === activeFilter ? "is-active" : ""}" data-cat="${c}">${label}</button>`;
    }).join("");
    $$(".chip", wrap).forEach((b) =>
      b.addEventListener("click", () => setFilter(b.dataset.cat)));
  }

  function setFilter(cat) {
    activeFilter = cat;
    renderFilters();
    renderProducts();
  }

  /* ---------- Cart ---------- */
  let cart = 0;
  function addToCart(id) {
    const p = ALL.find((x) => x.id === Number(id));
    cart += 1;
    $("#cartCount").textContent = cart;
    const fab = $("#cartFab");
    fab.classList.remove("pop"); void fab.offsetWidth; fab.classList.add("pop");
    showToast(`Added “${p ? p.name : "item"}” to cart`);
  }

  function bindCardButtons(scope) {
    $$(".btn--cart, .card__quick", scope).forEach((b) =>
      b.addEventListener("click", () => addToCart(b.dataset.id)));
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function showToast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* ---------- Init ---------- */
  async function init() {
    initReveal();
    initLazy();
    renderCategories();
    renderBrands();
    initReveal();

    const grid = $("#productGrid");
    grid.innerHTML = skeletons();

    ALL = await fetchProducts();
    renderFilters();
    renderProducts();

    $("#wooSort").addEventListener("change", (e) => {
      activeSort = e.target.value;
      renderProducts();
    });

    $("#cartFab").addEventListener("click", () =>
      showToast(cart ? `${cart} item(s) in your cart` : "Your cart is empty"));
  }

  document.addEventListener("DOMContentLoaded", init);
})();
