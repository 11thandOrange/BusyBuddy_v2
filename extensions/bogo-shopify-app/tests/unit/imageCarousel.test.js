import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

// Same vm-based harness as sanitize.test.js - runs the real production file.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = path.resolve(__dirname, '../../assets/script-preview.js');

let sandbox;

beforeAll(() => {
  const source = fs.readFileSync(SCRIPT_PATH, 'utf8');
  sandbox = {
    document: {
      addEventListener: () => {},
      querySelector: () => null,
    },
    window: {},
    console,
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: SCRIPT_PATH });
});

describe('renderProductImageStrip (extensions/bogo-shopify-app/assets/script-preview.js)', () => {
  it('renders a single plain <img> (no carousel markup) when there is one image', () => {
    const html = sandbox.renderProductImageStrip(['a.jpg'], null, 'T-Shirt', 100, 10, 15);
    expect(html).toContain('<img src="a.jpg"');
    expect(html).not.toContain('scroll-snap-type');
  });

  it('falls back to fallbackImage when images is empty/undefined - identical to the old single-image markup', () => {
    const html = sandbox.renderProductImageStrip(undefined, 'fallback.jpg', 'T-Shirt', 100, 10, 15);
    expect(html).toContain('<img src="fallback.jpg"');
    expect(html).not.toContain('scroll-snap-type');
  });

  it('renders a scrollable strip with one <img> per image plus dot indicators when there are multiple', () => {
    const html = sandbox.renderProductImageStrip(['a.jpg', 'b.jpg', 'c.jpg'], null, 'T-Shirt', 100, 10, 15);
    expect(html).toContain('scroll-snap-type: x mandatory');
    expect((html.match(/<img /g) || []).length).toBe(3);
    expect(html).toContain('a.jpg');
    expect(html).toContain('b.jpg');
    expect(html).toContain('c.jpg');
    // 3 dot indicators
    expect((html.match(/border-radius: 50%/g) || []).length).toBe(3);
  });

  it('escapes alt text and image URLs to prevent HTML injection', () => {
    const html = sandbox.renderProductImageStrip(
      ['<img onerror=alert(1)>.jpg'],
      null,
      '<script>alert(1)</script>',
      100,
      10,
      15
    );
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('ignores non-string entries in the images array instead of crashing', () => {
    const html = sandbox.renderProductImageStrip([null, undefined, 42, 'real.jpg'], 'fallback.jpg', 'T-Shirt', 100, 10, 15);
    expect(html).toContain('real.jpg');
    expect(html).not.toContain('scroll-snap-type'); // only 1 valid image left, so no carousel
  });

  it('applies the optional border style to the single-image fallback', () => {
    const html = sandbox.renderProductImageStrip(['a.jpg'], null, 'T-Shirt', 100, 10, 15, '1px solid #e5e5e5');
    expect(html).toContain('border: 1px solid #e5e5e5');
  });
});
