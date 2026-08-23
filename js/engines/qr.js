(function (global) {
  'use strict';

  const CB = global.CodesBared = global.CodesBared || {};
  CB.engines = CB.engines || {};

  const MODULE_IDS = ['square', 'rounded', 'dots', 'smooth', 'hearts', 'diamonds', 'clubs', 'spades', 'custom'];

  const BORDER_PRESETS = {
    square: { outer: 0, inner: 0 },
    rounded: { outer: 33, inner: 28 },
    circle: { outer: 100, inner: 100 }
  };

  const CENTER_PRESETS = {
    square: 0,
    rounded: 37,
    dots: 100,
    circle: 100
  };

  // Suit outlines in a 100×100 box. Diamonds hit the edges so
  // neighboring tips touch. Clubs are three fat lobes, not a thin path.
  const SUIT_PATHS = {
    hearts: 'M50 96C6 66 0 40 6 22C12 8 26 2 40 8C45 11 48 16 50 22C52 16 55 11 60 8C74 2 88 8 94 22C100 40 94 66 50 96Z',
    diamonds: 'M50 -2L102 50L50 102L-2 50Z',
    spades: 'M50 1C92 34 100 52 96 70C92 84 78 90 66 82V96H74V100H26V96H34V82C22 90 8 84 4 70C0 52 8 34 50 1Z'
  };

  const SUIT_GROUPS = {
    clubs: [
      { kind: 'circle', cx: 50, cy: 32, r: 32 },
      { kind: 'circle', cx: 32, cy: 50, r: 32 },
      { kind: 'circle', cx: 68, cy: 50, r: 32 },
      { kind: 'path', d: 'M43 72L57 72L57 88L72 100L28 100L43 88Z' }
    ]
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

  function centerPreset(id) {
    return CENTER_PRESETS[id] != null ? CENTER_PRESETS[id] : CENTER_PRESETS.square;
  }

  function matchCenterPreset(value) {
    const n = clampPct(value);
    if (Math.abs(n - 0) <= 1) return 'square';
    if (Math.abs(n - CENTER_PRESETS.rounded) <= 1) return 'rounded';
    if (Math.abs(n - 100) <= 1) return 'dots';
    return '';
  }

  function mapCenterShape(id) {
    if (id === 'circle') return 'dots';
    return id || 'square';
  }

  function isSuitShape(id) {
    return !!(SUIT_PATHS[id] || SUIT_GROUPS[id]);
  }

  function isGeometricCenter(id) {
    const shape = mapCenterShape(id);
    return shape === 'square' || shape === 'rounded' || shape === 'dots';
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
    const x2 = gradient.dir === 'v' ? 0 : sizePx;
    const y2 = gradient.dir === 'h' ? 0 : sizePx;
    return '<defs><linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="' +
      x2 + '" y2="' + y2 + '">' +
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

  function clampCorners(w, h, corners) {
    let tl = Math.max(0, corners.tl || 0);
    let tr = Math.max(0, corners.tr || 0);
    let br = Math.max(0, corners.br || 0);
    let bl = Math.max(0, corners.bl || 0);
    const limit = function (a, b, max) {
      if (a + b <= max || !(a + b)) return [a, b];
      const s = max / (a + b);
      return [a * s, b * s];
    };
    const top = limit(tl, tr, w);
    tl = top[0];
    tr = top[1];
    const bot = limit(bl, br, w);
    bl = bot[0];
    br = bot[1];
    const left = limit(tl, bl, h);
    tl = left[0];
    bl = left[1];
    const right = limit(tr, br, h);
    tr = right[0];
    br = right[1];
    return { tl: tl, tr: tr, br: br, bl: bl };
  }

  function neighborDark(model, row, col, count) {
    return {
      n: row > 0 && model.isDark(row - 1, col),
      s: row < count - 1 && model.isDark(row + 1, col),
      w: col > 0 && model.isDark(row, col - 1),
      e: col < count - 1 && model.isDark(row, col + 1)
    };
  }

  // Outer-only rounding: a corner is rounded only when both of its
  // cardinal neighbors are empty. Isolated modules become circles,
  // runs become capsules, L turns stay sharp on the inside.
  function smoothCorners(neighbors, amount) {
    const r = clampPct(amount);
    const n = !!(neighbors && neighbors.n);
    const s = !!(neighbors && neighbors.s);
    const w = !!(neighbors && neighbors.w);
    const e = !!(neighbors && neighbors.e);
    return {
      tl: (!n && !w) ? r : 0,
      tr: (!n && !e) ? r : 0,
      br: (!s && !e) ? r : 0,
      bl: (!s && !w) ? r : 0
    };
  }

  function smoothPixelCorners(cell, neighbors, amount) {
    const pct = smoothCorners(neighbors, amount);
    const max = cell / 2;
    return {
      tl: max * (pct.tl / 100),
      tr: max * (pct.tr / 100),
      br: max * (pct.br / 100),
      bl: max * (pct.bl / 100)
    };
  }

  function smoothBox(x, y, cell, neighbors) {
    const pad = Math.max(0.25, cell * 0.02);
    const n = !!(neighbors && neighbors.n);
    const s = !!(neighbors && neighbors.s);
    const w = !!(neighbors && neighbors.w);
    const e = !!(neighbors && neighbors.e);
    return {
      x: w ? x - pad : x,
      y: n ? y - pad : y,
      w: cell + (w ? pad : 0) + (e ? pad : 0),
      h: cell + (n ? pad : 0) + (s ? pad : 0)
    };
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

  function roundRectCorners(ctx, x, y, w, h, corners) {
    const c = clampCorners(w, h, corners);
    ctx.beginPath();
    if (c.tl + c.tr + c.br + c.bl < 0.08) {
      ctx.rect(x, y, w, h);
      return;
    }
    ctx.moveTo(x + c.tl, y);
    ctx.lineTo(x + w - c.tr, y);
    if (c.tr > 0.02) ctx.arcTo(x + w, y, x + w, y + h, c.tr);
    else ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h - c.br);
    if (c.br > 0.02) ctx.arcTo(x + w, y + h, x, y + h, c.br);
    else ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + c.bl, y + h);
    if (c.bl > 0.02) ctx.arcTo(x, y + h, x, y, c.bl);
    else ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + c.tl);
    if (c.tl > 0.02) ctx.arcTo(x, y, x + w, y, c.tl);
    else ctx.lineTo(x, y);
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

  function roundedRectCornersD(x, y, w, h, corners) {
    const c = clampCorners(w, h, corners);
    const fx = function (n) { return n.toFixed(3); };
    if (c.tl + c.tr + c.br + c.bl < 0.08) {
      return 'M' + fx(x) + ' ' + fx(y) + 'h' + fx(w) + 'v' + fx(h) + 'h' + fx(-w) + 'z';
    }
    return 'M' + fx(x + c.tl) + ' ' + fx(y) +
      'H' + fx(x + w - c.tr) +
      (c.tr > 0.02
        ? 'A' + fx(c.tr) + ' ' + fx(c.tr) + ' 0 0 1 ' + fx(x + w) + ' ' + fx(y + c.tr)
        : 'H' + fx(x + w)) +
      'V' + fx(y + h - c.br) +
      (c.br > 0.02
        ? 'A' + fx(c.br) + ' ' + fx(c.br) + ' 0 0 1 ' + fx(x + w - c.br) + ' ' + fx(y + h)
        : 'V' + fx(y + h)) +
      'H' + fx(x + c.bl) +
      (c.bl > 0.02
        ? 'A' + fx(c.bl) + ' ' + fx(c.bl) + ' 0 0 1 ' + fx(x) + ' ' + fx(y + h - c.bl)
        : 'H' + fx(x)) +
      'V' + fx(y + c.tl) +
      (c.tl > 0.02
        ? 'A' + fx(c.tl) + ' ' + fx(c.tl) + ' 0 0 1 ' + fx(x + c.tl) + ' ' + fx(y)
        : 'V' + fx(y)) +
      'z';
  }

  function modulePad(cell) {
    return cell * 0.06;
  }

  function drawSuitPart(ctx, part) {
    if (part.kind === 'circle') {
      ctx.beginPath();
      ctx.arc(part.cx, part.cy, part.r, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    if (part.d && typeof Path2D !== 'undefined') {
      ctx.fill(new Path2D(part.d));
    }
  }

  function drawSuit(ctx, x, y, cell, suit) {
    const group = SUIT_GROUPS[suit];
    const d = SUIT_PATHS[suit];
    if (!group && (!d || typeof Path2D === 'undefined')) {
      ctx.beginPath();
      ctx.arc(x + cell / 2, y + cell / 2, cell * 0.42, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    const s = cell / 100;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    if (group) {
      group.forEach(function (part) { drawSuitPart(ctx, part); });
    } else {
      ctx.fill(new Path2D(d));
    }
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

  function drawModule(ctx, x, y, cell, overlap, shape, style, neighbors) {
    if (SUIT_PATHS[shape] || SUIT_GROUPS[shape]) {
      drawSuit(ctx, x, y, cell, shape);
      return;
    }
    if (shape === 'custom') {
      drawCustom(ctx, x, y, cell, style.moduleImage);
      return;
    }
    if (shape === 'smooth') {
      const box = smoothBox(x, y, cell, neighbors);
      roundRectCorners(ctx, box.x, box.y, box.w, box.h, smoothPixelCorners(cell, neighbors, style.moduleR));
      ctx.fill();
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

  function moduleSvgUse(x, y, cell, href, padded) {
    const pad = padded ? modulePad(cell) : 0;
    const s = (cell - pad * 2) / 100;
    return '<use href="' + href + '" transform="translate(' +
      (x + pad).toFixed(3) + ' ' + (y + pad).toFixed(3) + ') scale(' + s.toFixed(4) + ')"/>';
  }

  function moduleSvg(x, y, cell, overlap, shape, style, neighbors) {
    if (SUIT_PATHS[shape] || SUIT_GROUPS[shape] || shape === 'custom') {
      return moduleSvgUse(x, y, cell, '#cb-qr-mod', shape === 'custom');
    }
    if (shape === 'smooth') {
      const box = smoothBox(x, y, cell, neighbors);
      return '<path d="' +
        roundedRectCornersD(box.x, box.y, box.w, box.h, smoothPixelCorners(cell, neighbors, style.moduleR)) +
        '"/>';
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

  function suitGroupSvg(parts) {
    return parts.map(function (part) {
      if (part.kind === 'circle') {
        return '<circle cx="' + part.cx + '" cy="' + part.cy + '" r="' + part.r + '"/>';
      }
      return '<path d="' + part.d + '"/>';
    }).join('');
  }

  function shapeDef(shape, style, id) {
    if (SUIT_GROUPS[shape]) {
      return '<g id="' + id + '">' + suitGroupSvg(SUIT_GROUPS[shape]) + '</g>';
    }
    if (SUIT_PATHS[shape]) {
      return '<path id="' + id + '" d="' + SUIT_PATHS[shape] + '"/>';
    }
    if (shape === 'custom' && style.moduleImageUrl) {
      return '<image id="' + id + '" width="100" height="100" href="' +
        escAttr(style.moduleImageUrl) + '" preserveAspectRatio="xMidYMid meet"/>';
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

  function centerRadius(cell, style) {
    return cell * 1.5 * (clampPct(style.eyeCenterR) / 100);
  }

  function pupilHref(style) {
    if (style.eyeCenter === style.module && (isSuitShape(style.module) || style.module === 'custom')) {
      return '#cb-qr-mod';
    }
    return '#cb-qr-pupil';
  }

  function drawFinderCenter(ctx, origin, cell, quiet, style) {
    const x = (origin.c + quiet) * cell + cell * 2;
    const y = (origin.r + quiet) * cell + cell * 2;
    const size = cell * 3;
    const shape = style.eyeCenter;
    if (isSuitShape(shape)) {
      drawSuit(ctx, x, y, size, shape);
      return;
    }
    if (shape === 'custom') {
      drawCustom(ctx, x, y, size, style.moduleImage);
      return;
    }
    roundRectPath(ctx, x, y, size, size, centerRadius(cell, style));
    ctx.fill();
  }

  function finderSvg(origin, cell, quiet, style) {
    const x = (origin.c + quiet) * cell;
    const y = (origin.r + quiet) * cell;
    const outer = cell * 7;
    const radii = eyeRadii(cell, style);
    const ring = '<path fill-rule="evenodd" d="' +
      roundedRectD(x, y, outer, outer, radii.outer) +
      roundedRectD(x + cell, y + cell, cell * 5, cell * 5, radii.inner) + '"/>';
    const px = x + cell * 2;
    const py = y + cell * 2;
    const size = cell * 3;
    let pupil;
    if (isSuitShape(style.eyeCenter) || style.eyeCenter === 'custom') {
      pupil = moduleSvgUse(px, py, size, pupilHref(style), style.eyeCenter === 'custom');
    } else {
      pupil = '<rect x="' + px.toFixed(3) + '" y="' + py.toFixed(3) +
        '" width="' + size.toFixed(3) + '" height="' + size.toFixed(3) +
        '" rx="' + centerRadius(cell, style).toFixed(3) + '"/>';
    }
    return ring + pupil;
  }

  function normalizeStyle(style) {
    const src = style || {};
    const border = src.eyeBorder || src.eye || 'square';
    const center = mapCenterShape(src.eyeCenter || src.eye || 'square');
    const preset = borderPreset(border);
    const outer = src.eyeOuterR != null ? clampPct(src.eyeOuterR) : preset.outer;
    const inner = src.eyeInnerR != null ? clampPct(src.eyeInnerR) : preset.inner;
    const geometric = isGeometricCenter(center);
    const centerR = src.eyeCenterR != null && geometric
      ? clampPct(src.eyeCenterR)
      : (geometric ? centerPreset(center) : 0);
    return {
      module: src.module || 'square',
      moduleR: src.moduleR != null ? clampPct(src.moduleR) : 80,
      eyeBorder: matchBorderPreset(outer, inner) || border,
      eyeCenter: center,
      eyeOuterR: outer,
      eyeInnerR: inner,
      eyeCenterR: centerR,
      moduleImage: src.moduleImage || null,
      moduleImageUrl: src.moduleImageUrl || null,
      gradient: src.gradient || null
    };
  }

  function isCrisp(style) {
    return style.module === 'square' &&
      style.eyeOuterR <= 1 &&
      style.eyeInnerR <= 1 &&
      style.eyeCenter === 'square' &&
      style.eyeCenterR <= 1;
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
      drawFinderCenter(ctx, origin, cell, quietModules, style);
    });

    darkFill(ctx, sizePx, dark, gradient);
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (isFinder(row, col, count)) continue;
        if (model.isDark(row, col)) {
          const x = (col + quietModules) * cell;
          const y = (row + quietModules) * cell;
          drawModule(ctx, x, y, cell, overlap, style.module, style, neighborDark(model, row, col, count));
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
    let defs = '';
    if (gradient) defs += svgGradient('cb-qr-ink', sizePx, gradient).replace(/^<defs>|<\/defs>$/g, '');
    defs += shapeDef(style.module, style, 'cb-qr-mod');
    if (isSuitShape(style.eyeCenter) || style.eyeCenter === 'custom') {
      if (pupilHref(style) === '#cb-qr-pupil') {
        defs += shapeDef(style.eyeCenter, style, 'cb-qr-pupil');
      }
    }
    let finders = '';
    finderOrigins(count).forEach(function (origin) {
      finders += finderSvg(origin, cell, quietModules, style);
    });
    let mods = '';
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (isFinder(row, col, count)) continue;
        if (model.isDark(row, col)) {
          const x = (col + quietModules) * cell;
          const y = (row + quietModules) * cell;
          mods += moduleSvg(x, y, cell, overlap, style.module, style, neighborDark(model, row, col, count));
        }
      }
    }
    const ink = finders + mods;
    const bg = light
      ? '<rect width="100%" height="100%" fill="' + light + '"/>'
      : '';
    let painted;
    if (gradient) {
      defs += '<mask id="cb-qr-mask" maskUnits="userSpaceOnUse">' +
        '<rect width="' + sizePx + '" height="' + sizePx + '" fill="#000"/>' +
        '<g fill="#fff">' + ink + '</g></mask>';
      painted = '<rect width="' + sizePx + '" height="' + sizePx +
        '" fill="url(#cb-qr-ink)" mask="url(#cb-qr-mask)"/>';
    } else {
      painted = '<g fill="' + dark + '">' + ink + '</g>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + sizePx + '" height="' + sizePx +
      '" viewBox="0 0 ' + sizePx + ' ' + sizePx + '" shape-rendering="' +
      (isCrisp(style) ? 'crispEdges' : 'geometricPrecision') + '">' +
      (defs ? '<defs>' + defs + '</defs>' : '') + bg + painted + '</svg>';
  }

  function extraStatus(style, hasLogo) {
    const bits = [];
    if (hasLogo) bits.push('logo on · EC:H');
    const fancyModule = style.module !== 'square';
    const fancyEye = style.eyeOuterR > 1 || style.eyeInnerR > 1 ||
      style.eyeCenter !== 'square' || style.eyeCenterR > 1;
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
    suitGroups: SUIT_GROUPS,
    borderPresets: BORDER_PRESETS,
    centerPresets: CENTER_PRESETS,
    borderPreset: borderPreset,
    centerPreset: centerPreset,
    matchBorderPreset: matchBorderPreset,
    matchCenterPreset: matchCenterPreset,
    mapCenterShape: mapCenterShape,
    isGeometricCenter: isGeometricCenter,
    smoothCorners: smoothCorners,
    svgGradient: svgGradient,
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
