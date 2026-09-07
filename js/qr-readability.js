(function (global) {
  'use strict';

  const CB = global.CodesBared = global.CodesBared || {};

  function loadSvg(svg, signal) {
    return new Promise(function (resolve, reject) {
      const image = new Image();
      let timer;
      function finish(error) {
        clearTimeout(timer);
        image.onload = image.onerror = null;
        if (signal) signal.removeEventListener('abort', cancel);
        if (error) { image.src = ''; reject(error); }
        else resolve(image);
      }
      function cancel() {
        const error = new Error('QR check cancelled.');
        error.name = 'AbortError';
        finish(error);
      }
      if (signal && signal.aborted) return cancel();
      if (signal) signal.addEventListener('abort', cancel, { once: true });
      image.onload = function () { finish(); };
      image.onerror = function () { finish(new Error('Could not read the SVG preview. Try checking PNG.')); };
      timer = setTimeout(function () { finish(new Error('SVG preview took too long to load.')); }, 15000);
      image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  }

  function pixelsFrom(source, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Image reading is unavailable in this browser.');
    // Alpha must be composited before decoding; transparent RGB is not visible ink.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(source, 0, 0, width, height);
    return ctx.getImageData(0, 0, width, height);
  }

  function matches(code, expected) {
    if (!code) return false;
    // qrcode.js can prefix UTF-8 text with a byte-order mark. Allow that one
    // encoding signature, but never trim, case-fold, or normalize payload data.
    return code.text === expected || code.text === '\uFEFF' + expected;
  }

  async function check(options) {
    const width = options.canvas.width;
    const height = options.canvas.height;
    const source = options.mode === 'svg' ? await loadSvg(options.svg, options.signal) : options.canvas;
    const readOptions = { signal: options.signal };
    const original = await CB.qrReader.readImageData(pixelsFrom(source, width, height), readOptions);
    const base = { width: width, height: height, mode: options.mode, warnings: [] };
    if (!original) return Object.assign(base, { status: 'unreadable' });
    if (!matches(original, options.expected)) return Object.assign(base, { status: 'mismatch' });

    const halfWidth = Math.max(1, Math.floor(width / 2));
    const halfHeight = Math.max(1, Math.floor(height / 2));
    const reduced = await CB.qrReader.readImageData(pixelsFrom(source, halfWidth, halfHeight), readOptions);
    base.reduced = matches(reduced, options.expected);
    if (!base.reduced) base.warnings.push('The code did not read correctly at half size. Use a larger size or simpler styling.');
    if (options.quiet < 4) base.warnings.push('Use at least 4 modules of whitespace around the QR code.');
    if (options.contrast != null && options.contrast < CB.colors.TARGET) {
      base.warnings.push('Low color contrast can make scanning harder. Increase the contrast.');
    }
    if (options.transparent) base.warnings.push('Transparency was tested on white only. Check the code on its final background.');
    return Object.assign(base, { status: base.warnings.length ? 'warning' : 'readable' });
  }

  CB.qrReadability = { check: check, matches: matches };
})(typeof window !== 'undefined' ? window : globalThis);
