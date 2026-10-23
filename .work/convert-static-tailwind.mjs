import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const app = path.join(root, 'artifacts', 'ipadel-menu');
const pages = ['index.html', 'drinks.html', 'canteen.html'];
const styleLinkPattern = /<link rel="stylesheet" href="\.\/menu\.css">[\s\S]*?<link rel="stylesheet" href="\.\/language-switch\.css\?v=\d+">/;
const stylesheetLink = '<link rel="stylesheet" href="./assets/tailwind.css?v=1">';
const headerClass = 'site-header grid grid-cols-[minmax(58px,1fr)_auto_auto] min-[381px]:grid-cols-[minmax(68px,1fr)_auto_auto] min-[641px]:grid-cols-[minmax(112px,1fr)_auto_auto]';

for (const page of pages) {
  const file = path.join(app, page);
  let html = fs.readFileSync(file, 'utf8');
  if (!styleLinkPattern.test(html)) throw new Error(`Expected stylesheet sequence not found in ${page}`);
  html = html.replace(styleLinkPattern, stylesheetLink);
  html = html.replace(/href="https:\/\/fonts\.googleapis\.com\/css2\?[^\"]+" rel="stylesheet"/, 'href="https://fonts.googleapis.com/css2?family=Cairo:wght@500;600;700;800&amp;family=Inter:wght@400;500;600;700&amp;family=Space+Grotesk:wght@400;500;600;700&amp;display=swap" rel="stylesheet"');
  html = html.replace(/<body class="([^"]*)">/, (_m, current) => `<body class="${current} min-h-screen antialiased selection:bg-[#19f5a0] selection:text-[#031326]">`);
  html = html.replace(/<header class="site-header">/g, `<header class="${headerClass}">`);
  html = html.replace(/class="main-nav"/g, 'class="main-nav justify-self-center"');
  if (page === 'index.html') {
    html = html.replace('class="hero-actions"', 'class="hero-actions grid gap-2"');
  }
  if (page === 'drinks.html') {
    html = html.replace('class="catalog-toolbar"', 'class="catalog-toolbar flex items-center justify-between gap-[22px]"');
    html = html.replace('class="filter-list"', 'class="filter-list flex flex-wrap gap-[10px] max-[640px]:flex-nowrap"');
    html = html.replace('class="search-box"', 'class="search-box flex items-center"');
    html = html.replace('class="product-grid"', 'class="product-grid grid grid-cols-1 gap-[13px] min-[901px]:grid-cols-3 max-[640px]:gap-[11px]"');
  }
  fs.writeFileSync(file, html, 'utf8');
}

