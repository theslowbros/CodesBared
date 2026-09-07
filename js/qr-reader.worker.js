'use strict';
importScripts('../vendor/jsQR.js', 'qr-reader.js');
self.onmessage = function (event) {
  try {
    self.postMessage({ result: self.CodesBared.qrReader.decodeImageData(event.data) });
  } catch (error) {
    self.postMessage({ error: error.message || 'QR decoder failed.' });
  }
};
