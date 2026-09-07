(function (global) {
  'use strict';

  const CB = global.CodesBared = global.CodesBared || {};
  const script = typeof document !== 'undefined' && document.currentScript;
  const workerUrl = script ? new URL('qr-reader.worker.js', script.src).href : null;
  const baseUrl = script ? script.src : global.location && global.location.href;
  const enhancedUrl = baseUrl ? new URL('../vendor/zxing-reader.js', baseUrl).href : null;
  let enhancedReady;

  function loadEnhancedDecoder() {
    if (!enhancedReady) {
      enhancedReady = new Promise(function (resolve, reject) {
        if (global.ZXingWASM) return resolve();
        if (!enhancedUrl) return reject(new Error('Decoder URL is unavailable.'));
        if (typeof global.importScripts === 'function') {
          try { global.importScripts(enhancedUrl); resolve(); }
          catch (error) { reject(error); }
          return;
        }
        const tag = document.createElement('script');
        const timer = setTimeout(function () { finish(new Error('Decoder loading timed out.')); }, 10000);
        function finish(error) {
          clearTimeout(timer);
          tag.onload = tag.onerror = null;
          tag.remove();
          if (error) reject(error);
          else resolve();
        }
        tag.onload = function () { finish(global.ZXingWASM ? null : new Error('Decoder failed to initialize.')); };
        tag.onerror = function () { finish(new Error('Decoder failed to load.')); };
        tag.src = enhancedUrl;
        document.head.appendChild(tag);
      }).catch(function (error) { enhancedReady = null; throw error; });
    }
    return enhancedReady;
  }

  function validatePixels(pixels) {
    if (!pixels || !Number.isInteger(pixels.width) || !Number.isInteger(pixels.height) ||
        pixels.width < 1 || pixels.height < 1 || pixels.width * pixels.height > 16777216 ||
        !pixels.data || pixels.data.length !== pixels.width * pixels.height * 4) {
      throw new Error('Invalid or oversized QR image.');
    }
  }

  // Platform-neutral entry point for generated images, uploads, or video frames.
  // Keep the decoded content inert: this layer never opens URLs or touches the UI.
  function decodeImageData(pixels) {
    validatePixels(pixels);
    if (typeof global.jsQR !== 'function') throw new Error('QR decoder is unavailable.');
    const code = global.jsQR(pixels.data, pixels.width, pixels.height, { inversionAttempts: 'attemptBoth' });
    return code ? {
      text: code.data,
      bytes: code.binaryData,
      version: code.version,
      location: code.location,
      decoder: 'jsQR'
    } : null;
  }

  async function decodeWithEngines(pixels, signal, timings) {
    validatePixels(pixels);
    if (signal && signal.aborted) throw abortError();
    timings = timings || {};
    timings.setupMs = 0;
    timings.decodeMs = 0;
    timings.attempts = 0;
    let enhancedError;
    try {
      const setupStarted = performance.now();
      try {
        await loadEnhancedDecoder();
        // Instantiate WASM before starting the decode clock. The bundle already
        // configured local wasmBinary; omitted overrides preserve that setting.
        await global.ZXingWASM.prepareZXingModule({ fireImmediately: true });
      } finally { timings.setupMs += performance.now() - setupStarted; }
      if (signal && signal.aborted) throw abortError();
      const decodeStarted = performance.now();
      let codes;
      timings.attempts += 1;
      try {
        codes = await global.ZXingWASM.readBarcodes(pixels, {
          formats: ['QRCode'], maxNumberOfSymbols: 1, textMode: 'Plain',
          tryHarder: true, tryRotate: true, tryInvert: true,
          tryDownscale: true, tryDenoise: true, returnErrors: false
        });
      } finally { timings.decodeMs += performance.now() - decodeStarted; }
      if (signal && signal.aborted) throw abortError();
      const code = codes.find(function (result) { return result.isValid; });
      if (code) return {
        text: code.text, bytes: code.bytes, version: Number(code.version) || null,
        location: {
          topLeftCorner: code.position.topLeft, topRightCorner: code.position.topRight,
          bottomLeftCorner: code.position.bottomLeft, bottomRightCorner: code.position.bottomRight
        },
        decoder: 'ZXing'
      };
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      enhancedError = error;
    }
    if (signal && signal.aborted) throw abortError();
    // The independent decoder still recovers some images ZXing misses.
    const fallbackStarted = performance.now();
    timings.attempts += 1;
    let fallback;
    try { fallback = decodeImageData(pixels); }
    finally { timings.decodeMs += performance.now() - fallbackStarted; }
    if (fallback) return fallback;
    if (enhancedError) throw new Error('The enhanced QR decoder is unavailable. Please retry the check.');
    return null;
  }

  async function measureImageData(pixels, signal) {
    const timings = {};
    const code = await decodeWithEngines(pixels, signal, timings);
    return { code: code, timings: timings };
  }

  function abortError() {
    const error = new Error('QR check cancelled.');
    error.name = 'AbortError';
    return error;
  }

  function readImageData(pixels, options) {
    const signal = options && options.signal;
    return new Promise(function (resolve, reject) {
      let worker;
      let timer;
      let settled = false;
      function finish(error, result) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (worker) worker.terminate();
        if (signal) signal.removeEventListener('abort', cancel);
        if (error) reject(error);
        else resolve(options && options.detailed ? result : result.code);
      }
      function cancel() { finish(abortError()); }
      if (signal && signal.aborted) return cancel();
      if (signal) signal.addEventListener('abort', cancel, { once: true });
      function fallback() {
        if (worker) worker.terminate();
        clearTimeout(timer);
        // file:// browsers may disallow workers; still work entirely offline.
        timer = setTimeout(async function () {
          if (settled) return;
          try { finish(null, await measureImageData(pixels, signal)); }
          catch (error) { finish(error); }
        }, 0);
      }
      if (!workerUrl || typeof global.Worker !== 'function') return fallback();
      try {
        worker = new global.Worker(workerUrl);
        worker.onmessage = function (event) {
          if (event.data.error) finish(new Error(event.data.error));
          else finish(null, event.data.result);
        };
        worker.onerror = function (event) { event.preventDefault(); fallback(); };
        timer = setTimeout(function () { finish(new Error('QR check timed out. Try a smaller export.')); }, 15000);
        // Clone instead of transferring the caller's image buffer.
        worker.postMessage({ data: pixels.data, width: pixels.width, height: pixels.height });
      } catch (error) { fallback(); }
    });
  }

  CB.qrReader = {
    decodeImageData: decodeImageData, readImageData: readImageData,
    decodeWithEngines: decodeWithEngines, measureImageData: measureImageData
  };
})(typeof window !== 'undefined' ? window : globalThis);
