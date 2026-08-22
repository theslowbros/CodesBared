'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function load(rel) {
  const context = { console: console };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  const files = Array.isArray(rel) ? rel : [rel];
  files.forEach(function (file) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context, { filename: file });
  });
  return context.CodesBared;
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

const CB = load(['js/colors.js', 'js/formats.js', 'js/payloads.js']);
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

test('registry has unique ids', function () {
  const ids = CB.formats.list.map(function (f) { return f.id; });
  assert(ids.length === new Set(ids).size, 'duplicate format id');
  assert(ids.length >= 40, 'expected a broad format list, got ' + ids.length);
});

test('every format has a group, engine, and validator', function () {
  const groups = new Set(CB.formats.GROUPS.map(function (g) { return g.id; }));
  CB.formats.list.forEach(function (format) {
    assert(groups.has(format.group), format.id + ' has unknown group ' + format.group);
    assert(format.engine === 'qr' || format.engine === 'bwip', format.id + ' engine');
    if (format.engine === 'bwip') assert(format.bcid, format.id + ' missing bcid');
    assert(typeof format.validate === 'function', format.id + ' missing validate');
    assert(typeof format.hint === 'string' && format.hint, format.id + ' missing hint');
  });
});

test('QR accepts arbitrary text and is the default', function () {
  assert(CB.formats.get('missing').id === 'qr', 'default should be qr');
  assert(CB.formats.validate('qr', 'https://example.com').ok, 'url should encode');
  assert(!CB.formats.validate('qr', '   ').ok, 'blank should fail');
});

test('retail check-digit lengths', function () {
  assert(CB.formats.validate('ean13', '5901234123457').ok, 'ean13 13');
  assert(CB.formats.validate('ean13', '590123412345').ok, 'ean13 12');
  assert(!CB.formats.validate('ean13', '59012341234').ok, 'ean13 short');
  assert(CB.formats.validate('upca', '03600029145').ok, 'upca 11');
  assert(CB.formats.validate('itf14', '15400141288763').ok, 'itf14');
  assert(CB.formats.validate('isbn', '978-0-306-40615-7').ok, 'isbn hyphenated');
  assert(CB.formats.validate('ean14', '1234567890123').ok, 'ean14 bare');
  assert(CB.formats.validate('ean14', '(01)1234567890123').ok, 'ean14 AI');
  assert(CB.formats.get('ean14').normalize('1234567890123') === '(01)1234567890123', 'ean14 wrap');
  assert(CB.formats.get('sscc18').normalize('10614141234567890') === '(00)10614141234567890', 'sscc wrap');
});

test('linear charset rules', function () {
  assert(CB.formats.validate('code39', 'ABC-123').ok, 'code39');
  assert(!CB.formats.validate('code39', 'abc!').ok, 'code39 rejects bang');
  assert(CB.formats.validate('codabar', 'A123456A').ok, 'codabar');
  assert(!CB.formats.validate('codabar', '123456').ok, 'codabar needs start/stop');
  assert(CB.formats.validate('interleaved2of5', '123456').ok, 'itf even');
  assert(!CB.formats.validate('interleaved2of5', '12345').ok, 'itf odd');
});

test('pharmacode and postal ranges', function () {
  assert(CB.formats.validate('pharmacode', '117480').ok, 'pharmacode');
  assert(!CB.formats.validate('pharmacode', '1').ok, 'pharmacode too small');
  assert(CB.formats.validate('onecode', '01234567094987654321').ok, 'imb 20');
  assert(!CB.formats.validate('onecode', '12345').ok, 'imb short');
  assert(CB.formats.validate('postnet', '12345').ok, 'postnet zip');
});

test('every format has a sample payload', function () {
  CB.formats.list.forEach(function (format) {
    const payload = CB.formats.payload(format);
    assert(payload && String(payload).trim(), format.id + ' missing sample');
    const check = CB.formats.validate(format.id, payload);
    assert(check.ok, format.id + ' sample invalid: ' + (check.message || ''));
  });
});

test('search finds matrix and gs1 formats', function () {
  const dm = CB.formats.search('data matrix');
  assert(dm.some(function (f) { return f.id === 'datamatrix'; }), 'datamatrix search');
  const gs1 = CB.formats.search('gs1');
  assert(gs1.some(function (f) { return f.id === 'gs1-128'; }), 'gs1-128 search');
});

test('QR payload builders cover Canva-style content types', function () {
  assert(CB.payloads.build('url', { value: 'example.com' }) === 'https://example.com', 'url prefix');
  assert(CB.payloads.build('wifi', { ssid: 'Cafe', password: 'p;a', security: 'WPA' }).indexOf('WIFI:T:WPA;S:Cafe;P:p\\;a;;') === 0, 'wifi');
  assert(CB.payloads.build('email', { address: 'a@b.com', subject: 'Hi' }) === 'mailto:a@b.com?subject=Hi', 'email');
  assert(CB.payloads.build('phone', { number: '+1 555 0100' }) === 'tel:+15550100', 'phone');
  assert(CB.payloads.detect('BEGIN:VCARD\nFN:Ada\nEND:VCARD') === 'vcard', 'vcard detect');
  assert(CB.payloads.parse('geo:51.5,-0.12').fields.lat === '51.5', 'geo parse');
});

test('quiet zone converts across 2D and 1D', function () {
  assert(CB.formats.quietMax('qr') === 10, '2d max');
  assert(CB.formats.quietMax('code128') === 20, '1d max');
  assert(CB.formats.quietUnit('qr') === 'modules', '2d unit');
  assert(CB.formats.quietUnit('code128') === 'X', '1d unit');
  assert(CB.formats.convertQuiet(4, 'qr', 'datamatrix') === 4, 'same kind keeps modules');
  assert(CB.formats.convertQuiet(10, 'code128', 'code39') === 10, 'same kind keeps X');
  assert(CB.formats.convertQuiet(4, 'qr', 'code128') === 10, 'default 2d maps to default 1d');
  assert(CB.formats.convertQuiet(10, 'code128', 'qr') === 4, 'default 1d maps to default 2d');
  assert(CB.formats.convertQuiet(8, 'qr', 'code128') === 20, 'double 2d maps to max 1d');
  assert(CB.formats.convertQuiet(2, 'qr', 'code128') === 5, 'half 2d maps to half 1d');
  assert(CB.formats.convertQuiet(15, 'code128', 'qr') === 6, '1d 15 maps to 2d 6');
  assert(CB.formats.convertQuiet(20, 'code128', 'datamatrix') === 8, '1d max maps within 2d max');
  assert(CB.formats.convertQuiet(12, 'qr', 'qr') === 10, 'clamps to 2d max');
});

test('contrast helpers', function () {
  const ratio = CB.colors.contrastRatio('#10131a', '#e7e6df');
  assert(ratio >= 7, 'default theme should be solid, got ' + ratio);
  assert(CB.colors.normalizeHex('aabbcc') === '#aabbcc', 'hex normalize');
  assert(CB.colors.hexForBwip('#E7E6DF') === 'e7e6df', 'bwip hex');
  const boosted = CB.colors.boostContrast('#777777', '#888888');
  assert(CB.colors.contrastRatio(boosted.dark, boosted.light) >= 7, 'boost should reach 7:1');
});

if (failed) {
  console.error(failed + ' failed, ' + passed + ' passed');
  process.exit(1);
}
console.log(passed + ' passed');
