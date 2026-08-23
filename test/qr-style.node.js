'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function load() {
  const context = { console: console };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  ['js/engines/qr.js', 'js/engines/bwip.js'].forEach(function (file) {
    vm.runInContext(
      fs.readFileSync(path.join(__dirname, '..', file), 'utf8'),
      context,
      { filename: file }
    );
  });
  return context.CodesBared;
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

const CB = load();
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
  } catch (err) {
    failed += 1;
    console.error('FAIL  ' + name + ' — ' + err.message);
  }
}

test('module list includes suits and custom', function () {
  const ids = CB.engines.qr.modules;
  ['square', 'rounded', 'dots', 'smooth', 'mix', 'hearts', 'diamonds', 'clubs', 'spades', 'triangle', 'custom'].forEach(function (id) {
    assert(ids.indexOf(id) !== -1, 'missing module ' + id);
  });
  CB.engines.qr.stamps.forEach(function (stamp) {
    assert(ids.indexOf(stamp.id) !== -1, 'missing stamp ' + stamp.id);
    assert(stamp.label, stamp.id + ' needs a label');
    const icon = CB.engines.qr.stampIcon(stamp.id);
    assert(/<svg/.test(icon), stamp.id + ' needs an icon');
  });
});

test('each suit is a closed path in a 100 box', function () {
  Object.keys(CB.engines.qr.suits).forEach(function (id) {
    const d = CB.engines.qr.suits[id];
    assert(d && d.charAt(0) === 'M', id + ' should start with M');
    assert(/Z$/i.test(d), id + ' should close');
    const nums = d.match(/-?\d+(\.\d+)?/g).map(Number);
    nums.forEach(function (n) {
      assert(n >= -2 && n <= 102, id + ' point ' + n + ' is outside the box');
    });
  });
});

test('diamonds reach the cell edges so neighboring tips touch', function () {
  const d = CB.engines.qr.suits.diamonds;
  assert(/M50 -2/.test(d) && /L102 50/.test(d) && /L-2 50/.test(d), 'diamond tips meet at the cell edge');
});

test('grouped stamps stay inside the cell', function () {
  ['clubs', 'flower', 'berries'].forEach(function (id) {
    const parts = CB.engines.qr.suitGroups[id];
    assert(parts && parts.length, id + ' should be a group');
    parts.forEach(function (part) {
      if (part.kind === 'circle') {
        assert(part.cx - part.r >= -0.01 && part.cx + part.r <= 100.01, id + ' circle clipped x');
        assert(part.cy - part.r >= -0.01 && part.cy + part.r <= 100.01, id + ' circle clipped y');
      }
    });
  });
});

test('clubs are three fat lobes', function () {
  const parts = CB.engines.qr.suitGroups.clubs;
  const lobes = parts.filter(function (part) { return part.kind === 'circle'; });
  assert(lobes.length === 3, 'three club lobes');
  lobes.forEach(function (lobe) {
    assert(lobe.r >= 30, 'club lobe too slim: r=' + lobe.r);
    assert(lobe.cx - lobe.r >= -0.01 && lobe.cx + lobe.r <= 100.01, 'club lobe clipped horizontally');
    assert(lobe.cy - lobe.r >= -0.01 && lobe.cy + lobe.r <= 100.01, 'club lobe clipped vertically');
  });
  const stem = parts.filter(function (part) { return part.kind === 'path'; })[0];
  assert(stem && /100/.test(stem.d), 'club stem should reach the cell floor');
  const bottoms = lobes.map(function (lobe) { return lobe.cy + lobe.r; });
  const lowest = Math.max.apply(null, bottoms);
  assert(lowest <= 86, 'lobes should leave room for a visible stem, lowest=' + lowest);
});

