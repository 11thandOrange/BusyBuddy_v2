import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import AnnouncementBar from '../../models/announcementBar.model.js';
import { mapEditorPayloadToSchema } from '../../controller/announcementBars/index.js';

// AnnouncementBarEditor.jsx (the current editor UI) sends flat field names
// like `barType`, `backgroundColor`, `fontSize` that don't match the Mongoose
// schema's `type` enum casing or its nested sub-documents (colorSettings,
// messageDesktopFontSettings, saveBoxSettings, shopNowButtonSettings). Before
// mapEditorPayloadToSchema existed, saving with the default `barType: 'text'`
// threw a real Mongoose validation error ("`text` is not a valid enum value
// for path `type`"), and the other visual settings were silently stripped.
describe('mapEditorPayloadToSchema', () => {
  const validate = (payload) => {
    const doc = new AnnouncementBar({
      ...mapEditorPayloadToSchema(payload),
      shopId: new mongoose.Types.ObjectId(),
    });
    return doc.validateSync();
  };

  it('maps every barType option to a schema-valid type enum value', () => {
    const cases = {
      text: 'Text',
      countdown: 'Countdown Timer',
      freeshipping: 'Free Shipping',
      orders: 'Orders Counter',
      Email: 'Email',
    };

    for (const [barType, expectedType] of Object.entries(cases)) {
      const mapped = mapEditorPayloadToSchema({ name: 'x', message: 'y', barType });
      expect(mapped.type).toBe(expectedType);

      const err = validate({ name: 'x', message: 'y', barType });
      expect(err).toBeUndefined();
    }
  });

  it('does not throw the historical enum validation error for the default bar type', () => {
    const err = validate({ name: 'Test Bar', message: 'Hello', barType: 'text' });
    expect(err).toBeUndefined();
  });

  it('maps flat background/text color fields onto colorSettings and generalColorSettings', () => {
    const mapped = mapEditorPayloadToSchema({
      backgroundColor: '#123456',
      textColor: '#abcdef',
    });

    expect(mapped.colorSettings['Background Color']).toBe('#123456');
    expect(mapped.generalColorSettings['Background Color']).toBe('#123456');
    expect(mapped.generalColorSettings['Message Font Color']).toBe('#abcdef');
  });

  it('maps flat font fields onto messageDesktopFontSettings', () => {
    const mapped = mapEditorPayloadToSchema({
      fontSize: '20',
      fontFamily: 'Arial',
      fontWeight: '700',
    });

    expect(mapped.messageDesktopFontSettings).toEqual({
      fontSize: '20px',
      fontFamily: 'Arial',
      fontWeight: '700',
    });
  });

  it('maps save badge and shop-now button colors onto their nested settings', () => {
    const mapped = mapEditorPayloadToSchema({
      saveBoxBgColor: '#ff0000',
      saveBoxTextColor: '#ffffff',
      shopNowButtonBgColor: '#000000',
      shopNowButtonColor: '#eeeeee',
    });

    expect(mapped.saveBoxSettings).toEqual({ backgroundColor: '#ff0000', fontColor: '#ffffff' });
    expect(mapped.shopNowButtonSettings).toEqual({ backgroundColor: '#000000', fontColor: '#eeeeee' });
  });

  it('maps timerEndDate/timerEndTime to targetDate/targetTime and animationSpeed to messageAnimationSpeed', () => {
    const mapped = mapEditorPayloadToSchema({
      timerEndDate: '2026-12-31',
      timerEndTime: '23:59',
      animationSpeed: 15,
    });

    expect(mapped.targetDate).toBe('2026-12-31');
    expect(mapped.targetTime).toBe('23:59');
    expect(mapped.messageAnimationSpeed).toBe(15);
  });

  it('leaves already-correct fields untouched', () => {
    const mapped = mapEditorPayloadToSchema({
      name: 'My Bar',
      showMessage: true,
      barHeight: 60,
    });

    expect(mapped.name).toBe('My Bar');
    expect(mapped.showMessage).toBe(true);
    expect(mapped.barHeight).toBe(60);
  });

  it('produces a fully schema-valid document for a realistic editor save payload', () => {
    const err = validate({
      name: 'Summer Sale',
      status: 'active',
      barType: 'countdown',
      message: '50% off everything!',
      showMessage: true,
      backgroundColor: '#667eea',
      gradientEndColor: '#764ba2',
      backgroundType: 'gradient',
      textColor: '#ffffff',
      fontSize: '16',
      fontFamily: 'Inter',
      fontWeight: '600',
      barHeight: 50,
      barPadding: 12,
      barPosition: 'top',
      animateMessage: false,
      animationSpeed: 20,
      showTimer: true,
      timerEndDate: '2026-12-31',
      timerEndTime: '23:59',
      showShopNowButton: true,
      shopNowButtonText: 'Shop Now',
      shopNowButtonUrl: 'https://example.com',
      shopNowButtonColor: '#ffffff',
      shopNowButtonBgColor: '#000000',
      showSaveBox: true,
      saveBoxText: 'SAVE 30%',
      saveBoxBgColor: '#ff4444',
      saveBoxTextColor: '#ffffff',
      startDate: '',
      endDate: '',
      showEmailForm: false,
    });

    expect(err).toBeUndefined();
  });
});
