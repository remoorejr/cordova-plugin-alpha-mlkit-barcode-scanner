'use strict';

// Rebuilds README.pdf from README.md.
//
// Usage: npm run build:readme-pdf
//
// Renders the README to HTML (with `marked`) and prints it to PDF with a locally installed
// Chromium based browser (Edge or Chrome). Set PDF_BROWSER to the path of a browser executable
// if none is found automatically.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { marked } = require('marked');

const root = path.resolve(__dirname, '..');
const readmePath = path.join(root, 'README.md');
const pdfPath = path.join(root, 'README.pdf');

const BROWSER_CANDIDATES = [
  process.env.PDF_BROWSER,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/microsoft-edge',
];

const STYLE = `
  body { font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #1f2328; margin: 0; }
  h1 { font-size: 22pt; border-bottom: 1px solid #d0d7de; padding-bottom: .3em; }
  h2 { font-size: 16pt; border-bottom: 1px solid #d0d7de; padding-bottom: .3em; margin-top: 1.6em; }
  h3 { font-size: 13pt; margin-top: 1.4em; }
  code { font-family: Consolas, "Courier New", monospace; font-size: 9.5pt; background: #eff1f3; padding: .1em .3em; border-radius: 4px; }
  pre { background: #f6f8fa; padding: 12px; border-radius: 6px; overflow-wrap: anywhere; white-space: pre-wrap; page-break-inside: avoid; }
  pre code { background: none; padding: 0; }
  table { border-collapse: collapse; margin: 1em 0; page-break-inside: avoid; }
  th, td { border: 1px solid #d0d7de; padding: 4px 10px; }
  th { background: #f6f8fa; }
  a { color: #0969da; text-decoration: none; }
`;

function findBrowser() {
  const browser = BROWSER_CANDIDATES.find((candidate) => candidate && fs.existsSync(candidate));
  if (!browser) {
    throw new Error('No Edge/Chrome found. Install one or set PDF_BROWSER to the path of a browser executable.');
  }
  return browser;
}

function renderHtml() {
  const markdown = fs
    .readFileSync(readmePath, 'utf8')
    .replace(/:camera:/g, '\u{1F4F7}')
    .replace(/:information_source:/g, '\u2139\uFE0F');

  return `<!doctype html><html><head><meta charset="utf-8"><title>cordova-plugin-alpha-mlkit-barcode-scanner</title>
<style>${STYLE}</style></head><body>${marked.parse(markdown, { gfm: true })}</body></html>`;
}

function main() {
  const browser = findBrowser();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'readme-pdf-'));
  const htmlPath = path.join(tmpDir, 'readme.html');

  try {
    fs.writeFileSync(htmlPath, renderHtml());
    execFileSync(
      browser,
      [
        '--headless',
        '--disable-gpu',
        '--no-pdf-header-footer',
        `--user-data-dir=${path.join(tmpDir, 'profile')}`,
        `--print-to-pdf=${pdfPath}`,
        `file:///${htmlPath.replace(/\\/g, '/')}`,
      ],
      { stdio: 'ignore' },
    );
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  console.log(`Built ${path.relative(root, pdfPath)} from ${path.relative(root, readmePath)}`);
}

try {
  main();
} catch (error) {
  console.error(`Could not build README.pdf: ${error.message}`);
  process.exit(1);
}
