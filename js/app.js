const { categories, products } = window.IPADEL_MENU_DATA;

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const STORAGE_KEY = "ipadel-memory-basket-v1";
const imagePath = "./assets/court-drinks.jpg";
const fallbackStyle = "radial-gradient(ellipse at 72% 42%,rgba(25,245,160,.24),transparent 22%),linear-gradient(135deg,#15334a,#061629)";
const filters = $("[data-filters]");
const grid = $("[data-products]");
const search = $("[data-search]");
const detailPanel = $("[data-detail]");
const basketPanel = $("[data-basket]");
const overlay = $("[data-overlay]");
const basketBody = $("[data-basket-body]");
const basketFoot = $("[data-basket-foot]");
const confirmDialog = $("[data-confirm]");
const toast = $("[data-toast]");
const catalogEnabled = Boolean(filters && grid && search && detailPanel);
let activeCategory = "all";
let query = "";
let activeProduct = null;
let detailQuantity = 1;
let basket = readBasket();
let toastTimer;
let overlayState = "closed";
let overlayRevision = 0;
const basketRows = new Map();
let basketEmpty = null;
let basketFootReady = false;
let previousBasketHasItems = null;
let lastFocus = null;

function readBasket() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter(item => products.some(product => product.id === item.id)).map(item => {
      const product = products.find(candidate => candidate.id === item.id);
      const validVariant = product.variants?.some(variant => variant.name === item.variant);
      return { id: item.id, variant: validVariant ? item.variant : "", quantity: Math.max(1, Math.min(99, parseInt(item.quantity, 10) || 1)) };
    });
  } catch { return []; }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
function money(value) { return `${Number(value).toFixed(0)} EGP`; }
function priceFor(product, variantName = "") { return product.variants?.find(variant => variant.name === variantName)?.price ?? product.price; }
function getProduct(id) { return products.find(product => product.id === id); }
function setProductImage(element, position = "center 55%") {
  if (!element) return;
  element.style.backgroundImage = `url("${imagePath}")`;
  element.style.backgroundPosition = position;
  const probe = new Image();
  probe.onerror = () => { element.style.backgroundImage = fallbackStyle; };
  probe.src = imagePath;
}

function renderFilters() {
  if (!filters) return;
  filters.innerHTML = categories.map(category =>
    `<button type="button" class="filter-chip${activeCategory === category.id ? " active" : ""}" data-category="${category.id}" aria-pressed="${activeCategory === category.id}">${category.label}</button>`
  ).join("");
}

function renderProducts() {
  if (!grid) return;
  const list = products.filter(product =>
    (activeCategory === "all" || product.category === activeCategory) &&
    product.name.toLowerCase().includes(query.toLowerCase().trim())
  );
  const emptyResults = $("[data-empty]");
  grid.hidden = list.length === 0;
  if (emptyResults) emptyResults.hidden = list.length > 0;
  grid.innerHTML = list.map((product, index) => `
    <div class="product-card-reveal reveal" style="--card-index:${index}"><article class="product-card" data-testid="product-${product.id}">
      <button type="button" class="product-visual" data-action="details" data-id="${product.id}" aria-label="View ${escapeHtml(product.name)} details">
        <span class="product-photo" style="background-position:${product.imagePosition}" aria-hidden="true"></span>
      </button>
      <div class="product-info"><span class="product-category">${escapeHtml(categories.find(item => item.id === product.category)?.label || "Drink")}</span>
        <h3 class="product-name" tabindex="0" role="button" data-action="details" data-id="${product.id}">${escapeHtml(product.name)}</h3>
        <p class="product-description">${escapeHtml(product.description)}</p>
        <div class="product-bottom"><span class="product-price">${money(product.price)}<span class="price-demo">DEMO</span></span>
          <div class="card-actions"><button type="button" class="view-link" data-action="details" data-id="${product.id}">VIEW DETAILS</button><button type="button" class="quick-add" data-action="quick-add" data-id="${product.id}" aria-label="Save ${escapeHtml(product.name)} to Memory Basket">+</button></div>
        </div>
      </div>
    </article></div>`).join("");
  $$(".product-photo", grid).forEach(photo => setProductImage(photo, photo.style.backgroundPosition || "center"));
  observeReveals(grid);
}
function updateFilter() { renderFilters(); renderProducts(); }

