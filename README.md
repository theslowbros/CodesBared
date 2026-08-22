# CodesBared

A self-contained browser QR / barcode / matrix-code generator. There are no CDN or font-network calls — libraries live in `vendor/`.

Do not download `index.html` by itself from the repo viewer. The page needs `css/`, `js/`, and `vendor/` next to it.

## Open in the browser

This Origin repo is static HTML. Host it once, then use the live URL.

### Vercel (recommended for Origin)

Origin can deploy this repo straight to Vercel. After that, every merge to `main` updates the site and you get a URL instead of a download.

1. In this repo, open **Apps** and connect **Vercel**  
   or in Vercel: **New Project → Continue with Origin → CodesBared**
2. Framework preset: **Other** (no build command; publish the repo root)
3. Deploy. You’ll get something like `https://codesbared.vercel.app`

Origin repositories are private. Vercel needs a **Pro** team to deploy them ([Vercel for Origin](https://vercel.com/docs/git/vercel-for-origin)).

### GitHub Pages

If you also push this repo to GitHub, enable **Pages** on branch `main`, folder `/` (root). `.nojekyll` is already in the repo so `vendor/` and `js/` are served as-is. The site will be `https://<user>.github.io/CodesBared/`.

### Local

Clone the folder, then either open `index.html` or:

```bash
python3 -m http.server 8080
```

and visit http://127.0.0.1:8080

## Usage

1. Open the hosted URL (or `index.html` locally)
2. Pick a category, then a format (or search)
3. Type a URL, GTIN, or other payload
4. Tweak size, whitespace, and colors (optional transparent background; whitespace stays relative when you change format)
5. Save PNG or SVG

Last-used text, format, size, and colors persist in `localStorage`.

## Formats

The picker includes every bwip-js symbology we can encode locally (about 100), plus a custom QR drawer.

QR extras: content types (URL, Wi-Fi, email, phone, SMS, vCard, place), module/corner styles, and an optional two-color gradient on the code.

QR encoding uses `vendor/qrcode.js` with a custom canvas/SVG drawer. Everything else uses `vendor/bwip-js.min.js` (bwip-js 4.7.0).

## Layout

```
index.html            page shell
css/app.css           styles (system fonts, no webfonts)
js/app.js             UI wiring and render loop
js/formats.js         format registry + validation
js/payloads.js        QR content builders (Wi-Fi, vCard, …)
js/colors.js          contrast helpers
js/logo.js            logo overlay for canvas/SVG
js/persist.js         localStorage
js/engines/qr.js      QR renderer
js/engines/bwip.js    bwip-js wrapper
vendor/               qrcode.js, bwip-js.min.js
```

## Tests

```bash
npm test
```

- `test/formats.node.js` — registry, validators, contrast helpers, sample payloads
- `test/render-svg.node.js` — encodes every format to SVG via bwip-js and writes `test/output/*.svg`
- `test/render-svg.html` — in-browser gallery using the real QR / bwip engines

`test/browser-smoke.html` is a smaller engine smoke test.
