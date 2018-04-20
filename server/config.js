const Store = require('electron-store');
const isDev = require('electron-is-dev');
const path = require('path');

const os = require('os');

const platform = os.platform();

const rootDir = path.join(__dirname,'page');
const indexHtml = path.join(rootDir, 'index.html');
const shortcutCaptureHtml = path.join(rootDir, 'shortcutCapture.html');
const store = new Store();
const debug = store.get('debug');

module.exports = {
  indexUrl:  `file://${indexHtml}`,
  shotcutUrl: `file://${shortcutCaptureHtml}`,
  isDev: isDev || !!debug
};