function finishOverlayClose(revision) {
  if (revision !== overlayRevision || overlayState !== "closing") return;
  overlay.classList.remove("rendered");
  overlayState = "closed";
}
function watchOverlayExit(revision) {
  let finished = false;
  let fallbackTimer;
  const cleanup = () => {
    window.clearTimeout(fallbackTimer);
    overlay.removeEventListener("transitionend", onTransition);
    overlay.removeEventListener("transitioncancel", onTransition);
  };
  const finish = () => {
    if (finished) return;
    finished = true;
    cleanup();
    finishOverlayClose(revision);
  };
  const onTransition = event => {
    if (event.target === overlay && event.propertyName === "opacity") finish();
  };
  overlay.addEventListener("transitionend", onTransition);
  overlay.addEventListener("transitioncancel", onTransition);
  fallbackTimer = window.setTimeout(finish, 500);
  const transitions = overlay.getAnimations?.().filter(animation => animation.transitionProperty === "opacity") || [];
  if (transitions.length) Promise.allSettled(transitions.map(animation => animation.finished)).then(finish);
  else requestAnimationFrame(finish);
}
function openPanel(panel) {
  if (!panel || !overlay) return;
  const anotherPanelWasOpen = Boolean(detailPanel?.classList.contains("open") || basketPanel?.classList.contains("open"));
  if (!anotherPanelWasOpen && overlayState === "closed") lastFocus = document.activeElement;
  const revision = ++overlayRevision;
  overlayState = "opening";
  overlay.setAttribute("aria-hidden", "false");
  overlay.classList.add("rendered");
  panel.setAttribute("aria-hidden", "false");
  document.body.classList.add("locked");
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (revision !== overlayRevision || overlayState !== "opening") return;
    panel.classList.add("open");
    overlay.classList.add("visible");
    overlayState = "open";
    $(".panel-close", panel)?.focus();
  }));
}
function closePanels() {
  if (!basketPanel || !overlay) return;
  const wasOpen = basketPanel.classList.contains("open") || Boolean(detailPanel?.classList.contains("open"));
  if (!wasOpen && overlayState === "closed") return;
  const revision = ++overlayRevision;
  overlayState = "closing";
  detailPanel?.classList.remove("open");
  basketPanel.classList.remove("open");
  detailPanel?.setAttribute("aria-hidden", "true");
  basketPanel.setAttribute("aria-hidden", "true");
  confirmDialog?.classList.remove("open");
  confirmDialog?.setAttribute("aria-hidden", "true");
  overlay.classList.remove("visible");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("locked");
  if (overlay.classList.contains("rendered")) watchOverlayExit(revision);
  else overlayState = "closed";
  if (wasOpen && lastFocus?.isConnected) lastFocus.focus();
}
function openDetails(id) {
  if (!catalogEnabled) return;
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
  renderVariantToggle(activeProduct);
  updateDetailPrice();
  $("[data-detail-quantity]").textContent = detailQuantity;
  setProductImage($("[data-detail-image]"), activeProduct.imagePosition);
  closePanels();
  openPanel(detailPanel);
}
function updateDetailPrice() {
  if (!activeProduct) return;
  const variant = $("[data-variant]")?.value || "";
  $("[data-detail-price]").textContent = `${money(priceFor(activeProduct, variant))} · DEMO`;
  $$(`[data-variant-toggle] [data-variant-value]`).forEach(button => {
    const selected = button.dataset.variantValue === variant;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-checked", String(selected));
  });
}

