import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

// script-preview.js is a plain (non-module) script loaded via a classic
// <script src> tag on the storefront, so it can't be `import`ed directly.
// It's executed here with Node's vm module against the *actual* file on
// disk, so this test exercises the real production code, not a copy.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = path.resolve(__dirname, '../../assets/script-preview.js');

let sandbox;

beforeAll(() => {
  const source = fs.readFileSync(SCRIPT_PATH, 'utf8');
  sandbox = {
    // Minimal stubs so the file's top-level
    // `document.addEventListener("DOMContentLoaded", ...)` call (which only
    // registers a listener - it's never fired here) doesn't throw.
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

describe('escapeHtml (extensions/bogo-shopify-app/assets/script-preview.js)', () => {
  it('escapes all five HTML-significant characters', () => {
    expect(sandbox.escapeHtml(`<script>alert('xss')</script> & "quotes"`)).toBe(
      '&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt; &amp; &quot;quotes&quot;'
    );
  });

  it('returns an empty string for null/undefined', () => {
    expect(sandbox.escapeHtml(null)).toBe('');
    expect(sandbox.escapeHtml(undefined)).toBe('');
  });

  it('coerces non-string values to strings before escaping', () => {
    expect(sandbox.escapeHtml(123)).toBe('123');
  });

  it('leaves plain text unchanged', () => {
    expect(sandbox.escapeHtml('Summer Bundle')).toBe('Summer Bundle');
  });
});

describe('sanitizeCssColor (extensions/bogo-shopify-app/assets/script-preview.js)', () => {
  const FALLBACK = '#000000';

  it('accepts hex colors of valid lengths', () => {
    expect(sandbox.sanitizeCssColor('#fff', FALLBACK)).toBe('#fff');
    expect(sandbox.sanitizeCssColor('#ffffff', FALLBACK)).toBe('#ffffff');
    expect(sandbox.sanitizeCssColor('#ffffffff', FALLBACK)).toBe('#ffffffff');
  });

  it('accepts rgb/rgba colors', () => {
    expect(sandbox.sanitizeCssColor('rgb(255, 0, 0)', FALLBACK)).toBe('rgb(255, 0, 0)');
    expect(sandbox.sanitizeCssColor('rgba(255, 0, 0, 0.5)', FALLBACK)).toBe('rgba(255, 0, 0, 0.5)');
  });

  it('accepts hsl/hsla colors', () => {
    expect(sandbox.sanitizeCssColor('hsl(120, 50%, 50%)', FALLBACK)).toBe('hsl(120, 50%, 50%)');
  });

  it('accepts short alphabetic keywords', () => {
    expect(sandbox.sanitizeCssColor('red', FALLBACK)).toBe('red');
    expect(sandbox.sanitizeCssColor('transparent', FALLBACK)).toBe('transparent');
  });

  it('falls back for a value that attempts to break out of the style attribute', () => {
    expect(sandbox.sanitizeCssColor('red; background: url(javascript:alert(1))', FALLBACK)).toBe(FALLBACK);
  });

  it('falls back for a value containing a quote character', () => {
    expect(sandbox.sanitizeCssColor('red" onmouseover="alert(1)', FALLBACK)).toBe(FALLBACK);
  });

  it('falls back for non-string input', () => {
    expect(sandbox.sanitizeCssColor(null, FALLBACK)).toBe(FALLBACK);
    expect(sandbox.sanitizeCssColor(undefined, FALLBACK)).toBe(FALLBACK);
    expect(sandbox.sanitizeCssColor({}, FALLBACK)).toBe(FALLBACK);
  });

  it('trims whitespace before validating', () => {
    expect(sandbox.sanitizeCssColor('  #fff  ', FALLBACK)).toBe('#fff');
  });
});
