# Third-party libraries

These files are vendored so the app can run from a local folder with no CDN.

## qrcode.js

- Project: [davidshimjs/qrcodejs](https://github.com/davidshimjs/qrcodejs)
- License: MIT
- Used for: QR Code module matrix (custom canvas/SVG drawing lives in `js/engines/qr.js`)

## bwip-js.min.js

- Project: [metafloor/bwip-js](https://github.com/metafloor/bwip-js) 4.7.0
- License: MIT
- Includes: [BWIPP](https://github.com/bwipp/postscriptbarcode) barcode encoders
- Used for: all non-QR linear, stacked, postal, and 2D matrix formats

## jsQR.js

- Project: [cozmo/jsQR](https://github.com/cozmo/jsQR) 1.4.0
- Source: unmodified `dist/jsQR.js` from the pinned npm package `jsqr@1.4.0`
- License: Apache-2.0; complete license in `jsQR.LICENSE`
- Used for: offline QR decoding for readability checks and the reusable reader API
- To refresh the vendored copy: install the pinned dependencies with `npm ci`, then copy `node_modules/jsqr/dist/jsQR.js` and `node_modules/jsqr/LICENSE` into `vendor/` (license named `jsQR.LICENSE`).
