const fs = require('fs');
const enc = 'utf8';
const htmlPath = 'artifacts/ipadel-menu/drinks.html';
const jsPath = 'artifacts/ipadel-menu/js/app.js';
let html = fs.readFileSync(htmlPath, enc);
const oldWrap = '<div class="variant-wrap" data-variant-wrap><label for="variant-select">SIZE</label><select id="variant-select" data-variant></select></div>';
const newWrap = '<div class="variant-wrap" data-variant-wrap><label for="variant-select">SIZE</label><div class="variant-toggle" data-variant-toggle role="radiogroup" aria-label="Choose size"></div><select id="variant-select" data-variant></select></div>';
if (html.includes(oldWrap)) {
  html = html.replace(oldWrap, newWrap);
  fs.writeFileSync(htmlPath, html, enc);
}
let js = fs.readFileSync(jsPath, enc);
const renderCall = '  renderVariantToggle(activeProduct);\n  updateDetailPrice();';
if (!js.includes(renderCall)) {
  const callTarget = '  updateDetailPrice();\n  $("[data-detail-quantity]").textContent = detailQuantity;';
  if (!js.includes(callTarget)) throw new Error('detail render target not found');
  js = js.replace(callTarget, renderCall + '\n  $["[data-detail-quantity]"].textContent = detailQuantity;');
}
const toggleFn = `function renderVariantToggle(product) {
  const select = $("[data-variant]");
  const toggle = $("[data-variant-toggle]");
  if (!select || !toggle) return;
  toggle.innerHTML = (product.variants || []).map((variant, index) => 
    \`<button type="button" class="variant-toggle-option\${index === 0 ? " is-selected" : ""}" data-variant-value="\${escapeHtml(variant.name)}" role="radio" aria-checked="\${index === 0}"><span>\${escapeHtml(variant.name)}</span><strong>\${money(variant.price)}</strong></button>\`).join("");
  toggle.onclick = event => {
    const button = event.target.closest("[data-variant-value]");
    if (!button) return;
    select.value = button.dataset.variantValue;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  };
}
`;
if (!js.includes('function renderVariantToggle')) {
  js = js.replace('function persistBasket() {', toggleFn + 'function persistBasket() {');
}
const priceLine = '  $("[data-detail-price]").textContent = `${money(priceFor(activeProduct, variant))} · DEMO`;\n}';
const priceReplacement = '  $("[data-detail-price]").textContent = `${money(priceFor(activeProduct, variant))} · DEMO`;\n  $$(`[data-variant-toggle] [data-variant-value]`).forEach(button => {\n    const selected = button.dataset.variantValue === variant;\n    button.classList.toggle("is-selected", selected);\n    button.setAttribute("aria-checked", String(selected));\n  });\n}';
if (!js.includes('data-variant-toggle] [data-variant-value]')) {
  if (!js.includes(priceLine)) throw new Error('price target not found');
  js = js.replace(priceLine, priceReplacement);
}
fs.writeFileSync(jsPath, js, enc);
