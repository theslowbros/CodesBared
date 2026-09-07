# CodesBared

A self-contained browser QR / barcode / matrix-code generator. There are no CDN or font-network calls — libraries live in `vendor/`.

Do not download `index.html` by itself from the repo viewer. The page needs `css/`, `js/`, and `vendor/` next to it.

## Open in the browser

This is a static HTML app. Host it once, then use the live URL — or open it locally.

### GitHub Pages

Enable **Pages** on branch `main`, folder `/` (root). `.nojekyll` is already in the repo so `vendor/` and `js/` are served as-is. The site will be `https://<user>.github.io/CodesBared/`.

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

For a standard QR code, select **SVG** or **PNG** in the preview and click **Check readability**. The app decodes that finished export (including styles and logos), compares its content with the intended payload, and tries it again at half size. Changes to the code or preview format clear the result; check again before sharing.

Results distinguish readable codes, readable codes with cautions, unconfirmed scans, content mismatches, and unavailable checks. A browser decode failure is **Scan not confirmed**, not evidence that a phone cannot read the code. Both full and half size are tried, even if full size does not decode. Cautions cover reduced-size failures, color contrast, whitespace, and transparency. Transparent artwork is tested on white. This is a local digital-image check, not a guarantee for every camera, print size, lighting condition, or background. Downloads remain available regardless of the result. Other barcode formats do not currently have a decoder check.

Each result shows the full-size and half-size decode times, measured inside the decoding worker (or local-file fallback) **after loading and initializing the decoder**. Timings include all decoder attempts needed for that image, including the independent fallback. The total check time includes startup, image preparation, worker messaging, and both sizes. These are single-run measurements on the current browser/device; they are not camera acquisition times or a phone-readability score. Recheck to compare runs.

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
js/qr-reader.js       reusable pixel decoder (no reader UI or camera access)
js/qr-reader.worker.js off-main-thread decoding for hosted pages
js/qr-readability.js  export rasterization and readability checks
vendor/               qrcode.js, bwip-js.min.js, jsQR.js, zxing-reader.js
```

## Tests

```bash
npm test
npm run test:browser
```

- `test/formats.node.js` — registry, validators, contrast helpers, sample payloads
- `test/render-svg.node.js` — encodes every format to SVG via bwip-js and writes `test/output/*.svg`
- `test/render-svg.html` — in-browser gallery using the real QR / bwip engines

`test/browser-smoke.html` is a smaller engine smoke test.

Install development dependencies with `npm ci`. Browser tests use installed Chrome by default; set `PW_CHANNEL=msedge` for Edge or `PW_CHANNEL=chromium` after `npx playwright install chromium` for Playwright's browser. They cover the actual canvas/SVG renderers and decoder, worker and local-file fallback, logos, styles, content matching, invalidation, and mobile layout.

`test/decoder-accuracy.spec.js` compares 378 generated images (42 module styles × 3 marker-center styles × 3 sizes) against the original jsQR implementation. It verifies recovery of the original decoder's misses, retained baseline successes, inert payload matching, and timing boundaries. A synthetic comparison report with decode-time percentiles is written to `test/output/decoder-benchmark.json`; this is not a real-camera benchmark.

## Decoder foundation

`CodesBared.qrReader.readImageData(imageData, { signal })` returns a Promise containing `{ text, bytes, version, location, decoder }`, or `null` if no QR code was found. Invalid images and decoder failures reject; cancellation uses an `AbortSignal`. Pass `{ signal, detailed: true }` to receive `{ code, timings: { setupMs, decodeMs, attempts } }`, including measurements for unsuccessful scans. `decodeImageData(imageData)` is retained as the synchronous **jsQR-only** compatibility API; use `readImageData` for the enhanced reader. Both accept RGBA image data up to 16 megapixels. Callers must composite transparency onto their chosen background first. The readability layer uses white.

The enhanced reader uses ZXing-C++ via pinned `zxing-wasm` 3.1.3, with harder search, rotation, inversion, downscaling, and denoising enabled, then jsQR as an independent fallback. It never uses the expected payload or encoder matrix to reconstruct the image. ZXing's bundled WASM is loaded only when checking; bytes are embedded in a local script so both hosted pages and local files use the same engines without a CDN or WASM fetch. If the enhanced engine fails to load and the fallback cannot decode, the check reports an availability error rather than an unconfirmed scan.

The decoder never navigates to decoded URLs, requests camera access, persists decoded content, or sends images over the network. A future upload or camera reader can pass its pixels to the same API. Hosted pages use a worker; browsers that prohibit workers for local files use the same decoder combination on the main thread. The readability comparison accepts the optional leading UTF-8 BOM emitted by the existing QR encoder, while preserving whitespace, case, and all other content differences.