function renderVariantToggle(product) {
  const select = $("[data-variant]");
  const toggle = $("[data-variant-toggle]");
  if (!select || !toggle) return;
  toggle.innerHTML = (product.variants || []).map((variant, index) => 
    `<button type="button" class="variant-toggle-option${index === 0 ? " is-selected" : ""}" data-variant-value="${escapeHtml(variant.name)}" role="radio" aria-checked="${index === 0}"><span>${escapeHtml(variant.name)}</span><strong>${money(variant.price)}</strong></button>`).join("");
  toggle.onclick = event => {
    const button = event.target.closest("[data-variant-value]");
    if (!button) return;
    select.value = button.dataset.variantValue;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  };
}
function persistBasket() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(basket)); }
  catch { showToast("Could not save on this device"); }
  renderBasket();
}
function addToBasket(product, quantity = 1, variant = "") {
  if (!product) return;
  const saved = basket.find(item => item.id === product.id && item.variant === variant);
  if (saved) saved.quantity = Math.min(99, saved.quantity + quantity);
  else basket.push({ id: product.id, variant, quantity: Math.min(99, quantity) });
  persistBasket();
  showToast("ADDED TO MEMORY BASKET");
  $$("[data-basket-units]").forEach(badge => {
    badge.classList.remove("bump");
    requestAnimationFrame(() => badge.classList.add("bump"));
  });
}
function basketItemKey(item) { return JSON.stringify([item.id, item.variant || ""]); }
function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function queueBasketEntrance(element) {
  if (prefersReducedMotion()) {
    element.classList.remove("is-entering");
    return;
  }
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (element.isConnected) element.classList.remove("is-entering");
  }));
}
function createBasketEmpty() {
  const empty = document.createElement("div");
  empty.className = "basket-empty is-entering";
  empty.innerHTML = `<span class="empty-ring" aria-hidden="true">+</span><h3>Your basket is waiting.</h3><p>Explore the drinks menu and save what you would like to remember.</p><a class="text-button basket-menu-link" href="drinks.html">BROWSE DRINKS <span aria-hidden="true">↗</span></a>`;
  queueBasketEntrance(empty);
  return empty;
}
function hasLiveBasketRows() {
  return [...basketRows.values()].some(row => row.isConnected && !row.classList.contains("is-removing"));
}
function restoreElement(element) {
  element.classList.remove("is-removing");
  element.inert = false;
  element.removeAttribute("aria-hidden");
}
function finishBasketExit(element) {
  if (!element.classList.contains("is-removing")) return;
  if (element.classList.contains("basket-row")) {
    const key = element.dataset.basketKey;
    const itemStillExists = basket.some(item => basketItemKey(item) === key);
    if (basketRows.get(key) === element && !itemStillExists) {
      basketRows.delete(key);
      element.remove();
    }
  } else if (element === basketEmpty && !basket.length && !hasLiveBasketRows()) {
    basketEmpty = null;
    element.remove();
  }
  ensureEmptyBasket();
}
function watchBasketExit(element) {
  let finished = false;
  const cleanup = () => {
    element.removeEventListener("transitionend", onTransition);
    element.removeEventListener("transitioncancel", onTransition);
  };
  const finish = () => {
    if (finished) return;
    finished = true;
    cleanup();
    finishBasketExit(element);
  };
  const onTransition = event => {
    if (event.target === element && event.propertyName === "opacity") finish();
  };
  element.addEventListener("transitionend", onTransition);
  element.addEventListener("transitioncancel", onTransition);
  const transitions = element.getAnimations?.().filter(animation => animation.transitionProperty === "opacity") || [];
  if (transitions.length) Promise.allSettled(transitions.map(animation => animation.finished)).then(finish);
  else requestAnimationFrame(finish);
}
function ensureEmptyBasket() {
  if (!basketBody) return;
  if (basket.length || hasLiveBasketRows()) {
    if (basketEmpty?.isConnected) beginBasketExit(basketEmpty);
    return;
  }
  if (basketEmpty?.isConnected) {
    restoreElement(basketEmpty);
    return;
  }
  basketEmpty = createBasketEmpty();
  basketBody.append(basketEmpty);
}
function beginBasketExit(element) {
  if (!element || element.classList.contains("is-removing")) return;
  if (element.contains(document.activeElement)) {
    const next = element.nextElementSibling?.querySelector("button:not([disabled]),a[href]") ||
      element.previousElementSibling?.querySelector("button:not([disabled]),a[href]") ||
      $(".panel-close", basketPanel);
    next?.focus();
  }
  element.inert = true;
  element.setAttribute("aria-hidden", "true");
  if (prefersReducedMotion()) {
    if (element.classList.contains("basket-row")) basketRows.delete(element.dataset.basketKey);
    if (element === basketEmpty) basketEmpty = null;
    element.remove();
    return;
  }
  element.classList.add("is-removing");
  watchBasketExit(element);
}
function createBasketRow(item, product) {
  const variant = item.variant || "";
  const row = document.createElement("article");
  row.className = "basket-row is-entering";
  row.dataset.basketKey = basketItemKey(item);
  row.dataset.testid = `basket-item-${product.id}`;
  row.innerHTML = `<div class="basket-thumb" role="img" aria-label="${escapeHtml(product.name)}"></div><div class="basket-row-info"><strong>${escapeHtml(product.name)}</strong><small data-row-meta></small><div class="basket-row-controls"><button type="button" data-action="basket-minus" data-id="${escapeHtml(product.id)}" data-variant="${escapeHtml(variant)}" aria-label="Decrease ${escapeHtml(product.name)} quantity">−</button><output data-quantity aria-label="Quantity"></output><button type="button" data-action="basket-plus" data-id="${escapeHtml(product.id)}" data-variant="${escapeHtml(variant)}" aria-label="Increase ${escapeHtml(product.name)} quantity">+</button><button type="button" class="remove-item" data-action="remove" data-id="${escapeHtml(product.id)}" data-variant="${escapeHtml(variant)}" aria-label="Remove ${escapeHtml(product.name)}">remove</button></div></div><strong class="basket-row-total" data-row-total></strong>`;
  setProductImage($(".basket-thumb", row));
  updateBasketRow(row, item, product);
  queueBasketEntrance(row);
  return row;
}
function updateBasketRow(row, item, product) {
  const variant = item.variant || "";
  const unitPrice = priceFor(product, variant);
  const quantityOutput = $("[data-quantity]", row);
  if (quantityOutput?.textContent !== String(item.quantity)) updateQuantityDisplay(quantityOutput, item.quantity);
  const meta = $("[data-row-meta]", row);
  const metaText = `${variant || "Regular"} · ${money(unitPrice)} each · DEMO`;
  if (meta && meta.textContent !== metaText) meta.textContent = metaText;
  const rowTotal = $("[data-row-total]", row);
  const totalText = money(unitPrice * item.quantity);
  if (rowTotal && rowTotal.textContent !== totalText) rowTotal.textContent = totalText;
}
function ensureBasketFoot() {
  if (!basketFoot || basketFootReady) return;
  basketFoot.innerHTML = `<div class="basket-total" data-basket-total-wrap><span>ESTIMATED TOTAL · SAMPLE PRICES</span><strong data-basket-total></strong></div><p class="basket-privacy" data-basket-privacy></p><div class="basket-actions" data-basket-actions><button type="button" class="clear-button" data-action="clear">CLEAR BASKET</button><button type="button" class="back-menu" data-action="back-menu">DONE</button></div>`;
  basketFootReady = true;
}
function renderBasketFoot(total) {
  ensureBasketFoot();
  if (!basketFootReady) return;
  const hasItems = basket.length > 0;
  const totalWrap = $("[data-basket-total-wrap]", basketFoot);
  const actions = $("[data-basket-actions]", basketFoot);
  const privacy = $("[data-basket-privacy]", basketFoot);
  $("[data-basket-total]", basketFoot).textContent = money(total);
  totalWrap.hidden = !hasItems;
  actions.hidden = !hasItems;
  if (previousBasketHasItems !== hasItems) {
    privacy.innerHTML = hasItems
      ? `<strong>Personal reminder only.</strong> It stays on this device and is <strong>not sent to staff.</strong> Take your list to the counter to order.`
      : `Your list stays on this device. It is <strong>not sent to staff</strong>.`;
    previousBasketHasItems = hasItems;
  }
}
function renderBasket() {
  if (!basketPanel) return;
  const units = basket.reduce((sum, item) => sum + item.quantity, 0);
  const total = basket.reduce((sum, item) => {
    const product = getProduct(item.id);
    return sum + (product ? priceFor(product, item.variant) * item.quantity : 0);
  }, 0);
  $$("[data-basket-units]").forEach(node => { node.textContent = units; });
  $("[data-basket-unique]").textContent = `${basket.length} ${basket.length === 1 ? "ITEM" : "ITEMS"}`;
  if (!basketBody) return;
  const activeKeys = new Set();
  basket.forEach(item => {
    const product = getProduct(item.id);
    if (!product) return;
    const key = basketItemKey(item);
    activeKeys.add(key);
    let row = basketRows.get(key);
    if (!row) {
      row = createBasketRow(item, product);
      basketRows.set(key, row);
      basketBody.append(row);
    } else {
      if (row.parentNode !== basketBody) basketBody.append(row);
      restoreElement(row);
    }
    updateBasketRow(row, item, product);
  });
  basketRows.forEach((row, key) => {
    if (!activeKeys.has(key)) beginBasketExit(row);
  });
  ensureEmptyBasket();
  renderBasketFoot(total);
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
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2100);
}
function showConfirm() {
  if (!confirmDialog) return;
  confirmDialog.classList.add("open");
  confirmDialog.setAttribute("aria-hidden", "false");
  $("[data-action=cancel-clear]", confirmDialog).focus();
}
function updateQuantityDisplay(output, quantity) {
  if (!output) return;
  output.textContent = quantity;
  if (prefersReducedMotion() || typeof output.animate !== "function") return;
  output.getAnimations?.().forEach(animation => animation.cancel());
  output.animate(
    [{ opacity: 0.6, transform: "scale(.92)" }, { opacity: 1, transform: "scale(1)" }],
    { duration: 200, easing: "ease-out" }
  );
}