test('SVG gradient is figure-wide, not per module', function () {
  const markup = CB.engines.qr.svgGradient('cb-qr-ink', 240, {
    from: '#111', to: '#0b6e4f', angle: 45
  });
  assert(markup.indexOf('gradientUnits="userSpaceOnUse"') !== -1, 'userSpaceOnUse');
  assert(/x2="240/.test(markup) && /y2="240/.test(markup), 'span the figure');
  assert(markup.indexOf('x2="100%"') === -1 && markup.indexOf('y2="100%"') === -1, 'no object-bounding-box percents');
  assert(CB.engines.qr.gradientAngle({ dir: 'h' }) === 0, 'old horizontal dir');
  assert(CB.engines.qr.gradientAngle({ dir: 'v' }) === 90, 'old vertical dir');
  const flat = CB.engines.qr.gradientEnds(200, 0);
  assert(Math.abs(flat.y1 - flat.y2) < 0.01, '0° stays level');
  assert(flat.x2 > flat.x1, '0° points right');
});

test('module and marker sizes stay in a scannable range', function () {
  assert(CB.engines.qr.clampModuleScale(10) === 70, 'modules cannot shrink too far');
  assert(CB.engines.qr.clampModuleScale(200) === 150, 'modules cannot grow too far');
  assert(CB.engines.qr.clampCenterScale(10) === 70, 'center floor');
  assert(CB.engines.qr.clampCenterScale(200) === 180, 'center ceiling');
  assert(CB.engines.qr.clampRing(10) === 50, 'ring floor');
  assert(CB.engines.qr.clampRing(400) === 160, 'ring ceiling');
  const std = CB.engines.qr.finderLayout({ r: 0, c: 0 }, 10, 0, {
    eyeRing: 100, eyeCenterScale: 100, eyeOuterR: 0, eyeInnerR: 0, eyeCenterR: 0
  });
  assert(std.outer === 70 && std.hole === 50 && std.pupil === 30, 'standard finder geometry');
  const thick = CB.engines.qr.finderLayout({ r: 0, c: 0 }, 10, 0, {
    eyeRing: 160, eyeCenterScale: 180, eyeOuterR: 0, eyeInnerR: 0, eyeCenterR: 0
  });
  assert(thick.hole < std.hole, 'thicker ring shrinks the hole');
  assert(thick.pupil < thick.hole, 'pupil stays inside the ring');
});

test('center presets map to a radius slider', function () {
  assert(CB.engines.qr.centerPreset('square') === 0, 'square center');
  assert(CB.engines.qr.centerPreset('dots') === 100, 'dots center');
  assert(CB.engines.qr.centerPreset('rounded') > 0 && CB.engines.qr.centerPreset('rounded') < 100, 'round center');
  assert(CB.engines.qr.matchCenterPreset(0) === 'square', 'match square');
  assert(CB.engines.qr.matchCenterPreset(100) === 'dots', 'match dots');
  assert(CB.engines.qr.matchCenterPreset(50) === '', 'in-between matches none');
});

test('marker center can use pattern shapes independently', function () {
  assert(CB.engines.qr.mapCenterShape('circle') === 'dots', 'old circle maps to dots');
  assert(CB.engines.qr.isGeometricCenter('square'), 'square is geometric');
  assert(CB.engines.qr.isGeometricCenter('dots'), 'dots is geometric');
  assert(!CB.engines.qr.isGeometricCenter('hearts'), 'hearts is a stamp');
  assert(!CB.engines.qr.isGeometricCenter('custom'), 'custom is a stamp');
  CB.engines.qr.modules.forEach(function (id) {
    assert(
      id === 'custom' ||
      id === 'smooth' ||
      id === 'mix' ||
      CB.engines.qr.isGeometricCenter(id) ||
      CB.engines.qr.suits[id] ||
      CB.engines.qr.suitGroups[id],
      id + ' should be a valid pattern or center shape'
    );
  });
});

