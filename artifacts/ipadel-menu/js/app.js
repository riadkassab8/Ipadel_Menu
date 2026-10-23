import { categories, products } from "./data.js";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const STORAGE_KEY = "ipadel-memory-basket-v1";
const imagePath = "/assets/court-drinks.jpg";
const fallbackStyle = "background-image:radial-gradient(ellipse at 72% 42%,rgba(25,245,160,.24),transparent 22%),linear-gradient(135deg,#15334a,#061629)";
let activeCategory = "all";
let query = "";
let activeProduct = null;
let detailQuantity = 1;
let basket = readBasket();
let toastTimer;
let lastFocus = null;
let overlayHideTimer;

const filters = $("[data-filters]");
const grid = $("[data-products]");
const emptyResults = $("[data-empty]");
const overlay = $("[data-overlay]");
const detailPanel = $("[data-detail]");
const basketPanel = $("[data-basket]");
const confirmDialog = $("[data-confirm]");
const toast = $("[data-toast]");

function readBasket() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter(item => products.some(product => product.id === item.id))
      .map(item => {
        const product = products.find(p => p.id === item.id);
        const validVariant = product.variants?.some(variant => variant.name === item.variant);
        return { id: item.id, variant: validVariant ? item.variant : "", quantity: Math.max(1, Math.min(99, parseInt(item.quantity, 10) || 1)) };
      });
  } catch {
    return [];
  }
}

function persistBasket() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(basket)); }
  catch { showToast("Could not save on this device"); }
  renderBasket();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
function money(value) { return `${Number(value).toFixed(0)} EGP`; }
function priceFor(product, variantName = "") {
  return product.variants?.find(variant => variant.name === variantName)?.price ?? product.price;
}
function getProduct(id) { return products.find(product => product.id === id); }
function watchBackground(element) {
  const probe = new Image();
  probe.onerror = () => { element.style.backgroundImage = fallbackStyle; };
  probe.src = imagePath;
}

function renderFilters() {
  filters.innerHTML = categories.map(category =>
    `<button type="button" class="filter-chip${activeCategory === category.id ? " active" : ""}" data-category="${category.id}" aria-pressed="${activeCategory === category.id}" data-testid="filter-${category.id}">${category.label}</button>`
  ).join("");
}

function renderProducts() {
  const list = products.filter(product =>
    (activeCategory === "all" || product.category === activeCategory) &&
    product.name.toLowerCase().includes(query.toLowerCase().trim())
  );
  grid.hidden = list.length === 0;
  emptyResults.hidden = list.length > 0;
  grid.innerHTML = list.map((product, index) => `
    <article class="product-card" style="animation-delay:${Math.min(index * 45, 225)}ms" data-testid="product-${product.id}">
      <button type="button" class="product-visual" data-action="details" data-id="${product.id}" aria-label="View ${escapeHtml(product.name)} details">
        <span class="product-photo" style="background-position:${product.imagePosition}" aria-hidden="true"></span>
      </button>
      <div class="product-info">
        <span class="product-category">${escapeHtml(categories.find(item => item.id === product.category)?.label || "Drink")}</span>
        <h3 class="product-name" tabindex="0" role="button" data-action="details" data-id="${product.id}">${escapeHtml(product.name)}</h3>
        <p class="product-description">${escapeHtml(product.description)}</p>
        <div class="product-bottom">
          <span class="product-price">${money(product.price)}<span class="price-demo">SAMPLE</span></span>
          <div class="card-actions">
            <button type="button" class="view-link" data-action="details" data-id="${product.id}">VIEW DETAILS</button>
            <button type="button" class="quick-add" data-action="quick-add" data-id="${product.id}" aria-label="Save ${escapeHtml(product.name)} to Memory Basket">+</button>
          </div>
        </div>
      </div>
    </article>`).join("");
  $$(".product-photo", grid).forEach(watchBackground);
}

function updateFilter() {
  renderFilters();
  renderProducts();
}

function openPanel(panel) {
  clearTimeout(overlayHideTimer);
  lastFocus = document.activeElement;
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add("visible"));
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
  document.body.classList.add("locked");
  window.setTimeout(() => $(".panel-close", panel)?.focus(), 40);
}