document.addEventListener("click", event => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const { action, id, variant = "" } = target.dataset;
  if (action === "details") openDetails(id);
  if (action === "quick-add") addToBasket(getProduct(id));
  if (action === "open-basket") { closePanels(); openPanel(basketPanel); }
  if (action === "close-detail" || action === "close-basket") closePanels();
  if (action === "detail-minus" && detailPanel) { detailQuantity = Math.max(1, detailQuantity - 1); updateQuantityDisplay($("[data-detail-quantity]"), detailQuantity); }
  if (action === "detail-plus" && detailPanel) { detailQuantity = Math.min(99, detailQuantity + 1); updateQuantityDisplay($("[data-detail-quantity]"), detailQuantity); }
  if (action === "add-detail" && activeProduct) { addToBasket(activeProduct, detailQuantity, $("[data-variant]").value); closePanels(); }
  if (action === "basket-minus") changeBasket(id, variant, -1);
  if (action === "basket-plus") changeBasket(id, variant, 1);
  if (action === "remove") { basket = basket.filter(item => !(item.id === id && item.variant === variant)); persistBasket(); showToast("Removed from Memory Basket"); }
  if (action === "clear") showConfirm();
  if (action === "cancel-clear" && confirmDialog) { confirmDialog.classList.remove("open"); confirmDialog.setAttribute("aria-hidden", "true"); $(".clear-button", basketPanel)?.focus(); }
  if (action === "confirm-clear" && confirmDialog) { basket = []; persistBasket(); confirmDialog.classList.remove("open"); confirmDialog.setAttribute("aria-hidden", "true"); $(".panel-close", basketPanel)?.focus(); showToast("Memory Basket cleared"); }
  if (action === "back-menu") closePanels();
  if (action === "reset-filters" && search) { activeCategory = "all"; query = ""; search.value = ""; updateFilter(); }
});

