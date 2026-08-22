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
