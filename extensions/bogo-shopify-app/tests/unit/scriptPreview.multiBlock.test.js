import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

// script-preview.js is a plain classic <script src> file, executed once
// per "BusyBuddy Bundles" block on a template (each block embeds its own
// copy of the tag). Top-level `class`/`let`/`const` declarations across
// separate classic <script> tags share one global lexical environment, so
// a second block's script actually throws
// "SyntaxError: Identifier 'BOGOBundle' has already been declared" at its
// class declaration and never reaches its own bottom-of-file
// addEventListener call - only the FIRST block's script tag ever fully
// executes. That single execution is therefore the only place that can
// possibly find and wire up every block's container; this is what's
// verified here, rather than simulating N independent full executions.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = path.resolve(__dirname, '../../assets/script-preview.js');
const SOURCE = fs.readFileSync(SCRIPT_PATH, 'utf8');

function makeFakeContainer() {
  return { style: {}, remove: () => {} };
}

describe('script-preview.js - one execution must wire up every block container', () => {
  it('instantiates a widget for every .bogo-bundle-container on the page, not just the first', () => {
    const domContentLoadedListeners = [];
    const querySelectorAllCalls = [];
    const containers = [makeFakeContainer(), makeFakeContainer()];

    const sandbox = {
      document: {
        addEventListener: (event, cb) => {
          if (event === 'DOMContentLoaded') domContentLoadedListeners.push(cb);
        },
        querySelector: () => null,
        querySelectorAll: (selector) => {
          querySelectorAllCalls.push(selector);
          return containers;
        },
      },
      window: { location: { pathname: '/products/test-product' } },
      console,
      fetch: () => Promise.reject(new Error('not needed for this test')),
    };
    vm.createContext(sandbox);
    vm.runInContext(SOURCE, sandbox, { filename: SCRIPT_PATH });

    expect(domContentLoadedListeners).toHaveLength(1);
    domContentLoadedListeners[0]();

    expect(querySelectorAllCalls).toEqual(['.bogo-bundle-container']);
    // Each container is independently hidden by its own BOGOBundle
    // instance's synchronous init() - the previous bare
    // document.querySelector(".bogo-bundle-container") would only ever
    // have touched containers[0], leaving containers[1] (a second block)
    // completely unowned by any script instance.
    expect(containers[0].style.display).toBe('none');
    expect(containers[1].style.display).toBe('none');
  });

  it('does nothing (no error) when there are no bundle containers on the page at all', () => {
    const domContentLoadedListeners = [];
    const sandbox = {
      document: {
        addEventListener: (event, cb) => {
          if (event === 'DOMContentLoaded') domContentLoadedListeners.push(cb);
        },
        querySelector: () => null,
        querySelectorAll: () => [],
      },
      window: {},
      console,
    };
    vm.createContext(sandbox);
    vm.runInContext(SOURCE, sandbox, { filename: SCRIPT_PATH });

    expect(() => domContentLoadedListeners[0]()).not.toThrow();
  });
});
