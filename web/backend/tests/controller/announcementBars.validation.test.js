import { describe, it, expect, vi } from 'vitest';

vi.mock('../../models/announcementBar.model.js', () => ({
  default: { findOne: vi.fn(), findById: vi.fn() },
}));

vi.mock('../../models/shop.model.js', () => ({
  default: { findOne: vi.fn() },
}));

vi.mock('../../services/activityLogService.js', () => ({
  default: { logActivity: vi.fn() },
}));

const { validateAnnouncementBarData } = await import('../../controller/announcementBars/index.js');

describe('validateAnnouncementBarData', () => {
  it('accepts a payload with no problems', () => {
    expect(validateAnnouncementBarData({ message: 'Free shipping today!' })).toEqual([]);
  });

  it('rejects a message over the max length', () => {
    const errors = validateAnnouncementBarData({ message: 'a'.repeat(600) });
    expect(errors.some((e) => /characters or fewer/i.test(e))).toBe(true);
  });

  it('accepts valid hex colors', () => {
    const errors = validateAnnouncementBarData({
      colorSettings: { 'Background Color': '#a18c8c' },
      saveBoxSettings: { backgroundColor: '#FFFF00', fontColor: '#000' },
    });
    expect(errors).toEqual([]);
  });

  it('accepts rgb/rgba and named colors', () => {
    const errors = validateAnnouncementBarData({
      generalColorSettings: { 'Message Font Color': 'rgba(255, 0, 0, 0.5)' },
      timerColorSettings: { 'Timer Numbers Font Color': 'transparent' },
    });
    expect(errors).toEqual([]);
  });

  it('rejects a color value that could break out of a style attribute', () => {
    const errors = validateAnnouncementBarData({
      colorSettings: { 'Background Color': 'red; } </style><script>alert(1)</script>' },
    });
    expect(errors.some((e) => /invalid color value/i.test(e))).toBe(true);
    expect(errors.join(' ')).toMatch(/colorSettings\.Background Color/);
  });

  it('rejects a nested invalid color deep in settings', () => {
    const errors = validateAnnouncementBarData({
      shopNowButtonSettings: { borderColor: '"><img src=x onerror=alert(1)>' },
    });
    expect(errors.some((e) => /invalid color value/i.test(e))).toBe(true);
  });
});