function closePanels() {
  const wasOpen = detailPanel.classList.contains("open") || basketPanel.classList.contains("open");
  detailPanel.classList.remove("open");
  basketPanel.classList.remove("open");
  detailPanel.setAttribute("aria-hidden", "true");
  basketPanel.setAttribute("aria-hidden", "true");
  confirmDialog.classList.remove("open");
  confirmDialog.setAttribute("aria-hidden", "true");
  overlay.classList.remove("visible");
  document.body.classList.remove("locked");
  clearTimeout(overlayHideTimer);
  overlayHideTimer = window.setTimeout(() => { overlay.hidden = true; }, 290);
  if (wasOpen && lastFocus?.isConnected) lastFocus.focus();
}

function openDetails(id) {
  activeProduct = getProduct(id);
  if (!activeProduct) return;
  detailQuantity = 1;
  $("[data-detail-title]").textContent = activeProduct.name;
  $("[data-detail-category]").textContent = categories.find(item => item.id === activeProduct.category)?.label || "DRINK";
  $("[data-detail-description]").textContent = activeProduct.description;
  const variantWrap = $("[data-variant-wrap]");
  const variantSelect = $("[data-variant]");
  variantWrap.hidden = !activeProduct.variants?.length;
  variantSelect.innerHTML = (activeProduct.variants || []).map((variant, index) =>
    `<option value="${escapeHtml(variant.name)}"${index === 0 ? " selected" : ""}>${escapeHtml(variant.name)} · ${money(variant.price)}</option>`
  ).join("");
  updateDetailPrice();
  $("[data-detail-quantity]").textContent = detailQuantity;
  const image = $("[data-detail-image]");
  image.style.backgroundImage = `url('${imagePath}')`;
  image.style.backgroundPosition = activeProduct.imagePosition;
  const probe = new Image();
  probe.onerror = () => { image.style.backgroundImage = fallbackStyle; };
  probe.src = imagePath;
  closePanels();
  openPanel(detailPanel);
}

function updateDetailPrice() {
  const variant = $("[data-variant]").value;
  $("[data-detail-price]").textContent = `${money(priceFor(activeProduct, variant))} · SAMPLE`;
}

function addToBasket(product, quantity = 1, variant = "") {
  if (!product) return;
  const saved = basket.find(item => item.id === product.id && item.variant === variant);
  if (saved) saved.quantity = Math.min(99, saved.quantity + quantity);
  else basket.push({ id: product.id, variant, quantity: Math.min(99, quantity) });
  persistBasket();
  showToast("Added to Memory Basket");
  const badge = $("[data-basket-units]");
  badge.classList.remove("bump");
  requestAnimationFrame(() => badge.classList.add("bump"));
}

function renderBasket() {
  const units = basket.reduce((sum, item) => sum + item.quantity, 0);
  const unique = basket.length;
  const total = basket.reduce((sum, item) => {
    const product = getProduct(item.id);
    return sum + (product ? priceFor(product, item.variant) * item.quantity : 0);
  }, 0);
  $("[data-basket-units]").textContent = units;
  $("[data-basket-unique]").textContent = `${unique} ${unique === 1 ? "ITEM" : "ITEMS"}`;
  const body = $("[data-basket-body]");
  if (!basket.length) {
    body.innerHTML = `<div class="basket-empty"><span class="empty-ring" aria-hidden="true">+</span><h3>Your basket is waiting.</h3><p>Explore the menu and save what you would like to remember.</p><button type="button" class="text-button" data-action="back-menu">BACK TO MENU <span>↗</span></button></div>`;
    $("[data-basket-foot]").innerHTML = `<p class="basket-privacy">Your list stays on this device. It is <strong>not sent to staff</strong>.</p>`;
    return;
  }
  body.innerHTML = basket.map(item => {
    const product = getProduct(item.id);
    if (!product) return "";
    return `<article class="basket-row" data-testid="basket-item-${product.id}">
      <div class="basket-thumb" role="img" aria-label="${escapeHtml(product.name)}"></div>
      <div class="basket-row-info"><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(item.variant || "Regular")} · ${money(priceFor(product, item.variant))} each</small>
        <div class="basket-row-controls">
          <button type="button" data-action="basket-minus" data-id="${product.id}" data-variant="${escapeHtml(item.variant)}" aria-label="Decrease ${escapeHtml(product.name)} quantity">−</button>
          <output aria-label="Quantity">${item.quantity}</output>
          <button type="button" data-action="basket-plus" data-id="${product.id}" data-variant="${escapeHtml(item.variant)}" aria-label="Increase ${escapeHtml(product.name)} quantity">+</button>
          <button type="button" class="remove-item" data-action="remove" data-id="${product.id}" data-variant="${escapeHtml(item.variant)}" aria-label="Remove ${escapeHtml(product.name)}">remove</button>
        </div>
      </div><strong class="basket-row-total">${money(priceFor(product, item.variant) * item.quantity)}</strong>
    </article>`;
  }).join("");
  $$(".basket-thumb", body).forEach(watchBackground);
  $("[data-basket-foot]").innerHTML = `<div class="basket-total"><span>ESTIMATED TOTAL · SAMPLE PRICES</span><strong>${money(total)}</strong></div>
    <p class="basket-privacy"><strong>Personal reminder only.</strong> It stays on this device and is not sent to staff. Take your list to the counter to order.</p>
    <div class="basket-actions"><button type="button" class="clear-button" data-action="clear">CLEAR BASKET</button><button type="button" class="back-menu" data-action="back-menu">BACK TO MENU</button></div>`;
}

