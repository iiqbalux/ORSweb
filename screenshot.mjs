import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const outDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const existing = fs.readdirSync(outDir).filter(f => /^screenshot-\d+/.test(f));
const nextNum = existing.length
  ? Math.max(...existing.map(f => parseInt(f.match(/^screenshot-(\d+)/)[1], 10))) + 1
  : 1;

const filename = label ? `screenshot-${nextNum}-${label}.png` : `screenshot-${nextNum}.png`;
const outPath = path.join(outDir, filename);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();

const width = process.env.SS_WIDTH ? parseInt(process.env.SS_WIDTH, 10) : 1440;
const height = process.env.SS_HEIGHT ? parseInt(process.env.SS_HEIGHT, 10) : 900;

await page.setViewport({ width, height });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log(`Saved: ${outPath}`);
