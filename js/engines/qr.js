(function (global) {
  'use strict';

  const CB = global.CodesBared = global.CodesBared || {};
  CB.engines = CB.engines || {};

  const MODULE_IDS = ['square', 'rounded', 'dots', 'hearts', 'diamonds', 'clubs', 'spades', 'custom'];

  const BORDER_PRESETS = {
    square: { outer: 0, inner: 0 },
    rounded: { outer: 33, inner: 28 },
    circle: { outer: 100, inner: 100 }
  };

  // Suit outlines in a 100×100 box, bold enough to read at module size.
  const SUIT_PATHS = {
    hearts: 'M50 86C22 64 8 50 8 32C8 18 18 10 30 10C38 10 45 14 50 22C55 14 62 10 70 10C82 10 92 18 92 32C92 50 78 64 50 86Z',
    diamonds: 'M50 6L92 50L50 94L8 50Z',
    clubs: 'M50 8C40 8 32 16 32 26C32 31 34 35 37 38C27 40 20 49 20 59C20 70 29 79 41 79C45 79 49 77 52 75V86H38V92H62V86H48V75C51 77 55 79 59 79C71 79 80 70 80 59C80 49 73 40 63 38C66 35 68 31 68 26C68 16 60 8 50 8Z',
    spades: 'M50 4C78 32 92 46 92 60C92 71 83 78 72 78C65 78 59 75 55 70V86H68V92H32V86H45V70C41 75 35 78 28 78C17 78 8 71 8 60C8 46 22 32 50 4Z'
  };

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

  function clampPct(value) {
    const n = Number(value);
    if (!isFinite(n)) return 0;
    return Math.max(0, Math.min(100, n));
  }

  function borderPreset(id) {
    return BORDER_PRESETS[id] || BORDER_PRESETS.square;
  }

  function matchBorderPreset(outer, inner) {
    const o = clampPct(outer);
    const i = clampPct(inner);
    const ids = Object.keys(BORDER_PRESETS);
    for (let n = 0; n < ids.length; n++) {
      const preset = BORDER_PRESETS[ids[n]];
      if (Math.abs(preset.outer - o) <= 1 && Math.abs(preset.inner - i) <= 1) return ids[n];
    }
    return '';
  }

  function eyeRadii(cell, style) {
    return {
      outer: cell * 3.5 * (clampPct(style.eyeOuterR) / 100),
      inner: cell * 2.5 * (clampPct(style.eyeInnerR) / 100)
    };
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

  function escAttr(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;');
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    const rad = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    if (!rad) {
      ctx.rect(x, y, w, h);
      return;
    }
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  }

  function roundedRectD(x, y, w, h, r) {
    const rad = Math.max(0, Math.min(r, w / 2, h / 2));
    const fx = function (n) { return n.toFixed(3); };
    if (rad < 0.02) {
      return 'M' + fx(x) + ' ' + fx(y) + 'h' + fx(w) + 'v' + fx(h) + 'h' + fx(-w) + 'z';
    }
    return 'M' + fx(x + rad) + ' ' + fx(y) +
      'H' + fx(x + w - rad) +
      'A' + fx(rad) + ' ' + fx(rad) + ' 0 0 1 ' + fx(x + w) + ' ' + fx(y + rad) +
      'V' + fx(y + h - rad) +
      'A' + fx(rad) + ' ' + fx(rad) + ' 0 0 1 ' + fx(x + w - rad) + ' ' + fx(y + h) +
      'H' + fx(x + rad) +
      'A' + fx(rad) + ' ' + fx(rad) + ' 0 0 1 ' + fx(x) + ' ' + fx(y + h - rad) +
      'V' + fx(y + rad) +
      'A' + fx(rad) + ' ' + fx(rad) + ' 0 0 1 ' + fx(x + rad) + ' ' + fx(y) + 'z';
  }

  function modulePad(cell) {
    return cell * 0.06;
  }

  function drawSuit(ctx, x, y, cell, suit) {
    const d = SUIT_PATHS[suit];
    if (!d || typeof Path2D === 'undefined') {
      ctx.beginPath();
      ctx.arc(x + cell / 2, y + cell / 2, cell * 0.42, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    const pad = modulePad(cell);
    const s = (cell - pad * 2) / 100;
    ctx.save();
    ctx.translate(x + pad, y + pad);
    ctx.scale(s, s);
    ctx.fill(new Path2D(d));
    ctx.restore();
  }

  function drawCustom(ctx, x, y, cell, image) {
    if (!image) {
      ctx.beginPath();
      ctx.arc(x + cell / 2, y + cell / 2, cell * 0.42, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    const pad = modulePad(cell);
    ctx.drawImage(image, x + pad, y + pad, cell - pad * 2, cell - pad * 2);
  }

  function drawModule(ctx, x, y, cell, overlap, shape, style) {
    if (SUIT_PATHS[shape]) {
      drawSuit(ctx, x, y, cell, shape);
      return;
    }
    if (shape === 'custom') {
      drawCustom(ctx, x, y, cell, style.moduleImage);
      return;
    }
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

  function moduleSvgUse(x, y, cell, href) {
    const pad = modulePad(cell);
    const s = (cell - pad * 2) / 100;
    return '<use href="' + href + '" transform="translate(' +
      (x + pad).toFixed(3) + ' ' + (y + pad).toFixed(3) + ') scale(' + s.toFixed(4) + ')"/>';
  }

  function moduleSvg(x, y, cell, overlap, shape) {
    if (SUIT_PATHS[shape] || shape === 'custom') {
      return moduleSvgUse(x, y, cell, '#cb-qr-mod');
    }
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

  function moduleDefs(shape, style) {
    if (SUIT_PATHS[shape]) {
      return '<defs><path id="cb-qr-mod" d="' + SUIT_PATHS[shape] + '"/></defs>';
    }
    if (shape === 'custom' && style.moduleImageUrl) {
      return '<defs><image id="cb-qr-mod" width="100" height="100" href="' +
        escAttr(style.moduleImageUrl) + '" preserveAspectRatio="xMidYMid meet"/></defs>';
    }
    return '';
  }

  function punchInner(ctx, x, y, w, h, r, light) {
    if (light) {
      ctx.fillStyle = light;
      roundRectPath(ctx, x, y, w, h, r);
      ctx.fill();
      return;
    }
    ctx.globalCompositeOperation = 'destination-out';
    roundRectPath(ctx, x, y, w, h, r);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawFinderBorder(ctx, origin, cell, quiet, style, light) {
    const x = (origin.c + quiet) * cell;
    const y = (origin.r + quiet) * cell;
    const outer = cell * 7;
    const radii = eyeRadii(cell, style);
    roundRectPath(ctx, x, y, outer, outer, radii.outer);
    ctx.fill();
    punchInner(ctx, x + cell, y + cell, cell * 5, cell * 5, radii.inner, light);
  }

  function drawFinderCenter(ctx, origin, cell, quiet, center) {
    const x = (origin.c + quiet) * cell;
    const y = (origin.r + quiet) * cell;
    const cx = x + cell * 3.5;
    const cy = y + cell * 3.5;
    if (center === 'circle') {
      ctx.beginPath();
      ctx.arc(cx, cy, cell * 1.5, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    if (center === 'rounded') {
      roundRectPath(ctx, x + cell * 2, y + cell * 2, cell * 3, cell * 3, cell * 0.55);
      ctx.fill();
      return;
    }
    ctx.fillRect(x + cell * 2, y + cell * 2, cell * 3, cell * 3);
  }

  function finderSvg(origin, cell, quiet, style, fill) {
    const x = (origin.c + quiet) * cell;
    const y = (origin.r + quiet) * cell;
    const outer = cell * 7;
    const radii = eyeRadii(cell, style);
    const ring = '<path fill-rule="evenodd" fill="' + fill + '" d="' +
      roundedRectD(x, y, outer, outer, radii.outer) +
      roundedRectD(x + cell, y + cell, cell * 5, cell * 5, radii.inner) + '"/>';
    let pupil;
    if (style.eyeCenter === 'circle') {
      pupil = '<circle cx="' + (x + cell * 3.5).toFixed(3) + '" cy="' + (y + cell * 3.5).toFixed(3) +
        '" r="' + (cell * 1.5).toFixed(3) + '" fill="' + fill + '"/>';
    } else if (style.eyeCenter === 'rounded') {
      pupil = '<rect x="' + (x + cell * 2).toFixed(3) + '" y="' + (y + cell * 2).toFixed(3) +
        '" width="' + (cell * 3).toFixed(3) + '" height="' + (cell * 3).toFixed(3) +
        '" rx="' + (cell * 0.55).toFixed(3) + '" fill="' + fill + '"/>';
    } else {
      pupil = '<rect x="' + (x + cell * 2).toFixed(3) + '" y="' + (y + cell * 2).toFixed(3) +
        '" width="' + (cell * 3).toFixed(3) + '" height="' + (cell * 3).toFixed(3) +
        '" fill="' + fill + '"/>';
    }
    return ring + pupil;
  }

  function normalizeStyle(style) {
    const src = style || {};
    const border = src.eyeBorder || src.eye || 'square';
    const preset = borderPreset(border);
    const outer = src.eyeOuterR != null ? clampPct(src.eyeOuterR) : preset.outer;
    const inner = src.eyeInnerR != null ? clampPct(src.eyeInnerR) : preset.inner;
    return {
      module: src.module || 'square',
      eyeBorder: matchBorderPreset(outer, inner) || border,
      eyeCenter: src.eyeCenter || src.eye || 'square',
      eyeOuterR: outer,
      eyeInnerR: inner,
      moduleImage: src.moduleImage || null,
      moduleImageUrl: src.moduleImageUrl || null,
      gradient: src.gradient || null
    };
  }

  function isCrisp(style) {
    return style.module === 'square' &&
      style.eyeOuterR <= 1 &&
      style.eyeInnerR <= 1 &&
      style.eyeCenter === 'square';
  }

  function drawCanvas(model, sizePx, quietModules, dark, light, style) {
    const count = model.getModuleCount();
    const totalModules = count + quietModules * 2;
    const cell = sizePx / totalModules;
    const overlap = Math.max(0.6, cell * 0.06);
    const gradient = style.gradient;

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
      drawFinderBorder(ctx, origin, cell, quietModules, style, light);
      darkFill(ctx, sizePx, dark, gradient);
      drawFinderCenter(ctx, origin, cell, quietModules, style.eyeCenter);
    });

    darkFill(ctx, sizePx, dark, gradient);
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (isFinder(row, col, count)) continue;
        if (model.isDark(row, col)) {
          const x = (col + quietModules) * cell;
          const y = (row + quietModules) * cell;
          drawModule(ctx, x, y, cell, overlap, style.module, style);
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
    const gradient = style.gradient;
    const fill = gradient ? 'url(#cb-qr-ink)' : dark;
    let body = '';
    if (gradient) body += svgGradient('cb-qr-ink', sizePx, gradient);
    body += moduleDefs(style.module, style);
    const bg = light
      ? '<rect width="100%" height="100%" fill="' + light + '"/>'
      : '';
    body += bg;
    finderOrigins(count).forEach(function (origin) {
      body += finderSvg(origin, cell, quietModules, style, fill);
    });
    let mods = '';
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (isFinder(row, col, count)) continue;
        if (model.isDark(row, col)) {
          const x = (col + quietModules) * cell;
          const y = (row + quietModules) * cell;
          mods += moduleSvg(x, y, cell, overlap, style.module);
        }
      }
    }
    body += '<g fill="' + fill + '">' + mods + '</g>';
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + sizePx + '" height="' + sizePx +
      '" viewBox="0 0 ' + sizePx + ' ' + sizePx + '" shape-rendering="' +
      (isCrisp(style) ? 'crispEdges' : 'geometricPrecision') + '">' +
      body + '</svg>';
  }

  function extraStatus(style, hasLogo) {
    const bits = [];
    if (hasLogo) bits.push('logo on · EC:H');
    const fancyModule = style.module !== 'square';
    const fancyEye = style.eyeOuterR > 1 || style.eyeInnerR > 1 || style.eyeCenter !== 'square';
    if (fancyModule || fancyEye) {
      bits.push(style.module + ' · border ' + Math.round(style.eyeOuterR) + '/' +
        Math.round(style.eyeInnerR) + ' · ' + style.eyeCenter + ' center');
    }
    if (style.gradient) bits.push('gradient');
    return bits.join(' · ');
  }

  CB.engines.qr = {
    modules: MODULE_IDS,
    suits: SUIT_PATHS,
    borderPresets: BORDER_PRESETS,
    borderPreset: borderPreset,
    matchBorderPreset: matchBorderPreset,
    available: function () {
      return typeof QRCode !== 'undefined';
    },
    render: function (text, options) {
      const size = options.size;
      const quiet = options.quiet;
      const dark = options.dark;
      const light = options.transparent ? null : options.light;
      const hasLogo = !!options.logoDataUrl;
      const style = normalizeStyle(options);
      const model = buildModel(text, hasLogo);
      const canvas = drawCanvas(model, size, quiet, dark, light, style);
      const svg = buildSvg(model, size, quiet, dark, light, style);
      return {
        canvas: canvas,
        svg: svg,
        extraStatus: extraStatus(style, hasLogo)
      };
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
