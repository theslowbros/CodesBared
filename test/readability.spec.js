const { test, expect } = require('@playwright/test');
const { pathToFileURL } = require('url');
const path = require('path');

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4173');
});

async function generate(page, text = 'https://example.com') {
  await page.locator('#input').fill(text);
  await expect(page.locator('#checkReadability')).toBeEnabled();
}

async function check(page) {
  await page.locator('#checkReadability').click();
  await expect(page.locator('#readabilityResult')).toHaveAttribute('data-status', /readable|warning|unconfirmed|mismatch/);
  return page.locator('#readabilityResult');
}

test('reads actual SVG and PNG previews locally, without changing downloads', async ({ page }) => {
  const external = [];
  page.on('request', request => {
    if (/^https?:/.test(request.url()) && !request.url().startsWith('http://127.0.0.1:4173')) external.push(request.url());
  });
  await generate(page);
  const workerStarted = page.waitForEvent('worker');
  await check(page);
  await workerStarted;
  await expect(page.locator('#readabilityResult')).toHaveAttribute('data-status', 'readable');
  await expect(page.locator('#readabilityResult')).toContainText('SVG at 240 × 240 px: content matches. Also reads at half size.');
  await page.locator('[data-preview="png"]').click();
  await expect(page.locator('#readabilityResult')).not.toHaveAttribute('data-status');
  const before = await page.locator('#stage-output canvas').evaluate(canvas => canvas.toDataURL());
  await check(page);
  await expect(page.locator('#readabilityResult')).toContainText('PNG at 240');
  expect(await page.locator('#stage-output canvas').evaluate(canvas => canvas.toDataURL())).toBe(before);
  await expect(page.locator('#download')).toHaveClass(/ready/);
  expect(external).toEqual([]);
});

test('checks rendered colors, transparency and quiet zone', async ({ page }) => {
  await generate(page);
  await page.locator('#transparentBg').check();
  await page.locator('#quietZoneVal').fill('0');
  await page.locator('#quietZoneVal').dispatchEvent('change');
  await check(page);
  await expect(page.locator('#readabilityResult')).toHaveAttribute('data-status', 'warning');
  await expect(page.locator('#readabilityResult')).toContainText('white only');
  await expect(page.locator('#readabilityResult')).toContainText('4 modules');
  await page.locator('#transparentBg').uncheck();
  await page.locator('#darkColorHex').fill('#ffffff');
  await page.locator('#darkColorHex').dispatchEvent('change');
  await page.locator('#lightColorHex').fill('#ffffff');
  await page.locator('#lightColorHex').dispatchEvent('change');
  await check(page);
  await expect(page.locator('#readabilityResult')).toHaveAttribute('data-status', 'unconfirmed');
});

test('includes a destructive logo overlay in both export checks', async ({ page }) => {
  await generate(page);
  // Deliberately damage the final overlay to prove the checker reads its pixels.
  await page.evaluate(() => {
    CodesBared.logo.drawOnCanvas = async function (ctx, width, height) {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height);
    };
    CodesBared.logo.injectInSvg = function (svg) {
      return svg.replace('</svg>', '<rect width="100%" height="100%" fill="white"/></svg>');
    };
  });
  await page.locator('#logoInput').setInputFiles({
    name: 'logo.svg', mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="black"/></svg>')
  });
  await expect(page.locator('#status')).toContainText('logo on');
  await check(page);
  await expect(page.locator('#readabilityResult')).toHaveAttribute('data-status', 'unconfirmed');
  await page.locator('[data-preview="png"]').click();
  await check(page);
  await expect(page.locator('#readabilityResult')).toHaveAttribute('data-status', 'unconfirmed');
});

test('reusable decoder returns inert content and catches mismatches', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const expected = 'WIFI:T:WPA;S:Example;P:secret;;';
    const qr = CodesBared.engines.qr.render(expected, { size: 300, quiet: 4, dark: '#000000', light: '#ffffff' });
    const pixels = qr.canvas.getContext('2d').getImageData(0, 0, 300, 300);
    const decoded = await CodesBared.qrReader.readImageData(pixels);
    const mismatch = await CodesBared.qrReadability.check({ canvas: qr.canvas, mode: 'png', expected: expected + 'x', quiet: 4 });
    const blank = await CodesBared.qrReader.readImageData(new ImageData(100, 100));
    return { decoded, mismatch, blank };
  });
  expect(result.decoded.text).toBe('WIFI:T:WPA;S:Example;P:secret;;');
  expect(result.decoded.bytes.length).toBeGreaterThan(0);
  expect(result.decoded.location.topLeftCorner).toBeTruthy();
  expect(result.mismatch.status).toBe('mismatch');
  expect(result.blank).toBeNull();
});

