# IPADEL Digital Menu — static site

The live menu is plain HTML and browser JavaScript. Tailwind CSS 4 CLI generates one static stylesheet; React and Vite are not used. Existing brand and motion styles are bundled as component CSS, while Tailwind utilities handle shared layout, responsive navigation, accessibility, and the product grid.

The site is already shipped as static HTML/CSS/JavaScript. No React, Vite, npm install, or build command is required for the production deployment. The local Tailwind stylesheet is loaded from `assets/tailwind.css`; keep `assets/`, `js/`, the HTML pages, and the CSS files together. The Memory Basket is stored locally on the device and is not sent to the club.

## Vercel

Use the repository root as Root Directory, Framework Preset `Other`, leave Install Command and Build Command empty, and set Output Directory to `.`. Vercel serves the pages as static files. No React or Vite build is involved.
