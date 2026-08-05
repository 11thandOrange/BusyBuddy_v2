import React from 'react';

export const ANNOUNCEMENT_BAR_BACKGROUND_THEMES = [
  { id: 'sunshine', label: 'Sunshine', css: 'linear-gradient(135deg, #FFD93D, #FF9F1C)' },
  { id: 'watercolor', label: 'Watercolor', css: 'linear-gradient(135deg, #A8E6CF, #DCEDC1, #FFD3B6, #FFAAA5)' },
  { id: 'abstract', label: 'Abstract', css: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)' },
  { id: 'ocean', label: 'Ocean', css: 'linear-gradient(135deg, #2193b0, #6dd5ed)' },
  { id: 'sunset', label: 'Sunset', css: 'linear-gradient(135deg, #ff6e7f, #bfe9ff)' },
  { id: 'midnight', label: 'Midnight', css: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' },
  { id: 'candy', label: 'Candy', css: 'linear-gradient(135deg, #ff9a9e, #a18cd1, #fbc2eb)' },
  { id: 'forest', label: 'Forest', css: 'linear-gradient(135deg, #134e5e, #71b280)' },
  { id: 'golden', label: 'Golden', css: 'linear-gradient(135deg, #f7971e, #ffd200)' },
  { id: 'berry', label: 'Berry', css: 'linear-gradient(135deg, #c31432, #240b36)' },
];

const DEFAULT_THEME = 'sunshine';

export function getBackgroundThemeCss(themeId) {
  const theme = ANNOUNCEMENT_BAR_BACKGROUND_THEMES.find((t) => t.id === themeId);
  return theme ? theme.css : ANNOUNCEMENT_BAR_BACKGROUND_THEMES[0].css;
}

/**
 * AnnouncementBarThemePicker - grid of visual swatches for choosing one of
 * the 10 preset background themes.
 */
export const AnnouncementBarThemePicker = ({ value = DEFAULT_THEME, onChange }) => {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '4px',
    }}>
      {ANNOUNCEMENT_BAR_BACKGROUND_THEMES.map((t) => {
        const selected = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              padding: '10px 6px', borderRadius: '8px', cursor: 'pointer',
              background: selected ? 'rgba(81, 105, 221, 0.15)' : 'rgba(255,255,255,0.04)',
              border: selected ? '1.5px solid #5169DD' : '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <div style={{ width: '100%', height: '32px', borderRadius: '6px', background: t.css }} />
            <span style={{
              fontSize: '11px', color: selected ? '#fff' : 'rgba(255,255,255,0.6)',
              fontWeight: selected ? 600 : 400,
            }}>
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