test('invalidates results and cancels checks on edits, empty input, and other formats', async ({ page }) => {
  await generate(page);
  await check(page);
  await page.evaluate(() => {
    const read = CodesBared.qrReader.readImageData;
    CodesBared.qrReader.readImageData = async function (...args) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return read.apply(this, args);
    };
  });
  await page.locator('#checkReadability').click();
  await page.locator('#input').fill('changed');
  await expect(page.locator('#checkReadability')).toBeEnabled();
  await expect(page.locator('#readabilityResult')).not.toHaveAttribute('data-status');
  await page.locator('#input').fill('');
  await expect(page.locator('#checkReadability')).toBeDisabled();
  await page.locator('#formatCats').getByRole('tab', { name: '1D', exact: true }).click();
  await expect(page.locator('#readability')).toBeHidden();
});

test('works from a local file when workers are unavailable', async ({ page }) => {
  await page.addInitScript(() => { window.Worker = undefined; });
  await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
  await generate(page, 'https://example.com/readability');
  await page.locator('[data-module="dots"]').click();
  await page.locator('[data-eye-center="hearts"]').click();
  await check(page);
  await expect(page.locator('#readabilityResult')).toHaveAttribute('data-status', 'readable');
  expect(await page.evaluate(() => typeof window.ZXingWASM.readBarcodes)).toBe('function');
});

test('decoder failures are distinct from an unconfirmed code', async ({ page }) => {
  await generate(page);
  await page.evaluate(() => {
    CodesBared.qrReader.readImageData = async function () { throw new Error('QR decoder is unavailable.'); };
  });
  await page.locator('#checkReadability').click();
  await expect(page.locator('#readabilityResult')).toContainText('Check unavailable.');
  await expect(page.locator('#readabilityResult')).not.toHaveAttribute('data-status');
  await expect(page.locator('#download')).toHaveClass(/ready/);
});

test('checks styled QR codes, a real logo, and non-ASCII payloads', async ({ page }) => {
  const results = await page.evaluate(async () => {
    const CB = CodesBared;
    const cases = [
      { text: 'https://example.com', module: 'rounded', gradient: { from: '#000000', to: '#0b6e4f', angle: 45 } },
      { text: '你好世界' },
      { text: 'BEGIN:VCARD\nVERSION:3.0\nFN:Example User\nEND:VCARD' }
    ];
    const results = [];
    for (const sample of cases) {
      const qr = CB.engines.qr.render(sample.text, Object.assign({ size: 360, quiet: 4, dark: '#000000', light: '#ffffff' }, sample));
      for (const mode of ['png', 'svg']) {
        results.push(await CB.qrReadability.check({ canvas: qr.canvas, svg: qr.svg, mode, expected: sample.text, quiet: 4 }));
      }
    }
    const logo = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="#000"/></svg>');
    const qr = CB.engines.qr.render('logo', { size: 360, quiet: 4, dark: '#000000', light: '#ffffff', logoDataUrl: logo });
    await CB.logo.drawOnCanvas(qr.canvas.getContext('2d'), 360, 360, logo, 12, '#ffffff');
    qr.svg = CB.logo.injectInSvg(qr.svg, logo, 12, '#ffffff');
    for (const mode of ['png', 'svg']) {
      results.push(await CB.qrReadability.check({ canvas: qr.canvas, svg: qr.svg, mode, expected: 'logo', quiet: 4 }));
    }
    return results;
  });
  for (const result of results) expect(['readable', 'warning']).toContain(result.status);
});

test('comparison preserves payload content and reports reduced-size failures', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const matches = CodesBared.qrReadability.matches;
    const comparisons = [
      matches({ text: '\uFEFF你好' }, '你好'),
      matches({ text: 'a ' }, 'a'), matches({ text: 'A' }, 'a'),
      matches({ text: 'e\u0301' }, '\u00e9')
    ];
    const qr = CodesBared.engines.qr.render('https://example.com/a-longer-path', { size: 90, quiet: 4, dark: '#000000', light: '#ffffff' });
    const checked = await CodesBared.qrReadability.check({ canvas: qr.canvas, mode: 'png', expected: 'https://example.com/a-longer-path', quiet: 4 });
    return { comparisons, checked };
  });
  expect(result.comparisons).toEqual([true, false, false, false]);
  expect(result.checked.status).toBe('warning');
  expect(result.checked.reduced).toBe(false);
});

test('readability fits a mobile preview', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await generate(page);
  await check(page);
  await page.locator('#readability').scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: 'test/output/readability-mobile.png' });
});
