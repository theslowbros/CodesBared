(function (global) {
  'use strict';

  const CB = global.CodesBared = global.CodesBared || {};
  const script = typeof document !== 'undefined' && document.currentScript;
  const workerUrl = script ? new URL('qr-reader.worker.js', script.src).href : null;

  // Platform-neutral entry point for generated images, uploads, or video frames.
  // Keep the decoded content inert: this layer never opens URLs or touches the UI.
  function decodeImageData(pixels) {
    if (!pixels || !Number.isInteger(pixels.width) || !Number.isInteger(pixels.height) ||
        pixels.width < 1 || pixels.height < 1 || pixels.width * pixels.height > 16777216 ||
        !pixels.data || pixels.data.length !== pixels.width * pixels.height * 4) {
      throw new Error('Invalid or oversized QR image.');
    }
    if (typeof global.jsQR !== 'function') throw new Error('QR decoder is unavailable.');
    const code = global.jsQR(pixels.data, pixels.width, pixels.height, { inversionAttempts: 'attemptBoth' });
    return code ? {
      text: code.data,
      bytes: code.binaryData,
      version: code.version,
      location: code.location
    } : null;
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
        else resolve(result);
      }
      function cancel() { finish(abortError()); }
      if (signal && signal.aborted) return cancel();
      if (signal) signal.addEventListener('abort', cancel, { once: true });
      function fallback() {
        if (worker) worker.terminate();
        clearTimeout(timer);
        // file:// browsers may disallow workers; still work entirely offline.
        timer = setTimeout(function () {
          if (settled) return;
          try { finish(null, decodeImageData(pixels)); }
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

  CB.qrReader = { decodeImageData: decodeImageData, readImageData: readImageData };
})(typeof window !== 'undefined' ? window : globalThis);
