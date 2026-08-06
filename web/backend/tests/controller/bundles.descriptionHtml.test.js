import { describe, it, expect, vi } from 'vitest';

vi.mock('../../services/activityLogService.js', () => ({
  default: { logActivity: vi.fn() },
}));

vi.mock('../../models/bundle.model.js', () => ({
  default: { findById: vi.fn() },
}));

vi.mock('../../models/shop.model.js', () => ({
  default: { findOne: vi.fn() },
}));

vi.mock('../../../shopify.js', () => ({
  default: {
    api: { clients: { Graphql: vi.fn() } },
  },
}));

const { buildDescriptionHtml } = await import('../../controller/bundles/index.js');

describe('buildDescriptionHtml', () => {
  it('returns an empty string when there is no description and no specs', () => {
    expect(buildDescriptionHtml(undefined, undefined)).toBe('');
    expect(buildDescriptionHtml('', [])).toBe('');
    expect(buildDescriptionHtml('   ', [])).toBe('');
  });

  it('wraps the description in a paragraph', () => {
    expect(buildDescriptionHtml('A great bundle', [])).toBe('<p>A great bundle</p>');
  });

  it('trims surrounding whitespace on the description', () => {
    expect(buildDescriptionHtml('  A great bundle  ', [])).toBe('<p>A great bundle</p>');
  });

  it('renders specs as a list, skipping rows with a missing label or value', () => {
    const specs = [
      { label: 'Material', value: 'Cotton' },
      { label: 'Color', value: '' },
      { label: '', value: 'Blue' },
      { label: 'Fit', value: 'Regular' },
    ];
    expect(buildDescriptionHtml(undefined, specs)).toBe(
      '<ul><li>Material: Cotton</li><li>Fit: Regular</li></ul>'
    );
  });

  it('combines description and specs, description first', () => {
    const specs = [{ label: 'Material', value: 'Cotton' }];
    expect(buildDescriptionHtml('A great bundle', specs)).toBe(
      '<p>A great bundle</p><ul><li>Material: Cotton</li></ul>'
    );
  });

  it('escapes HTML-significant characters in description and specs so merchant input cannot inject markup', () => {
    const html = buildDescriptionHtml('<script>alert(1)</script> & "quoted"', [
      { label: '<b>Label</b>', value: "O'Brien & Co" },
    ]);
    expect(html).toBe(
      '<p>&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;quoted&quot;</p>' +
        '<ul><li>&lt;b&gt;Label&lt;/b&gt;: O&#39;Brien &amp; Co</li></ul>'
    );
  });
});
