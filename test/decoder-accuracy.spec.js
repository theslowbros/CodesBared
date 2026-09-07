const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('styled QR matrix retains baseline successes and recovers false failures', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('http://127.0.0.1:4173');
  const results = await page.evaluate(async () => {
    const CB = CodesBared;
    const results = [];
    for (const size of [120, 240, 480]) {
      for (const module of CB.engines.qr.modules.filter(shape => shape !== 'custom')) {
        for (const eyeCenter of ['square', 'dots', 'hearts']) {
          const text = 'https://example.com/readability';
          const qr = CB.engines.qr.render(text, { size, quiet: 4, dark: '#10131a', light: '#ffffff', module, eyeCenter });
          const pixels = qr.canvas.getContext('2d').getImageData(0, 0, size, size);
          const before = performance.now();
          const baseline = CB.qrReader.decodeImageData(pixels);
          const baselineMs = performance.now() - before;
          const measured = await CB.qrReader.measureImageData(pixels);
          results.push({
            size, module, eyeCenter, baseline: baseline?.text === text,
            improved: measured.code?.text === text, decoder: measured.code?.decoder,
            baselineMs, decodeMs: measured.timings.decodeMs
          });
        }
      }
    }
    return results;
  });
  function percentile(values, p) {
    return values.sort((a, b) => a - b)[Math.ceil(values.length * p) - 1];
  }
  const times = results.map(result => result.decodeMs);
  const summary = {
    cases: results.length,
    baselineRead: results.filter(result => result.baseline).length,
    improvedRead: results.filter(result => result.improved).length,
    medianDecodeMs: percentile(times, .5), p95DecodeMs: percentile(times, .95),
    maxDecodeMs: Math.max(...times),
    note: 'One run per synthetic image in this browser; excludes decoder initialization. Not a phone-camera benchmark.'
  };
  fs.mkdirSync(path.join(__dirname, 'output'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'output/decoder-benchmark.json'), JSON.stringify({ summary, results }, null, 2));
  console.log(JSON.stringify(summary));
  expect(results.length).toBe(378);
  expect(results.filter(result => !result.improved)).toEqual([]);
  expect(results.filter(result => !result.baseline && result.improved).length).toBeGreaterThan(250);
  expect(results.some(result => result.decoder === 'jsQR')).toBe(true);
});

test('decodes previously missed styled exports through the UI and worker', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173');
  await page.locator('#input').fill('https://example.com/readability');
  await page.locator('[data-module="dots"]').click();
  await page.locator('[data-eye-center="hearts"]').click();
  for (const mode of ['svg', 'png']) {
    await page.locator('[data-preview="' + mode + '"]').click();
    await expect(page.locator('#checkReadability')).toBeEnabled();
    await page.locator('#checkReadability').click();
    await expect(page.locator('#readabilityResult')).toHaveAttribute('data-status', /readable|warning/);
    await expect(page.locator('#readabilityResult')).toContainText('content matches');
    await expect(page.locator('#readabilityResult')).toContainText('Decode time: full size');
    await expect(page.locator('#readabilityResult')).toContainText('Total check:');
  }
});

test('timing excludes initialization and includes both decoding attempts', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173');
  const reports = await page.evaluate(async () => {
    let clock = 0;
    performance.now = () => clock;
    let found = true;
    window.ZXingWASM = {
      prepareZXingModule: async () => { clock += 1000; },
      readBarcodes: async () => {
        clock += 7;
        return found ? [{ isValid: true, text: 'test', bytes: [116], version: '1', position: {} }] : [];
      }
    };
    const pixels = new ImageData(20, 20);
    const primary = await CodesBared.qrReader.measureImageData(pixels);
    found = false;
    window.jsQR = () => { clock += 11; return { data: 'test', binaryData: [116], version: 1, location: {} }; };
    const fallback = await CodesBared.qrReader.measureImageData(pixels);
    window.jsQR = () => { clock += 13; return null; };
    const missed = await CodesBared.qrReader.measureImageData(pixels);
    return { primary, fallback, missed };
  });
  expect(reports.primary.timings).toEqual({ setupMs: 1000, decodeMs: 7, attempts: 1 });
  expect(reports.fallback.timings).toEqual({ setupMs: 1000, decodeMs: 18, attempts: 2 });
  expect(reports.missed.timings).toEqual({ setupMs: 1000, decodeMs: 20, attempts: 2 });
  expect(reports.missed.code).toBeNull();
});

test('a full-size miss still tries the half-size image', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173');
  const result = await page.evaluate(async () => {
    let reads = 0;
    CodesBared.qrReader.readImageData = async () => ({
      code: ++reads === 2 ? { text: 'scaled' } : null,
      timings: { setupMs: 0, decodeMs: 1, attempts: 1 }
    });
    const canvas = document.createElement('canvas');
    const result = await CodesBared.qrReadability.check({ canvas, mode: 'png', expected: 'scaled', quiet: 4 });
    return { result, reads };
  });
  expect(result.reads).toBe(2);
  expect(result.result.status).toBe('warning');
  expect(result.result.original).toBe(false);
  expect(result.result.reduced).toBe(true);
});

test('no decode is inconclusive and a missing engine is an availability error', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173');
  await page.locator('#input').fill('test');
  await page.locator('#darkColorHex').fill('#ffffff');
  await page.locator('#darkColorHex').dispatchEvent('change');
  await page.locator('#lightColorHex').fill('#ffffff');
  await page.locator('#lightColorHex').dispatchEvent('change');
  await expect(page.locator('#checkReadability')).toBeEnabled();
  await page.locator('#checkReadability').click();
  await expect(page.locator('#readabilityResult')).toHaveAttribute('data-status', 'unconfirmed');
  await expect(page.locator('#readabilityResult')).toContainText('your phone or another scanner may read it');
  await page.addInitScript(() => { window.Worker = undefined; });
  await page.route('**/vendor/zxing-reader.js', route => route.abort());
  await page.reload();
  await expect(page.locator('#checkReadability')).toBeEnabled();
  await page.locator('#checkReadability').click();
  await expect(page.locator('#readabilityResult')).toContainText('Check unavailable.');
  await expect(page.locator('#readabilityResult')).not.toHaveAttribute('data-status');
});
