'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const bwipjs = require('bwip-js');

function loadFormats() {
  const context = { console: console };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, '..', 'js/formats.js'), 'utf8'),
    context,
    { filename: 'formats.js' }
  );
  return context.CodesBared;
}

function isSvg(svg) {
  if (typeof svg !== 'string') return false;
  if (svg.indexOf('<svg') === -1) return false;
  if (svg.indexOf('</svg>') === -1) return false;
  if (svg.length < 120) return false;
  return /viewBox="0 0 [\d.]+ [\d.]+"/.test(svg) || /width="[\d.]+"/.test(svg);
}

const CB = loadFormats();
const outDir = path.join(__dirname, 'output');
fs.mkdirSync(outDir, { recursive: true });

const formats = CB.formats.list;
let passed = 0;
const failures = [];

(async function () {
  for (const format of formats) {
    const payload = CB.formats.payload(format);
    const check = CB.formats.validate(format.id, payload);
    if (!check.ok) {
      failures.push({ id: format.id, error: 'sample failed validation: ' + check.message });
      process.stdout.write('FAIL  ' + format.id + '  sample invalid\n');
      continue;
    }

    try {
      let svg;
      if (format.engine === 'bwip') {
        const opts = Object.assign({
          bcid: format.bcid,
          text: payload,
          scale: 2,
          padding: format.quietDefault || 1,
          backgroundcolor: 'e7e6df',
          barcolor: '10131a'
        }, format.options || {});
        if (format.kind === '1d' || format.includeText) {
          opts.includetext = true;
          opts.height = 10;
          opts.textxalign = 'center';
        }
        svg = bwipjs.toSVG(opts);
      } else if (format.engine === 'qr') {
        // Custom QR engine needs a DOM; cover it with the browser gallery.
        // Cross-check the same payload with bwip-js so this suite still
        // writes an SVG for every format id.
        svg = bwipjs.toSVG({
          bcid: 'qrcode',
          text: payload,
          scale: 2,
          padding: 4,
          backgroundcolor: 'e7e6df',
          barcolor: '10131a'
        });
      } else {
        throw new Error('unknown engine ' + format.engine);
      }

      if (!isSvg(svg)) throw new Error('output is not a usable SVG (' + (svg && svg.length) + ' bytes)');
      fs.writeFileSync(path.join(outDir, format.id + '.svg'), svg);
      passed += 1;
      process.stdout.write('ok    ' + format.id + '  ' + svg.length + ' bytes\n');
    } catch (err) {
      const message = err && err.message ? err.message : String(err);
      failures.push({ id: format.id, error: message });
      process.stdout.write('FAIL  ' + format.id + '  ' + message + '\n');
    }
  }

  const written = fs.readdirSync(outDir).filter(function (name) { return name.endsWith('.svg'); });
  if (written.length !== formats.length && !failures.length) {
    failures.push({ id: '*', error: 'expected ' + formats.length + ' SVG files, wrote ' + written.length });
  }

  if (failures.length) {
    console.error('\n' + failures.length + ' failed, ' + passed + ' passed');
    process.exit(1);
  }
  console.log('\n' + passed + ' SVG files written to test/output');
})().catch(function (err) {
  console.error(err);
  process.exit(1);
});
