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

  function inBlock(row, col, top, left, size) {
    return row >= top && row < top + size && col >= left && col < left + size;
  }

  function isFinder(row, col, count) {
    return inBlock(row, col, 0, 0, 7) ||
      inBlock(row, col, 0, count - 7, 7) ||
      inBlock(row, col, count - 7, 0, 7);
  }

  function finderOrigins(count) {
    return [
      { r: 0, c: 0 },
      { r: 0, c: count - 7 },
      { r: count - 7, c: 0 }
    ];
  }

  function darkFill(ctx, sizePx, dark, gradient) {
    if (gradient && gradient.from && gradient.to) {
      const g = ctx.createLinearGradient(
        0,
        0,
        gradient.dir === 'h' ? sizePx : (gradient.dir === 'v' ? 0 : sizePx),
        gradient.dir === 'v' ? sizePx : (gradient.dir === 'h' ? 0 : sizePx)
      );
      g.addColorStop(0, gradient.from);
      g.addColorStop(1, gradient.to);
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = dark;
    }
  }

  function svgGradient(id, sizePx, gradient) {
    const x2 = gradient.dir === 'v' ? '0' : '100%';
    const y2 = gradient.dir === 'h' ? '0' : '100%';
    return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="' + x2 + '" y2="' + y2 + '">' +
      '<stop offset="0%" stop-color="' + gradient.from + '"/>' +
      '<stop offset="100%" stop-color="' + gradient.to + '"/>' +
      '</linearGradient></defs>';
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    const rad = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  }

  function drawModule(ctx, x, y, cell, overlap, shape) {
    if (shape === 'dots') {
      ctx.beginPath();
      ctx.arc(x + cell / 2, y + cell / 2, cell * 0.42, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    if (shape === 'rounded') {
      roundRectPath(ctx, x, y, cell + overlap * 0.2, cell + overlap * 0.2, cell * 0.32);
      ctx.fill();
      return;
    }
    ctx.fillRect(x, y, cell + overlap, cell + overlap);
  }

  function moduleSvg(x, y, cell, overlap, shape) {
    if (shape === 'dots') {
      return '<circle cx="' + (x + cell / 2).toFixed(3) + '" cy="' + (y + cell / 2).toFixed(3) +
        '" r="' + (cell * 0.42).toFixed(3) + '"/>';
    }
    if (shape === 'rounded') {
      const r = (cell * 0.32).toFixed(3);
      return '<rect x="' + x.toFixed(3) + '" y="' + y.toFixed(3) +
        '" width="' + (cell + overlap * 0.2).toFixed(3) +
        '" height="' + (cell + overlap * 0.2).toFixed(3) +
        '" rx="' + r + '" ry="' + r + '"/>';
    }
    return '<rect x="' + x.toFixed(3) + '" y="' + y.toFixed(3) +
      '" width="' + (cell + overlap).toFixed(3) +
      '" height="' + (cell + overlap).toFixed(3) + '"/>';
  }

  function drawFinder(ctx, origin, cell, quiet, eye, light) {
    const x = (origin.c + quiet) * cell;
    const y = (origin.r + quiet) * cell;
    const outer = cell * 7;
    const r = eye === 'circle' ? outer / 2 : (eye === 'rounded' ? cell * 1.2 : 0);
    if (eye === 'square' || !eye) {
      ctx.fillRect(x, y, outer, outer);
      ctx.fillStyle = light || 'rgba(0,0,0,0)';
      if (light) ctx.fillRect(x + cell, y + cell, cell * 5, cell * 5);
      else ctx.clearRect(x + cell, y + cell, cell * 5, cell * 5);
      return { punch: true };
    }
    if (eye === 'circle') {
      ctx.beginPath();
      ctx.arc(x + outer / 2, y + outer / 2, outer / 2, 0, Math.PI * 2);
      ctx.fill();
      if (light) {
        ctx.fillStyle = light;
        ctx.beginPath();
        ctx.arc(x + outer / 2, y + outer / 2, cell * 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x + outer / 2, y + outer / 2, cell * 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }
      return { punch: true, r: r };
    }
    roundRectPath(ctx, x, y, outer, outer, cell * 1.15);
    ctx.fill();
    if (light) {
      ctx.fillStyle = light;
      roundRectPath(ctx, x + cell, y + cell, cell * 5, cell * 5, cell * 0.7);
      ctx.fill();
    } else {
      ctx.globalCompositeOperation = 'destination-out';
      roundRectPath(ctx, x + cell, y + cell, cell * 5, cell * 5, cell * 0.7);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
    return { punch: true };
  }

  function drawFinderInner(ctx, origin, cell, quiet, eye) {
    const x = (origin.c + quiet) * cell;
    const y = (origin.r + quiet) * cell;
    const cx = x + cell * 3.5;
    const cy = y + cell * 3.5;
    if (eye === 'circle') {
      ctx.beginPath();
      ctx.arc(cx, cy, cell * 1.5, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    if (eye === 'rounded') {
      roundRectPath(ctx, x + cell * 2, y + cell * 2, cell * 3, cell * 3, cell * 0.55);
      ctx.fill();
      return;
    }
    ctx.fillRect(x + cell * 2, y + cell * 2, cell * 3, cell * 3);
  }

  function finderSvg(origin, cell, quiet, eye, fill) {
    const x = (origin.c + quiet) * cell;
    const y = (origin.r + quiet) * cell;
    const outer = cell * 7;
    if (eye === 'circle') {
      const cx = (x + outer / 2).toFixed(3);
      const cy = (y + outer / 2).toFixed(3);
      return '<circle cx="' + cx + '" cy="' + cy + '" r="' + (outer / 2).toFixed(3) + '" fill="' + fill + '"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + (cell * 2.5).toFixed(3) + '" fill="var(--cb-bg, #fff)"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + (cell * 1.5).toFixed(3) + '" fill="' + fill + '"/>';
    }
    if (eye === 'rounded') {
      const ro = (cell * 1.15).toFixed(3);
      const ri = (cell * 0.7).toFixed(3);
      const rc = (cell * 0.55).toFixed(3);
      return '<rect x="' + x.toFixed(3) + '" y="' + y.toFixed(3) + '" width="' + outer.toFixed(3) +
        '" height="' + outer.toFixed(3) + '" rx="' + ro + '" fill="' + fill + '"/>' +
        '<rect x="' + (x + cell).toFixed(3) + '" y="' + (y + cell).toFixed(3) +
        '" width="' + (cell * 5).toFixed(3) + '" height="' + (cell * 5).toFixed(3) +
        '" rx="' + ri + '" fill="var(--cb-bg, #fff)"/>' +
        '<rect x="' + (x + cell * 2).toFixed(3) + '" y="' + (y + cell * 2).toFixed(3) +
        '" width="' + (cell * 3).toFixed(3) + '" height="' + (cell * 3).toFixed(3) +
        '" rx="' + rc + '" fill="' + fill + '"/>';
    }
    return '<rect x="' + x.toFixed(3) + '" y="' + y.toFixed(3) + '" width="' + outer.toFixed(3) +
      '" height="' + outer.toFixed(3) + '" fill="' + fill + '"/>' +
      '<rect x="' + (x + cell).toFixed(3) + '" y="' + (y + cell).toFixed(3) +
      '" width="' + (cell * 5).toFixed(3) + '" height="' + (cell * 5).toFixed(3) +
      '" fill="var(--cb-bg, #fff)"/>' +
      '<rect x="' + (x + cell * 2).toFixed(3) + '" y="' + (y + cell * 2).toFixed(3) +
      '" width="' + (cell * 3).toFixed(3) + '" height="' + (cell * 3).toFixed(3) +
      '" fill="' + fill + '"/>';
  }

  function drawCanvas(model, sizePx, quietModules, dark, light, style) {
    const count = model.getModuleCount();
    const totalModules = count + quietModules * 2;
    const cell = sizePx / totalModules;
    const overlap = Math.max(0.6, cell * 0.06);
    const shape = style.module || 'square';
    const eye = style.eye || 'square';
    const gradient = style.gradient || null;

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

    darkFill(ctx, sizePx, dark, gradient);
    finderOrigins(count).forEach(function (origin) {
      drawFinder(ctx, origin, cell, quietModules, eye, light);
      darkFill(ctx, sizePx, dark, gradient);
      drawFinderInner(ctx, origin, cell, quietModules, eye);
    });

    darkFill(ctx, sizePx, dark, gradient);
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (isFinder(row, col, count)) continue;
        if (model.isDark(row, col)) {
          const x = (col + quietModules) * cell;
          const y = (row + quietModules) * cell;
          drawModule(ctx, x, y, cell, overlap, shape);
        }
      }
    }
    return canvas;
  }

  function buildSvg(model, sizePx, quietModules, dark, light, style) {
    const count = model.getModuleCount();
    const totalModules = count + quietModules * 2;
    const cell = sizePx / totalModules;
    const overlap = Math.max(0.6, cell * 0.06);
    const shape = style.module || 'square';
    const eye = style.eye || 'square';
    const gradient = style.gradient || null;
    const fill = gradient ? 'url(#cb-qr-ink)' : dark;
    let body = '';
    if (gradient) body += svgGradient('cb-qr-ink', sizePx, gradient);
    const bg = light
      ? '<rect width="100%" height="100%" fill="' + light + '"/>'
      : '';
    const bgVar = light || 'transparent';
    body += bg;
    finderOrigins(count).forEach(function (origin) {
      body += finderSvg(origin, cell, quietModules, eye, fill)
        .replace(/var\(--cb-bg, #fff\)/g, bgVar);
    });
    let mods = '';
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (isFinder(row, col, count)) continue;
        if (model.isDark(row, col)) {
          const x = (col + quietModules) * cell;
          const y = (row + quietModules) * cell;
          mods += moduleSvg(x, y, cell, overlap, shape);
        }
      }
    }
    body += '<g fill="' + fill + '">' + mods + '</g>';
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + sizePx + '" height="' + sizePx +
      '" viewBox="0 0 ' + sizePx + ' ' + sizePx + '" shape-rendering="' +
      (shape === 'square' && eye === 'square' ? 'crispEdges' : 'geometricPrecision') + '">' +
      body + '</svg>';
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
      const style = {
        module: options.module || 'square',
        eye: options.eye || 'square',
        gradient: options.gradient || null
      };
      const model = buildModel(text, hasLogo);
      const canvas = drawCanvas(model, size, quiet, dark, light, style);
      const svg = buildSvg(model, size, quiet, dark, light, style);
      const bits = [];
      if (hasLogo) bits.push('logo on · EC:H');
      if (style.module !== 'square' || style.eye !== 'square') bits.push(style.module + '/' + style.eye);
      if (style.gradient) bits.push('gradient');
      return {
        canvas: canvas,
        svg: svg,
        extraStatus: bits.join(' · ')
      };
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
