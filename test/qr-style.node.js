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