function changeBasket(id, variant, delta) {
  const item = basket.find(entry => entry.id === id && entry.variant === variant);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) basket = basket.filter(entry => entry !== item);
  else item.quantity = Math.min(item.quantity, 99);
  persistBasket();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2100);
}

function showConfirm() {
  confirmDialog.classList.add("open");
  confirmDialog.setAttribute("aria-hidden", "false");
  $("[data-action=cancel-clear]", confirmDialog).focus();
}

document.addEventListener("click", event => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const { action, id, variant = "" } = target.dataset;
  if (action === "details") openDetails(id);
  if (action === "quick-add") addToBasket(getProduct(id));
  if (action === "open-basket") { closePanels(); openPanel(basketPanel); }
  if (action === "close-detail" || action === "close-basket") closePanels();
  if (action === "detail-minus") { detailQuantity = Math.max(1, detailQuantity - 1); $("[data-detail-quantity]").textContent = detailQuantity; }
  if (action === "detail-plus") { detailQuantity = Math.min(99, detailQuantity + 1); $("[data-detail-quantity]").textContent = detailQuantity; }
  if (action === "add-detail") {
    addToBasket(activeProduct, detailQuantity, $("[data-variant]").value);
    closePanels();
  }
  if (action === "basket-minus") changeBasket(id, variant, -1);
  if (action === "basket-plus") changeBasket(id, variant, 1);
  if (action === "remove") { basket = basket.filter(item => !(item.id === id && item.variant === variant)); persistBasket(); showToast("Removed from Memory Basket"); }
  if (action === "clear") showConfirm();
  if (action === "cancel-clear") { confirmDialog.classList.remove("open"); confirmDialog.setAttribute("aria-hidden", "true"); $(".clear-button", basketPanel)?.focus(); }
  if (action === "confirm-clear") { basket = []; persistBasket(); confirmDialog.classList.remove("open"); confirmDialog.setAttribute("aria-hidden", "true"); showToast("Memory Basket cleared"); }
  if (action === "back-menu") closePanels();
  if (action === "reset-filters") { activeCategory = "all"; query = ""; $("[data-search]").value = ""; updateFilter(); }
});

filters.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  updateFilter();
});
$("[data-search]").addEventListener("input", event => { query = event.target.value; renderProducts(); });
$("[data-variant]").addEventListener("change", updateDetailPrice);
overlay.addEventListener("click", closePanels);
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && (!overlay.hidden || confirmDialog.classList.contains("open"))) closePanels();
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    $("[data-search]").focus();
  }
  if (event.key === "Enter" && event.target.matches(".product-name[role=button]")) openDetails(event.target.dataset.id);
  if (event.key === "Tab" && (detailPanel.classList.contains("open") || basketPanel.classList.contains("open"))) {
    const panel = detailPanel.classList.contains("open") ? detailPanel : basketPanel;
    const focusable = $$('button:not([disabled]),select,input,[tabindex="0"]', panel).filter(el => el.offsetParent !== null);
    if (focusable.length && event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable.at(-1).focus(); }
    else if (focusable.length && !event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0].focus(); }
  }
});

const navLinks = $$(".nav-link");
const sections = [$("#drinks"), $("#canteen")];
if ("IntersectionObserver" in window) {
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => link.classList.toggle("is-active", link.dataset.nav === entry.target.id));
    });
  }, { rootMargin: "-30% 0px -55% 0px" });
  sections.forEach(section => navObserver.observe(section));
}

renderFilters();
renderProducts();
renderBasket();
watchBackground($(".hero-photo"));
