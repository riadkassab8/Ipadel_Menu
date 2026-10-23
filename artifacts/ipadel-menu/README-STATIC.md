# IPADEL Digital Menu — static site

The live menu is plain HTML and browser JavaScript. Tailwind CSS 4 CLI generates one static stylesheet; React and Vite are not used. Existing brand and motion styles are bundled as component CSS, while Tailwind utilities handle shared layout, responsive navigation, accessibility, and the product grid.

From this directory, run `npm ci` once and then `npm run build` to generate `assets/tailwind.css`. The built HTML/CSS/JavaScript can then be served as static files. Keep `assets/`, `js/`, the source CSS files, and `tailwind.input.css` together. The Memory Basket is stored locally on the device and is not sent to the club.

## Vercel

Set Root Directory to `artifacts/ipadel-menu`, Framework Preset to `Other`, Install Command to `npm ci`, Build Command to `npm run build`, and Output Directory to `.`. The deployment installs only the Tailwind CLI build dependencies, generates the stylesheet, and serves the pages as static files. No React or Vite build is involved.
