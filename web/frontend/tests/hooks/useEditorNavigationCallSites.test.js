import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Regression test for a real bug: every editor called useEditorNavigation()
// with no argument, silently defaulting to appType='announcement-bar'
// (the hook's default parameter). closeEditor() uses appType to build the
// URL it sends the merchant back to after Save - so saving a bundle,
// buy-one-get-one, volume, or mix-and-match discount all landed on the
// Announcement Bars results page instead of their own. This asserts each
// editor's actual source passes its own correct appType explicitly,
// instead of relying on (or silently drifting back to) the hook's default.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(__dirname, '../..');

const EXPECTED = [
  ['apps/bundle-discounts/StandardBundleEditor.jsx', 'bundle-discount'],
  ['apps/buy-one-get-one/BuyXGetYEditor.jsx', 'buy-one-get-one'],
  ['apps/volume-discounts/VolumeDiscountEditor.jsx', 'volume-discounts'],
  ['apps/mix-and-match-discounts/MixAndMatchEditor.jsx', 'mix-and-match'],
  ['apps/announcement-bar/AnnouncementBarEditor.jsx', 'announcement-bar'],
];

describe('editor components pass their own appType to useEditorNavigation', () => {
  for (const [relativePath, expectedAppType] of EXPECTED) {
    it(`${relativePath} calls useEditorNavigation('${expectedAppType}')`, () => {
      const source = fs.readFileSync(path.join(FRONTEND_ROOT, relativePath), 'utf8');
      const match = source.match(/useEditorNavigation\(([^)]*)\)/);

      expect(match, `expected a useEditorNavigation(...) call in ${relativePath}`).toBeTruthy();
      expect(match[1].trim()).toBe(`'${expectedAppType}'`);
    });
  }
});
