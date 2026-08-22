# CodesBared

A self-contained browser QR / barcode / matrix-code generator. Open `index.html` in a browser (or serve the folder). There are no CDN or font-network calls — libraries live in `vendor/`.

Classic script tags are used on purpose so the app still works from `file://`.

## Usage

1. Open `index.html`
2. Pick a format (or filter the list)
3. Type a URL, GTIN, or other payload
4. Tweak size, whitespace, and colors
5. Save PNG or SVG

Last-used text, format, size, and colors persist in `localStorage`.

## Formats

**2D / matrix:** QR Code, Micro QR, rMQR, Data Matrix, rectangular Data Matrix, Aztec, compact Aztec, PDF417, compact PDF417, MicroPDF417, MaxiCode, Han Xin, Code One, DotCode, Ultracode

**1D / linear:** Code 128, Code 39 / 39 Extended, Code 93 / 93 Extended, Code 11, Codabar, Interleaved 2 of 5, Code 2 of 5, Industrial 2 of 5, MSI, Plessey, Telepen, Codablock F

**Retail / GTIN:** EAN-13, EAN-8, EAN-14, UPC-A, UPC-E, ITF-14, ISBN, ISSN, ISMN, SSCC-18

**GS1:** GS1-128, GS1 Data Matrix, GS1 QR, DataBar Omnidirectional, DataBar Expanded

**Healthcare:** Pharmacode, two-track Pharmacode, PZN, Code 32

**Postal:** USPS Intelligent Mail, POSTNET, PLANET, Royal Mail 4-State, KIX, Australia Post, Japan Post

QR encoding uses `vendor/qrcode.js` with a custom canvas/SVG drawer (quiet zone in modules, logo overlay, contrast-aware colors). Everything else uses `vendor/bwip-js.min.js` (bwip-js 4.7.0).

## Layout

```
index.html            page shell
css/app.css           styles (system fonts, no webfonts)
js/app.js             UI wiring and render loop
js/formats.js         format registry + validation
js/colors.js          contrast helpers
js/logo.js            logo overlay for canvas/SVG
js/persist.js         localStorage
js/engines/qr.js      QR renderer
js/engines/bwip.js    bwip-js wrapper
vendor/               qrcode.js, bwip-js.min.js
```

## Tests

```bash
node test/formats.node.js
```

`test/browser-smoke.html` loads the vendored engines in a browser and encodes QR plus a few 1D/2D samples.