if (catalogEnabled) {
  filters.addEventListener("click", event => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    updateFilter();
  });
  search.addEventListener("input", event => { query = event.target.value; renderProducts(); });
  $("[data-variant]").addEventListener("change", updateDetailPrice);
  renderFilters();
  renderProducts();
}
overlay?.addEventListener("click", closePanels);
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && confirmDialog?.classList.contains("open")) {
    confirmDialog.classList.remove("open");
    confirmDialog.setAttribute("aria-hidden", "true");
    $(".clear-button", basketPanel)?.focus();
    return;
  }
  if (event.key === "Escape" && (detailPanel?.classList.contains("open") || basketPanel?.classList.contains("open"))) closePanels();
  if (event.key === "/" && search && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) { event.preventDefault(); search.focus(); }
  if (event.key === "Enter" && event.target.matches(".product-name[role=button]")) openDetails(event.target.dataset.id);
  if (event.key === "Tab") {
    const panel = confirmDialog?.classList.contains("open")
      ? confirmDialog
      : detailPanel?.classList.contains("open") ? detailPanel
      : basketPanel?.classList.contains("open") ? basketPanel
      : null;
    if (!panel) return;
    const focusable = $$('button:not([disabled]),a[href],select,input,[tabindex="0"]', panel).filter(el => el.getClientRects().length);
    if (focusable.length && event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable.at(-1).focus(); }
    else if (focusable.length && !event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0].focus(); }
  }
});

function observeReveals(scope = document) {
  const items = $$(".reveal", scope);
  if (!items.length) return;
  if (!("IntersectionObserver" in window)) { items.forEach(item => item.classList.add("is-visible")); return; }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    observer.unobserve(entry.target);
  }), { threshold: 0.12 });
  items.forEach(item => observer.observe(item));
}
renderBasket();
observeReveals();
