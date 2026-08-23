(function (global) {
  'use strict';

  const CB = global.CodesBared = global.CodesBared || {};
  CB.engines = CB.engines || {};

  const STAMP_LIST = [
    { id: 'hearts', label: 'Hearts' },
    { id: 'diamonds', label: 'Diamonds' },
    { id: 'clubs', label: 'Clubs' },
    { id: 'spades', label: 'Spades' },
    { id: 'plus', label: 'Plus' },
    { id: 'hexagon', label: 'Hexagon' },
    { id: 'tile', label: 'Tile' },
    { id: 'star', label: 'Star' },
    { id: 'arrow', label: 'Arrow' },
    { id: 'droplet', label: 'Droplet' },
    { id: 'leaf', label: 'Leaf' },
    { id: 'flame', label: 'Flame' },
    { id: 'crown', label: 'Crown' },
    { id: 'bell', label: 'Bell' },
    { id: 'lock', label: 'Lock' },
    { id: 'shield', label: 'Shield' },
    { id: 'house', label: 'House' },
    { id: 'mushroom', label: 'Mushroom' },
    { id: 'skull', label: 'Skull' },
    { id: 'ghost', label: 'Ghost' },
    { id: 'flower', label: 'Flower' },
    { id: 'bird', label: 'Bird' },
    { id: 'fish', label: 'Fish' },
    { id: 'cat', label: 'Cat' },
    { id: 'rabbit', label: 'Rabbit' },
    { id: 'apple', label: 'Apple' },
    { id: 'banana', label: 'Banana' },
    { id: 'pear', label: 'Pear' },
    { id: 'orange', label: 'Orange' },
    { id: 'lemon', label: 'Lemon' },
    { id: 'mango', label: 'Mango' },
    { id: 'peach', label: 'Peach' },
    { id: 'berries', label: 'Berries' },
    { id: 'durian', label: 'Durian' }
  ];
  const STAMP_IDS = STAMP_LIST.map(function (item) { return item.id; });
  const MODULE_IDS = ['square', 'rounded', 'dots', 'smooth'].concat(STAMP_IDS, ['custom']);

  const STAMP_HEADINGS = {
    hearts: 90,
    clubs: 90,
    droplet: 90,
    shield: 90,
    arrow: -90,
    fish: 0,
    bird: 0,
    banana: 0
  };

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
    spades: 'M50 1C92 34 100 52 96 70C92 84 78 90 66 82V96H74V100H26V96H34V82C22 90 8 84 4 70C0 52 8 34 50 1Z',
    plus: 'M36 4H64V36H96V64H64V96H36V64H4V36H36Z',
    hexagon: 'M50.0 2.0L91.6 26.0L91.6 74.0L50.0 98.0L8.4 74.0L8.4 26.0Z',
    tile: 'M12 12H88V88H12Z',
    star: 'M50.0 0.0L61.8 33.8L97.6 34.5L69.0 56.2L79.4 90.5L50.0 70.0L20.6 90.5L31.0 56.2L2.4 34.5L38.2 33.8Z',
    arrow: 'M50 2L96 50H68V98H32V50H4Z',
    droplet: 'M50 4C78 36 94 56 94 74C94 90 74 98 50 98C26 98 6 90 6 74C6 56 22 36 50 4Z',
    leaf: 'M50 4C84 16 96 50 78 80C66 96 50 88 50 88C50 88 34 96 22 80C4 50 16 16 50 4Z',
    flame: 'M50 2C70 28 86 42 86 68C86 90 68 100 50 90C32 100 14 90 14 68C14 42 30 28 50 2Z',
    crown: 'M8 38L26 54L50 12L74 54L92 38V88H8Z',
    bell: 'M38 8C38 4 62 4 62 8C78 14 82 36 82 52L94 74H6L18 52C18 36 22 14 38 8ZM42 78H58C58 88 54 94 50 94C46 94 42 88 42 78Z',
    lock: 'M34 44V28C34 14 66 14 66 28V44H82V96H18V44H34Z',
    shield: 'M50 4L94 22V48C94 76 70 92 50 98C30 92 6 76 6 48V22Z',
    house: 'M50 4L98 50H84V96H16V50H2Z',
    mushroom: 'M8 52C8 20 92 20 92 52H62V96H38V52H8Z',
    skull: 'M50 4C80 4 94 24 94 48C94 62 86 70 80 74L84 92H16L20 74C14 70 6 62 6 48C6 24 20 4 50 4Z',
    ghost: 'M50 6C78 6 88 28 88 52V80L76 70L64 86L50 74L36 86L24 70L12 80V52C12 28 22 6 50 6Z',
    bird: 'M10 60C10 36 40 22 64 32L94 18L80 42C92 50 90 66 76 70L92 88L64 74C40 86 8 82 10 60Z',
    fish: 'M94 50C86 26 50 18 26 40L2 20L14 50L2 80L26 60C50 82 86 74 94 50Z',
    cat: 'M20 8L38 28C28 32 16 48 16 64C16 86 32 98 50 98C68 98 84 86 84 64C84 48 72 32 62 28L80 8L64 26C56 22 44 22 36 26Z',
    rabbit: 'M32 4C24 4 22 36 32 52C24 56 14 68 16 84C20 98 80 98 84 84C86 68 76 56 68 52C78 36 76 4 68 4C58 4 54 36 50 50C46 36 42 4 32 4Z',
    apple: 'M50 20C24 18 8 44 12 70C16 96 38 102 50 90C62 102 84 96 88 70C92 44 76 18 50 20C52 12 52 4 44 6C50 0 58 4 54 8C52 12 52 18 50 20Z',
    banana: 'M8 24C28 4 72 8 92 36C98 48 90 58 80 52C72 72 48 90 20 86C6 70 2 42 8 24Z',
    pear: 'M50 6C64 6 70 20 66 36C84 44 92 66 84 84C76 100 24 100 16 84C8 66 16 44 34 36C30 20 36 6 50 6Z',
    orange: 'M50 20C80 20 96 42 96 66C96 90 76 100 50 100C24 100 4 90 4 66C4 42 20 20 50 20ZM58 8C68 2 84 12 74 22H62C60 14 58 8 58 8Z',
    lemon: 'M50 4C70 8 94 28 96 50C94 72 70 92 50 96C30 92 6 72 4 50C6 28 30 8 50 4Z',
    mango: 'M24 14C42 2 80 8 92 36C98 56 88 86 64 94C38 100 8 78 12 50C14 32 18 20 24 14Z',
    peach: 'M50 16C26 6 4 34 10 62C16 90 38 100 50 84C62 100 84 90 90 62C96 34 74 6 50 16Z',
    durian: 'M50.0 6.0L58.3 21.1L73.0 12.2L72.6 29.4L89.8 29.0L80.9 43.7L96.0 52.0L80.9 60.3L89.8 75.0L72.6 74.6L73.0 91.8L58.3 82.9L50.0 98.0L41.7 82.9L27.0 91.8L27.4 74.6L10.2 75.0L19.1 60.3L4.0 52.0L19.1 43.7L10.2 29.0L27.4 29.4L27.0 12.2L41.7 21.1Z'
  };

  const SUIT_GROUPS = {
    clubs: [
      { kind: 'circle', cx: 50, cy: 32, r: 32 },
      { kind: 'circle', cx: 32, cy: 50, r: 32 },
      { kind: 'circle', cx: 68, cy: 50, r: 32 },
      { kind: 'path', d: 'M43 72L57 72L57 88L72 100L28 100L43 88Z' }
    ],
    flower: [
      { kind: 'circle', cx: 50, cy: 26, r: 20 },
      { kind: 'circle', cx: 74, cy: 44, r: 20 },
      { kind: 'circle', cx: 65, cy: 72, r: 20 },
      { kind: 'circle', cx: 35, cy: 72, r: 20 },
      { kind: 'circle', cx: 26, cy: 44, r: 20 },
      { kind: 'circle', cx: 50, cy: 50, r: 16 }
    ],
    berries: [
      { kind: 'circle', cx: 38, cy: 44, r: 20 },
      { kind: 'circle', cx: 64, cy: 42, r: 20 },
      { kind: 'circle', cx: 34, cy: 70, r: 20 },
      { kind: 'circle', cx: 60, cy: 72, r: 20 },
      { kind: 'circle', cx: 76, cy: 62, r: 16 },
      { kind: 'path', d: 'M47 2H53V30L64 10L53 32H47L36 10L47 30Z' }
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

  function clampDeg(value) {
    const n = Number(value);
    if (!isFinite(n)) return 0;
    let d = n % 360;
    if (d < 0) d += 360;
    return d;
  }

  function clampRange(value, min, max, fallback) {
    const n = Number(value);
    if (!isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  function clampModuleScale(value) {
    return clampRange(value, 70, 110, 100);
  }

  function clampCenterScale(value) {
    return clampRange(value, 70, 120, 100);
  }

  function clampRing(value) {
    return clampRange(value, 50, 160, 100);
  }

  function layoutModule(x, y, cell, style) {
    const scale = clampModuleScale(style && style.moduleScale) / 100;
    if (Math.abs(scale - 1) < 0.005) {
      return { x: x, y: y, cell: cell, overlap: Math.max(0.6, cell * 0.06) };
    }
    const size = cell * scale;
    return {
      x: x + (cell - size) / 2,
      y: y + (cell - size) / 2,
      cell: size,
      overlap: scale > 1 ? Math.max(0.6, cell * 0.06) : 0
    };
  }

  function finderLayout(origin, cell, quiet, style) {
    const x = (origin.c + quiet) * cell;
    const y = (origin.r + quiet) * cell;
    const outer = cell * 7;
    const thick = cell * (clampRing(style && style.eyeRing) / 100);
    const hole = Math.max(cell * 2.4, outer - thick * 2);
    const wanted = cell * 3 * (clampCenterScale(style && style.eyeCenterScale) / 100);
    const pupil = Math.min(wanted, Math.max(cell * 1.6, hole - cell * 0.35));
    return {
      x: x,
      y: y,
      outer: outer,
      hole: hole,
      thick: thick,
      holeX: x + (outer - hole) / 2,
      holeY: y + (outer - hole) / 2,
      pupil: pupil,
      pupilX: x + (outer - pupil) / 2,
      pupilY: y + (outer - pupil) / 2,
      outerR: (outer / 2) * (clampPct(style && style.eyeOuterR) / 100),
      innerR: (hole / 2) * (clampPct(style && style.eyeInnerR) / 100),
      pupilR: (pupil / 2) * (clampPct(style && style.eyeCenterR) / 100)
    };
  }

  function canOrient(shape) {
    return shape !== 'dots' && shape !== 'smooth';
  }

  // Direction the stamp already faces in its 100×100 box.
  // Canvas/SVG: 0° is right, 90° is down.
  function naturalHeading(shape) {
    if (STAMP_HEADINGS[shape] != null) return STAMP_HEADINGS[shape];
    return -90;
  }

  function rotFit(deg) {
    const r = (deg || 0) * Math.PI / 180;
    const span = Math.abs(Math.cos(r)) + Math.abs(Math.sin(r));
    return span > 0.001 ? 1 / span : 1;
  }

  function moduleRotation(row, col, count, style) {
    const extra = clampDeg(style && style.moduleRot);
    const aim = style && style.moduleAim;
    if (aim !== 'rotate' && aim !== 'converge') return 0;
    if (aim !== 'converge') return extra;
    const cx = col + 0.5;
    const cy = row + 0.5;
    const tx = (clampPct(style.aimX != null ? style.aimX : 50) / 100) * count;
    const ty = (clampPct(style.aimY != null ? style.aimY : 50) / 100) * count;
    const dx = tx - cx;
    const dy = ty - cy;
    if (dx === 0 && dy === 0) return extra;
    const face = Math.atan2(dy, dx) * 180 / Math.PI;
    return face - naturalHeading(style.module) + extra;
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

  function gradientAngle(gradient) {
    if (gradient && gradient.angle != null && isFinite(Number(gradient.angle))) {
      return clampDeg(gradient.angle);
    }
    if (gradient && gradient.dir === 'h') return 0;
    if (gradient && gradient.dir === 'v') return 90;
    return 45;
  }

  function gradientEnds(sizePx, angle) {
    const a = (Number(angle) || 0) * Math.PI / 180;
    const cx = sizePx / 2;
    const cy = sizePx / 2;
    const r = sizePx * 0.5 * Math.SQRT2;
    return {
      x1: cx - r * Math.cos(a),
      y1: cy - r * Math.sin(a),
      x2: cx + r * Math.cos(a),
      y2: cy + r * Math.sin(a)
    };
  }

  function darkFill(ctx, sizePx, dark, gradient) {
    if (gradient && gradient.from && gradient.to) {
      const ends = gradientEnds(sizePx, gradientAngle(gradient));
      const g = ctx.createLinearGradient(ends.x1, ends.y1, ends.x2, ends.y2);
      g.addColorStop(0, gradient.from);
      g.addColorStop(1, gradient.to);
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = dark;
    }
  }

  function svgGradient(id, sizePx, gradient) {
    const ends = gradientEnds(sizePx, gradientAngle(gradient));
    const fx = function (n) { return n.toFixed(3); };
    return '<defs><linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' +
      fx(ends.x1) + '" y1="' + fx(ends.y1) + '" x2="' + fx(ends.x2) + '" y2="' + fx(ends.y2) + '">' +
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

  function withModuleOrient(ctx, x, y, cell, deg, fit, paint) {
    if (!deg && fit === 1) {
      paint(x, y, cell);
      return;
    }
    ctx.save();
    ctx.translate(x + cell / 2, y + cell / 2);
    if (deg) ctx.rotate(deg * Math.PI / 180);
    if (fit !== 1) ctx.scale(fit, fit);
    ctx.translate(-cell / 2, -cell / 2);
    paint(0, 0, cell);
    ctx.restore();
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

  function drawModule(ctx, x, y, cell, overlap, shape, style, neighbors, deg) {
    const rot = deg || 0;
    const stamp = isSuitShape(shape) || shape === 'custom';
    const geo = shape === 'square' || shape === 'rounded';
    const fit = geo && rot ? rotFit(rot) : 1;
    const bleed = rot ? 0 : overlap;
    const paint = function (dx, dy, c) {
      if (SUIT_PATHS[shape] || SUIT_GROUPS[shape]) {
        drawSuit(ctx, dx, dy, c, shape);
        return;
      }
      if (shape === 'custom') {
        drawCustom(ctx, dx, dy, c, style.moduleImage);
        return;
      }
      if (shape === 'smooth') {
        const box = smoothBox(dx, dy, c, neighbors);
        roundRectCorners(ctx, box.x, box.y, box.w, box.h, smoothPixelCorners(c, neighbors, style.moduleR));
        ctx.fill();
        return;
      }
      if (shape === 'dots') {
        ctx.beginPath();
        ctx.arc(dx + c / 2, dy + c / 2, c * 0.42, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      if (shape === 'rounded') {
        roundRectPath(ctx, dx, dy, c + bleed * 0.2, c + bleed * 0.2, c * 0.32);
        ctx.fill();
        return;
      }
      ctx.fillRect(dx, dy, c + bleed, c + bleed);
    };
    if ((stamp || geo) && (rot || fit !== 1)) {
      withModuleOrient(ctx, x, y, cell, rot, fit, paint);
      return;
    }
    paint(x, y, cell);
  }

  function moduleSvgUse(x, y, cell, href, padded, deg) {
    const pad = padded ? modulePad(cell) : 0;
    const s = (cell - pad * 2) / 100;
    if (!deg) {
      return '<use href="' + href + '" transform="translate(' +
        (x + pad).toFixed(3) + ' ' + (y + pad).toFixed(3) + ') scale(' + s.toFixed(4) + ')"/>';
    }
    const cx = x + cell / 2;
    const cy = y + cell / 2;
    return '<use href="' + href + '" transform="translate(' +
      cx.toFixed(3) + ' ' + cy.toFixed(3) + ') rotate(' + deg.toFixed(3) +
      ') scale(' + s.toFixed(4) + ') translate(-50 -50)"/>';
  }

  function svgOrient(x, y, cell, deg, fit, inner) {
    if (!deg && fit === 1) return inner(x, y);
    const cx = x + cell / 2;
    const cy = y + cell / 2;
    return '<g transform="translate(' + cx.toFixed(3) + ' ' + cy.toFixed(3) +
      ') rotate(' + (deg || 0).toFixed(3) + ') scale(' + fit.toFixed(4) +
      ') translate(' + (-cell / 2).toFixed(3) + ' ' + (-cell / 2).toFixed(3) + ')">' +
      inner(0, 0) + '</g>';
  }

  function moduleSvg(x, y, cell, overlap, shape, style, neighbors, deg) {
    const rot = deg || 0;
    if (SUIT_PATHS[shape] || SUIT_GROUPS[shape] || shape === 'custom') {
      return moduleSvgUse(x, y, cell, '#cb-qr-mod', shape === 'custom', rot);
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
    const bleed = rot ? 0 : overlap;
    const fit = rot ? rotFit(rot) : 1;
    if (shape === 'rounded') {
      const r = (cell * 0.32).toFixed(3);
      return svgOrient(x, y, cell, rot, fit, function (dx, dy) {
        return '<rect x="' + dx.toFixed(3) + '" y="' + dy.toFixed(3) +
          '" width="' + (cell + bleed * 0.2).toFixed(3) +
          '" height="' + (cell + bleed * 0.2).toFixed(3) +
          '" rx="' + r + '" ry="' + r + '"/>';
      });
    }
    return svgOrient(x, y, cell, rot, fit, function (dx, dy) {
      return '<rect x="' + dx.toFixed(3) + '" y="' + dy.toFixed(3) +
        '" width="' + (cell + bleed).toFixed(3) +
        '" height="' + (cell + bleed).toFixed(3) + '"/>';
    });
  }

  function suitGroupSvg(parts) {
    return parts.map(function (part) {
      if (part.kind === 'circle') {
        return '<circle cx="' + part.cx + '" cy="' + part.cy + '" r="' + part.r + '"/>';
      }
      return '<path d="' + part.d + '"/>';
    }).join('');
  }

  function stampIcon(id) {
    const inner = SUIT_GROUPS[id]
      ? suitGroupSvg(SUIT_GROUPS[id])
      : (SUIT_PATHS[id] ? '<path d="' + SUIT_PATHS[id] + '"/>' : '');
    if (!inner) return '';
    return '<svg viewBox="0 0 100 100" aria-hidden="true">' + inner + '</svg>';
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
    const box = finderLayout(origin, cell, quiet, style);
    roundRectPath(ctx, box.x, box.y, box.outer, box.outer, box.outerR);
    ctx.fill();
    punchInner(ctx, box.holeX, box.holeY, box.hole, box.hole, box.innerR, light);
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
    const box = finderLayout(origin, cell, quiet, style);
    const shape = style.eyeCenter;
    if (isSuitShape(shape)) {
      drawSuit(ctx, box.pupilX, box.pupilY, box.pupil, shape);
      return;
    }
    if (shape === 'custom') {
      drawCustom(ctx, box.pupilX, box.pupilY, box.pupil, style.moduleImage);
      return;
    }
    roundRectPath(ctx, box.pupilX, box.pupilY, box.pupil, box.pupil, box.pupilR);
    ctx.fill();
  }

  function finderSvg(origin, cell, quiet, style) {
    const box = finderLayout(origin, cell, quiet, style);
    const ring = '<path fill-rule="evenodd" d="' +
      roundedRectD(box.x, box.y, box.outer, box.outer, box.outerR) +
      roundedRectD(box.holeX, box.holeY, box.hole, box.hole, box.innerR) + '"/>';
    let pupil;
    if (isSuitShape(style.eyeCenter) || style.eyeCenter === 'custom') {
      pupil = moduleSvgUse(box.pupilX, box.pupilY, box.pupil, pupilHref(style), style.eyeCenter === 'custom');
    } else {
      pupil = '<rect x="' + box.pupilX.toFixed(3) + '" y="' + box.pupilY.toFixed(3) +
        '" width="' + box.pupil.toFixed(3) + '" height="' + box.pupil.toFixed(3) +
        '" rx="' + box.pupilR.toFixed(3) + '"/>';
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
    const aim = src.moduleAim === 'rotate' || src.moduleAim === 'converge' ? src.moduleAim : 'none';
    return {
      module: src.module || 'square',
      moduleR: src.moduleR != null ? clampPct(src.moduleR) : 80,
      moduleScale: clampModuleScale(src.moduleScale),
      moduleAim: aim,
      moduleRot: clampDeg(src.moduleRot),
      aimX: src.aimX != null ? clampPct(src.aimX) : 50,
      aimY: src.aimY != null ? clampPct(src.aimY) : 50,
      eyeBorder: matchBorderPreset(outer, inner) || border,
      eyeCenter: center,
      eyeOuterR: outer,
      eyeInnerR: inner,
      eyeCenterR: centerR,
      eyeCenterScale: clampCenterScale(src.eyeCenterScale),
      eyeRing: clampRing(src.eyeRing),
      moduleImage: src.moduleImage || null,
      moduleImageUrl: src.moduleImageUrl || null,
      gradient: src.gradient || null
    };
  }

  function isOriented(style) {
    return canOrient(style.module) && (
      style.moduleAim === 'converge' ||
      (style.moduleAim === 'rotate' && style.moduleRot)
    );
  }

  function isCrisp(style) {
    return style.module === 'square' &&
      style.eyeOuterR <= 1 &&
      style.eyeInnerR <= 1 &&
      style.eyeCenter === 'square' &&
      style.eyeCenterR <= 1 &&
      Math.abs(style.moduleScale - 100) <= 1 &&
      Math.abs(style.eyeCenterScale - 100) <= 1 &&
      Math.abs(style.eyeRing - 100) <= 1 &&
      !isOriented(style);
  }

  function drawCanvas(model, sizePx, quietModules, dark, light, style) {
    const count = model.getModuleCount();
    const totalModules = count + quietModules * 2;
    const cell = sizePx / totalModules;
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
          const laid = layoutModule((col + quietModules) * cell, (row + quietModules) * cell, cell, style);
          drawModule(
            ctx, laid.x, laid.y, laid.cell, laid.overlap, style.module, style,
            neighborDark(model, row, col, count),
            canOrient(style.module) ? moduleRotation(row, col, count, style) : 0
          );
        }
      }
    }
    return canvas;
  }

  function buildSvg(model, sizePx, quietModules, dark, light, style) {
    const count = model.getModuleCount();
    const totalModules = count + quietModules * 2;
    const cell = sizePx / totalModules;
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
          const laid = layoutModule((col + quietModules) * cell, (row + quietModules) * cell, cell, style);
          mods += moduleSvg(
            laid.x, laid.y, laid.cell, laid.overlap, style.module, style,
            neighborDark(model, row, col, count),
            canOrient(style.module) ? moduleRotation(row, col, count, style) : 0
          );
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
    if (style.moduleAim === 'converge' && canOrient(style.module)) bits.push('aim');
    else if (style.moduleAim === 'rotate' && style.moduleRot) bits.push('turn ' + Math.round(style.moduleRot) + '°');
    if (style.gradient) bits.push('gradient');
    return bits.join(' · ');
  }

  CB.engines.qr = {
    modules: MODULE_IDS,
    stamps: STAMP_LIST,
    stampIcon: stampIcon,
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
    canOrient: canOrient,
    naturalHeading: naturalHeading,
    moduleRotation: moduleRotation,
    clampModuleScale: clampModuleScale,
    clampCenterScale: clampCenterScale,
    clampRing: clampRing,
    finderLayout: finderLayout,
    gradientAngle: gradientAngle,
    gradientEnds: gradientEnds,
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
