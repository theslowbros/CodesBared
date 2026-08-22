'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function load() {
  const context = { console: console };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, '..', 'js/engines/qr.js'), 'utf8'),
    context,
    { filename: 'qr.js' }
  );
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
  ['square', 'rounded', 'dots', 'hearts', 'diamonds', 'clubs', 'spades', 'custom'].forEach(function (id) {
    assert(ids.indexOf(id) !== -1, 'missing module ' + id);
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

test('clubs are three fat lobes', function () {
  const parts = CB.engines.qr.suitGroups.clubs;
  const lobes = parts.filter(function (part) { return part.kind === 'circle'; });
  assert(lobes.length === 3, 'three club lobes');
  lobes.forEach(function (lobe) {
    assert(lobe.r >= 30, 'club lobe too slim: r=' + lobe.r);
    assert(lobe.cx - lobe.r >= -0.01 && lobe.cx + lobe.r <= 100.01, 'club lobe clipped horizontally');
    assert(lobe.cy - lobe.r >= -0.01 && lobe.cy + lobe.r <= 100.01, 'club lobe clipped vertically');
  });
});

test('SVG gradient is figure-wide, not per module', function () {
  const markup = CB.engines.qr.svgGradient('cb-qr-ink', 240, {
    from: '#111', to: '#0b6e4f', dir: 'd'
  });
  assert(markup.indexOf('gradientUnits="userSpaceOnUse"') !== -1, 'userSpaceOnUse');
  assert(markup.indexOf('x2="240"') !== -1 && markup.indexOf('y2="240"') !== -1, 'span the figure');
  assert(markup.indexOf('x2="100%"') === -1 && markup.indexOf('y2="100%"') === -1, 'no object-bounding-box percents');
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
    assert(id === 'custom' || CB.engines.qr.isGeometricCenter(id) || CB.engines.qr.suits[id] || CB.engines.qr.suitGroups[id],
      id + ' should be a valid center shape');
  });
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

if (failed) {
  console.error(failed + ' failed, ' + passed + ' passed');
  process.exit(1);
}
console.log(passed + ' passed');