const langCssPath = path.join(app, 'language-switch.css');
let langCss = fs.readFileSync(langCssPath, 'utf8');
langCss = langCss.replace(/^@import url\('https:\/\/fonts\.googleapis\.com\/css2\?family=Cairo:[^\n]+\);\s*/m, '');
langCss = langCss.replace(/grid-template-columns:minmax\(112px,1fr\) auto auto auto/g, 'grid-template-columns:minmax(112px,1fr) auto auto');
langCss = langCss.replace(/grid-template-columns:minmax\(68px,1fr\) auto auto auto/g, 'grid-template-columns:minmax(68px,1fr) auto auto');
langCss = langCss.replace(/grid-template-columns:minmax\(58px,1fr\) auto auto auto/g, 'grid-template-columns:minmax(58px,1fr) auto auto');
fs.writeFileSync(langCssPath, langCss, 'utf8');

const baseCssPath = path.join(app, 'menu.css');
let baseCss = fs.readFileSync(baseCssPath, 'utf8');
baseCss = baseCss.replace(/button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible\{outline:2px solid var\(--lime\);outline-offset:4px\}/, '');
baseCss = baseCss.replace(/\.sr-only\{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect\(0,0,0,0\);white-space:nowrap\}/, '');
fs.writeFileSync(baseCssPath, baseCss, 'utf8');

const tailwindInput = `@import "tailwindcss" source(none);\n@import "./menu.css" layer(components);\n@import "./menu-overrides.css" layer(components);\n@import "./premium-motion.css" layer(components);\n@import "./variant-toggle.css" layer(components);\n@import "./premium-controls.css" layer(components);\n@import "./brand-buttons.css" layer(components);\n@import "./experience-refinement.css" layer(components);\n@import "./product-readability.css" layer(components);\n@import "./language-switch.css" layer(components);\n\n@source "./index.html";\n@source "./drinks.html";\n@source "./canteen.html";\n@source "./js";\n\n@layer utilities {\n  :where(a, button, input, select):focus-visible {\n    @apply outline-none ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-950;\n  }\n}\n`;
fs.writeFileSync(path.join(app, 'tailwind.input.css'), tailwindInput, 'utf8');

const packageJson = {
  name: 'ipadel-menu-static',
  version: '1.0.0',
  private: true,
  scripts: {
    build: 'npx --yes --package=tailwindcss@4.1.14 --package=@tailwindcss/cli@4.1.14 -- tailwindcss -i ./tailwind.input.css -o ./assets/tailwind.css --minify',
  },
};
fs.writeFileSync(path.join(app, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');

const readme = `# IPADEL Digital Menu — static site\n\nThe live menu is plain HTML and browser JavaScript. Tailwind CSS 4 CLI generates a single static stylesheet; Vite and React are not used. Existing brand and motion styles are bundled as component CSS, while Tailwind utilities handle the shared layout, responsive navigation, accessibility, and product grid.\n\nFrom this directory, run \`npm run build\` to generate \`assets/tailwind.css\`. The command uses npm's temporary package runner to fetch pinned Tailwind CLI packages on demand; it does not install pnpm or require React/Vite. A network connection is needed for the first build.\n\nOpen \`index.html\` after building. The other pages are \`drinks.html\` and \`canteen.html\`. Keep \`assets/\`, \`js/\`, the source CSS files, and \`tailwind.input.css\` together. The Memory Basket is stored locally on the device and is not sent to the club.\n\n## Vercel\n\nSet Root Directory to \`artifacts/ipadel-menu\`, Framework Preset to \`Other\`, Build Command to \`npm run build\`, Install Command to \`true\`, and Output Directory to \`.\`. Vercel runs only the Tailwind CSS CLI build and serves the resulting HTML/CSS/JavaScript as static files.\n`;
fs.writeFileSync(path.join(app, 'README-STATIC.md'), readme, 'utf8');

const lockPath = path.join(root, 'pnpm-lock.yaml');
let lock = fs.readFileSync(lockPath, 'utf8').split(/\r?\n/);
const importerStart = lock.indexOf('  artifacts/ipadel-menu:');
if (importerStart < 0) throw new Error('Could not find the site importer in pnpm-lock.yaml');
let importerEnd = lock.length;
for (let i = importerStart + 1; i < lock.length; i += 1) {
  if (/^  [^\s#]/.test(lock[i])) { importerEnd = i; break; }
}
lock.splice(importerStart, importerEnd - importerStart, '  artifacts/ipadel-menu: {}');
fs.writeFileSync(lockPath, `${lock.join('\n').replace(/\n+$/, '')}\n`, 'utf8');

const oldFiles = ['vite.config.ts', 'tsconfig.json', 'components.json'];
for (const oldFile of oldFiles) {
  const file = path.join(app, oldFile);
  if (fs.existsSync(file)) fs.rmSync(file);
}
const reactSource = path.join(app, 'src');
if (fs.existsSync(reactSource)) fs.rmSync(reactSource, { recursive: true, force: true });

console.log('Updated static HTML pages, Tailwind input, minimal build manifest, README, and lockfile importer. Removed unused Vite/React configuration and source tree.');
