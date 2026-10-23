# Tailwind deployment research

- Tailwind Play CDN is intended for development, not production. Source: https://tailwindcss.com/docs/installation/play-cdn
- Tailwind CLI scans HTML/JS templates and writes a static CSS file; official setup uses `tailwindcss` and `@tailwindcss/cli`. Source: https://tailwindcss.com/docs/installation/tailwind-cli
- The live IPADEL pages use ordinary `.html`, classic `.js`, and custom `.css`; Tailwind directives appear in the legacy `artifacts/ipadel-menu/src/index.css` React/Vite scaffold, not linked from the active HTML pages.