test('smooth rounds only outer corners', function () {
  const r = CB.engines.qr.smoothCorners;
  const iso = r({}, 100);
  assert(iso.tl === 100 && iso.tr === 100 && iso.br === 100 && iso.bl === 100, 'isolated is a circle');
  const mid = r({ e: true, w: true }, 80);
  assert(mid.tl === 0 && mid.tr === 0 && mid.br === 0 && mid.bl === 0, 'horizontal middle stays square');
  const left = r({ e: true }, 80);
  assert(left.tl === 80 && left.bl === 80 && left.tr === 0 && left.br === 0, 'left end is a capsule');
  const elbow = r({ e: true, s: true }, 80);
  assert(elbow.tl === 80 && elbow.tr === 0 && elbow.br === 0 && elbow.bl === 0, 'L vertex rounds only the outer corner');
  const none = r({}, 0);
  assert(none.tl === 0 && none.tr === 0 && none.br === 0 && none.bl === 0, 'slider 0 is square');
});

test('bwip SVG sizing does not steal the background rect width', function () {
  const src = '<svg viewBox="0 0 308 114" xmlns="http://www.w3.org/2000/svg">' +
    '<rect width="100%" height="100%" fill="#e7e6df"/>' +
    '<path stroke="#111" d="M0 0"/></svg>';
  const out = CB.engines.bwip.sizeSvg(src, 400, 148);
  assert(/<svg width="400" height="148"/.test(out), 'root svg gets pixel size');
  assert(out.indexOf('<rect width="100%" height="100%"') !== -1, 'background rect keeps 100%');
});

test('pattern rotation can be uniform or aimed at a point', function () {
  assert(CB.engines.qr.canOrient('hearts') && CB.engines.qr.canOrient('custom'), 'stamps turn');
  assert(CB.engines.qr.canOrient('square'), 'squares can turn');
  assert(CB.engines.qr.canOrient('mix'), 'mix can turn');
  assert(!CB.engines.qr.canOrient('dots') && !CB.engines.qr.canOrient('smooth'), 'dots and smooth stay put');
  assert(CB.engines.qr.naturalHeading('hearts') === 90, 'hearts point down');
  assert(CB.engines.qr.naturalHeading('spades') === -90, 'spades point up');
  const rot = CB.engines.qr.moduleRotation;
  assert(rot(0, 0, 21, { module: 'hearts', moduleAim: 'none', moduleRot: 45 }) === 0, 'upright ignores the slider');
  assert(rot(3, 8, 21, { module: 'hearts', moduleAim: 'rotate', moduleRot: 45 }) === 45, 'rotate is the same everywhere');
  const inward = rot(10, 0, 21, {
    module: 'hearts', moduleAim: 'converge', moduleRot: 0, aimX: 50, aimY: 50
  });
  assert(Math.abs(inward - (-90)) < 0.01, 'heart left of center tips right, got ' + inward);
  const above = rot(0, 10, 21, {
    module: 'hearts', moduleAim: 'converge', moduleRot: 0, aimX: 50, aimY: 50
  });
  assert(Math.abs(above) < 0.01, 'heart above center already points down, got ' + above);
  const below = rot(20, 10, 21, {
    module: 'hearts', moduleAim: 'converge', moduleRot: 0, aimX: 50, aimY: 50
  });
  assert(Math.abs(Math.abs(below) - 180) < 0.01, 'heart below center flips up, got ' + below);
  const twist = rot(10, 0, 21, {
    module: 'hearts', moduleAim: 'converge', moduleRot: 180, aimX: 50, aimY: 50
  });
  assert(Math.abs(twist - 90) < 0.01, 'converge plus 180° points away, got ' + twist);
});

test('border presets set inner and outer radii', function () {
  const square = CB.engines.qr.borderPreset('square');
  assert(square.outer === 0 && square.inner === 0, 'square radii');
  const circle = CB.engines.qr.borderPreset('circle');
  assert(circle.outer === 100 && circle.inner === 100, 'circle radii');
  const rounded = CB.engines.qr.borderPreset('rounded');
  assert(rounded.outer > 0 && rounded.outer < 100, 'rounded outer');
  assert(rounded.inner > 0 && rounded.inner < 100, 'rounded inner');
  assert(CB.engines.qr.matchBorderPreset(0, 0) === 'square', 'match square');
  assert(CB.engines.qr.matchBorderPreset(100, 100) === 'circle', 'match circle');
  assert(CB.engines.qr.matchBorderPreset(40, 10) === '', 'custom radii match none');
});

