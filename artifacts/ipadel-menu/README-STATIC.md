# IPADEL Digital Menu — static version

The menu is plain HTML, CSS, and browser JavaScript. It does not require React, a package install, or a build step.

Open `index.html` in a browser. The other pages are `drinks.html` and `canteen.html`. Keep the adjacent `assets/`, `js/`, `menu.css`, and `menu-overrides.css` files together when copying or hosting the site. For the Memory Basket to be shared consistently across all pages, serve this folder from any static web server; browsers may isolate storage when pages are opened individually with `file://`.

The catalog, category filters, search, item details, and device-local Memory Basket are implemented in `js/data.js` and `js/app.js`. The menu does not send orders or basket data to the API server. Google Fonts still loads from the internet; system font fallbacks are included in the stylesheet.
