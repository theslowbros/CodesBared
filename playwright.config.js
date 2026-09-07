const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './test',
  testMatch: '*.spec.js',
  use: { browserName: 'chromium', channel: process.env.PW_CHANNEL || 'chrome' },
  webServer: {
    command: 'node test/server.cjs',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false
  }
});
