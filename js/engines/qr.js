(function (global) {
  'use strict';

  const CB = global.CodesBared = global.CodesBared || {};
  CB.engines = CB.engines || {};

  function requireQRCode() {
    if (typeof QRCode === 'undefined') {
      throw new Error('qrcode.js is not loaded');
    }
  }

  function buildModel(text, highEc) {
    requireQRCode();
    const scratch = document.createElement('div');
    const inst = new QRCode(scratch, {
      text: text,
      correctLevel: highEc ? QRCode.CorrectLevel.H : QRCode.CorrectLevel.M
    });
    return inst._oQRCode;
  }

  function drawCanvas(model, sizePx, quietModules, dark, light) {
    const count = model.getModuleCount();
    const totalModules = count + quietModules * 2;
    const cell = sizePx / totalModules;
    const overlap = Math.max(0.6, cell * 0.06);

    const canvas = document.createElement('canvas');
    canvas.width = sizePx;
    canvas.height = sizePx;
    const ctx = canvas.getContext('2d');
    if (light) {
      ctx.fillStyle = light;
      ctx.fillRect(0, 0, sizePx, sizePx);
    } else {
      ctx.clearRect(0, 0, sizePx, sizePx);
    }
    ctx.fillStyle = dark;
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (model.isDark(row, col)) {
          const x = (col + quietModules) * cell;
          const y = (row + quietModules) * cell;
          ctx.fillRect(x, y, cell + overlap, cell + overlap);
        }
      }
    }
    return canvas;
  }

  function buildSvg(model, sizePx, quietModules, dark, light) {
    const count = model.getModuleCount();
    const totalModules = count + quietModules * 2;
    const cell = sizePx / totalModules;
    const overlap = Math.max(0.6, cell * 0.06);
    let rects = '';
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (model.isDark(row, col)) {
          const x = (col + quietModules) * cell;
          const y = (row + quietModules) * cell;
          rects += '<rect x="' + x.toFixed(3) + '" y="' + y.toFixed(3) +
            '" width="' + (cell + overlap).toFixed(3) +
            '" height="' + (cell + overlap).toFixed(3) + '"/>';
        }
      }
    }
    const bg = light
      ? '<rect width="100%" height="100%" fill="' + light + '"/>'
      : '';
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + sizePx + '" height="' + sizePx +
      '" viewBox="0 0 ' + sizePx + ' ' + sizePx + '" shape-rendering="crispEdges">' +
      bg +
      '<g fill="' + dark + '">' + rects + '</g></svg>';
  }

  CB.engines.qr = {
    available: function () {
      return typeof QRCode !== 'undefined';
    },
    render: function (text, options) {
      const size = options.size;
      const quiet = options.quiet;
      const dark = options.dark;
      const light = options.transparent ? null : options.light;
      const hasLogo = !!options.logoDataUrl;
      const model = buildModel(text, hasLogo);
      const canvas = drawCanvas(model, size, quiet, dark, light);
      const svg = buildSvg(model, size, quiet, dark, light);
      return {
        canvas: canvas,
        svg: svg,
        extraStatus: hasLogo ? 'logo on · EC:H' : ''
      };
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
