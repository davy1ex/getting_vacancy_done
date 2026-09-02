import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { deflateSync, crc32 } from 'node:zlib';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import config from '../vite.config.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ---------------------------------------------------------------- icons
function makePng(size) {
  const [r, g, b, a] = [0x2f, 0x80, 0xed, 0xff];
  const rowLen = size * 4;
  const raw = Buffer.alloc((rowLen + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (rowLen + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const o = y * (rowLen + 1) + 1 + x * 4;
      // simple diagonal "H" suggestion: lighten center area
      const center = x > size * 0.25 && x < size * 0.75 && (y > size * 0.2 && y < size * 0.8);
      raw[o] = center ? 0xff : r;
      raw[o + 1] = center ? 0xff : g;
      raw[o + 2] = center ? 0xff : b;
      raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA

  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const body = Buffer.concat([typeBuf, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body) >>> 0, 0);
    return Buffer.concat([len, body, crc]);
  };

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

function writeIcons(dir) {
  const out = resolve(root, dir);
  mkdirSync(out, { recursive: true });
  for (const size of [16, 32, 48, 128]) {
    writeFileSync(resolve(out, `${size}.png`), makePng(size));
  }
}

// ---------------------------------------------------------------- manifests
const common = {
  manifest_version: 3,
  name: 'HH Revenge',
  version: '0.1.0',
  description: 'Getting Vacancy Done',
  permissions: ['storage', 'activeTab'],
  host_permissions: ['https://hh.ru/*', 'https://*.hh.ru/*', 'http://localhost/*', 'http://127.0.0.1/*'],
  action: { default_title: 'Open/close pannel HH GVD' },
  icons: { 16: '16.png', 32: '32.png', 48: '48.png', 128: '128.png' },
  content_scripts: [
    {
      matches: ['https://hh.ru/*', 'https://*.hh.ru/*'],
      js: ['content.js'],
      run_at: 'document_idle',
    },
  ],
};

const chromeManifest = {
  ...common,
  background: { service_worker: 'background.js' },
};

const firefoxManifest = {
  ...common,
  browser_specific_settings: { gecko: { id: 'hh-revenge@hh-revenge.local' } },
  background: { scripts: ['background.js'] },
};

// ---------------------------------------------------------------- build
async function run() {
  for (const target of ['chrome', 'firefox']) {
    const outDir = resolve(root, 'dist', target);
    for (const entry of ['content', 'background']) {
      const buildConfig = {
        ...config,
        configFile: false,
        build: {
          ...config.build,
          outDir,
          emptyOutDir: entry === 'content',
          rollupOptions: {
            input: { [entry]: `src/${entry}.${entry === 'content' ? 'tsx' : 'ts'}` },
            output: {
              format: 'iife',
              entryFileNames: '[name].js',
            },
          },
        },
      };
      await build(buildConfig);
    }
    mkdirSync(outDir, { recursive: true });
    writeIcons(outDir);
    writeFileSync(
      resolve(outDir, 'manifest.json'),
      JSON.stringify(target === 'chrome' ? chromeManifest : firefoxManifest, null, 2),
    );
    console.log(`built dist/${target}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
