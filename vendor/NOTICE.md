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

## zxing-reader.js

- Wrapper: [Sec-ant/zxing-wasm](https://github.com/Sec-ant/zxing-wasm) 3.1.3, MIT; complete license in `zxing-wasm.LICENSE`.
- Reader: [zxing-cpp/zxing-cpp](https://github.com/zxing-cpp/zxing-cpp/tree/a17fd9dc65d6aa0dd2f660fdfca7a6a6613d938f), Apache-2.0; complete license from that revision in `zxing-cpp.LICENSE`.
- Source: pinned npm package `zxing-wasm@3.1.3`, unmodified `dist/iife/reader/index.js` plus the bytes of `dist/reader/zxing_reader.wasm`.
- Generated packaging adds a header and initializes `wasmBinary` from base64. Embedding the bytes avoids CDN calls and file-URL fetch restrictions; the decoder implementation is unchanged.
- Used for: enhanced offline decoding, with jsQR retained as an independent fallback.
- Reproduce the bundle and wrapper license with `npm ci` then `node scripts/vendor-zxing.cjs`.