test('triangle is a closed stamp in the box', function () {
  const stamp = CB.engines.qr.stamps.filter(function (item) { return item.id === 'triangle'; })[0];
  assert(stamp && stamp.label === 'Triangle', 'triangle is in the stamp list');
  const d = CB.engines.qr.suits.triangle;
  assert(d && d.charAt(0) === 'M' && /Z$/i.test(d), 'closed path');
  assert(/M50 4/.test(d), 'points up');
});

test('mix picks a stable stamp per cell', function () {
  const style = { module: 'mix', moduleMix: ['hearts', 'star', 'triangle'] };
  const a = CB.engines.qr.resolveModule(3, 8, style);
  const b = CB.engines.qr.resolveModule(3, 8, style);
  const c = CB.engines.qr.resolveModule(4, 8, style);
  assert(a === b, 'same cell is stable');
  assert(['hearts', 'star', 'triangle'].indexOf(a) !== -1, 'picks from the mix');
  assert(CB.engines.qr.normalizeMix(['hearts', 'nope', 'hearts', 'star']).join(',') === 'hearts,star', 'drops unknown and dupes');
  const empty = CB.engines.qr.mixList({ moduleMix: [] });
  assert(empty.length >= 2, 'empty mix still has a fallback');
  assert(CB.engines.qr.resolveModule(0, 0, { module: 'square' }) === 'square', 'non-mix is passthrough');
  const seen = {};
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      seen[CB.engines.qr.resolveModule(row, col, style)] = true;
    }
  }
  assert(Object.keys(seen).length > 1, 'mix varies across the grid');
  const aimed = CB.engines.qr.moduleRotation(10, 0, 21, {
    module: 'mix',
    moduleMix: ['hearts'],
    moduleAim: 'converge',
    moduleRot: 0,
    aimX: 50,
    aimY: 50
  });
  assert(Math.abs(aimed - (-90)) < 0.01, 'mix converge uses the resolved stamp heading, got ' + aimed);
});

test('hexagon marker border is kept and stays inside the finder', function () {
  const style = CB.engines.qr.normalizeStyle({
    eyeBorder: 'hexagon',
    eyeOuterR: 0,
    eyeInnerR: 0,
    eyeRot: 30
  });
  assert(style.eyeBorder === 'hexagon', 'hexagon is not matched back to square');
  assert(style.eyeRot === 30, 'border rotation is kept');
  const box = CB.engines.qr.finderLayout({ r: 0, c: 0 }, 10, 0, {
    eyeRing: 100, eyeCenterScale: 100, eyeOuterR: 0, eyeInnerR: 0, eyeCenterR: 0
  });
  const cx = box.x + box.outer / 2;
  const cy = box.y + box.outer / 2;
  const outer = CB.engines.qr.hexagonPoints(cx, cy, box.outer / 2);
  const inner = CB.engines.qr.hexagonPoints(cx, cy, box.hole / 2);
  assert(outer.length === 6 && inner.length === 6, 'six vertices');
  outer.forEach(function (p) {
    assert(p.x >= box.x - 0.01 && p.x <= box.x + box.outer + 0.01, 'outer x in box');
    assert(p.y >= box.y - 0.01 && p.y <= box.y + box.outer + 0.01, 'outer y in box');
  });
  inner.forEach(function (p, i) {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const ox = outer[i].x - cx;
    const oy = outer[i].y - cy;
    assert(dx * dx + dy * dy < ox * ox + oy * oy, 'hole inside outer');
  });
  assert(/L/.test(CB.engines.qr.hexagonD(cx, cy, box.outer / 2)), 'hex path has vertices');
});

if (failed) {
  console.error(failed + ' failed, ' + passed + ' passed');
  process.exit(1);
}
console.log(passed + ' passed');
