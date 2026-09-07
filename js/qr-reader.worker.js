'use strict';
importScripts('../vendor/jsQR.js', 'qr-reader.js');
self.onmessage = async function (event) {
  try {
    self.postMessage({ result: await self.CodesBared.qrReader.measureImageData(event.data) });
  } catch (error) {
    self.postMessage({ error: error.message || 'QR decoder failed.' });
  }
};
