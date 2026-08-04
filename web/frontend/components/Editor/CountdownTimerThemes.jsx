import React from 'react';

export const COUNTDOWN_TIMER_THEMES = [
  { id: 'classic', label: 'Classic Pill' },
  { id: 'segmented', label: 'Segmented Boxes' },
  { id: 'digital', label: 'Digital LCD' },
  { id: 'minimal', label: 'Minimal Text' },
  { id: 'outline', label: 'Outline Pill' },
  { id: 'gradient', label: 'Gradient Banner' },
  { id: 'ribbon', label: 'Corner Ribbon' },
  { id: 'neon', label: 'Neon Glow' },
  { id: 'split', label: 'Flip Cards' },
  { id: 'stacked', label: 'Stacked Compact' },
];

const DEFAULT_THEME = 'classic';

function shadeColor(hex, percent) {
  if (!hex || typeof hex !== 'string' || hex[0] !== '#') return hex;
  const num = parseInt(hex.slice(1), 16);
  if (Number.isNaN(num)) return hex;
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.min(255, Math.max(0, r + Math.round(255 * (percent / 100))));
  g = Math.min(255, Math.max(0, g + Math.round(255 * (percent / 100))));
  b = Math.min(255, Math.max(0, b + Math.round(255 * (percent / 100))));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function buildUnits({ days, hours, minutes, seconds }) {
  const units = [];
  if (days !== undefined && days !== null && days !== '' && Number(days) > 0) {
    units.push({ value: String(days).padStart(2, '0'), letter: 'D' });
  }
  units.push({ value: String(hours ?? '00').padStart(2, '0'), letter: 'H' });
  units.push({ value: String(minutes ?? '00').padStart(2, '0'), letter: 'M' });
  units.push({ value: String(seconds ?? '00').padStart(2, '0'), letter: 'S' });
  return units;
}

/**
 * CountdownTimerDisplay - renders one of the 10 visual themes for a countdown
 * timer. `bgColor`/`textColor` stay user-customizable regardless of theme.
 */
export const CountdownTimerDisplay = ({
  theme = DEFAULT_THEME,
  bgColor = '#C4290E',
  textColor = '#FFFFFF',
  days,
  hours = '00',
  minutes = '00',
  seconds = '00',
  label = 'Ends in:',
  showEmoji = false,
  style,
}) => {
  const units = buildUnits({ days, hours, minutes, seconds });
  const emojiPrefix = showEmoji ? '🔥 ' : '';

  switch (theme) {
    case 'segmented':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', ...style }}>
          {label && (
            <span style={{ color: textColor, fontSize: '11px', fontWeight: 600, marginRight: '4px' }}>
              {emojiPrefix}{label}
            </span>
          )}
          {units.map((u, i) => (
            <div key={i} style={{
              background: bgColor, borderRadius: '6px', padding: '4px 7px',
              textAlign: 'center', minWidth: '28px',
            }}>
              <div style={{ color: textColor, fontSize: '13px', fontWeight: 700, lineHeight: 1 }}>{u.value}</div>
              <div style={{ color: textColor, fontSize: '8px', opacity: 0.8, lineHeight: 1.4 }}>{u.letter}</div>
            </div>
          ))}
        </div>
      );

    case 'digital':
      return (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: '#111', borderRadius: '6px', padding: '6px 10px', ...style,
        }}>
          {label && <span style={{ color: textColor, fontSize: '10px', marginRight: '2px' }}>{emojiPrefix}{label}</span>}
          <span style={{
            color: bgColor, fontFamily: "'Courier New', monospace", fontSize: '15px',
            fontWeight: 700, letterSpacing: '1px',
          }}>
            {units.map((u) => u.value).join(':')}
          </span>
        </div>
      );

    case 'minimal':
      return (
        <div style={{
          display: 'inline-flex', alignItems: 'baseline', gap: '6px',
          borderBottom: `2px solid ${bgColor}`, paddingBottom: '2px', ...style,
        }}>
          {label && <span style={{ color: textColor, fontSize: '11px', opacity: 0.8 }}>{emojiPrefix}{label}</span>}
          <span style={{ color: bgColor, fontSize: '15px', fontWeight: 700 }}>
            {units.map((u) => u.value).join(':')}
          </span>
        </div>
      );

    case 'outline':
      return (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'transparent', border: `1.5px solid ${bgColor}`, borderRadius: '999px',
          padding: '5px 12px', ...style,
        }}>
          {label && <span style={{ color: bgColor, fontSize: '11px', fontWeight: 600 }}>{emojiPrefix}{label}</span>}
          <span style={{ color: bgColor, fontSize: '13px', fontWeight: 700 }}>
            {units.map((u) => u.value).join(':')}
          </span>
        </div>
      );

    case 'gradient':
      return (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: `linear-gradient(135deg, ${bgColor}, ${shadeColor(bgColor, -20)})`,
          borderRadius: '999px', padding: '6px 14px', ...style,
        }}>
          {label && <span style={{ color: textColor, fontSize: '11px', fontWeight: 600 }}>{emojiPrefix}{label}</span>}
          <span style={{ color: textColor, fontSize: '14px', fontWeight: 700 }}>
            {units.map((u) => u.value).join(':')}
          </span>
        </div>
      );

    case 'ribbon':
      return (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: bgColor, padding: '6px 14px 6px 10px',
          clipPath: 'polygon(0 0, 100% 0, 92% 50%, 100% 100%, 0 100%)',
          ...style,
        }}>
          {label && <span style={{ color: textColor, fontSize: '10px', fontWeight: 700 }}>{emojiPrefix}{label}</span>}
          <span style={{ color: textColor, fontSize: '13px', fontWeight: 700 }}>
            {units.map((u) => u.value).join(':')}
          </span>
        </div>
      );

    case 'neon':
      return (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: '#0a0a0a', borderRadius: '8px', padding: '6px 12px',
          border: `1px solid ${bgColor}`, ...style,
        }}>
          {label && (
            <span style={{ color: bgColor, fontSize: '10px', fontWeight: 600, textShadow: `0 0 6px ${bgColor}` }}>
              {emojiPrefix}{label}
            </span>
          )}
          <span style={{
            color: bgColor, fontSize: '14px', fontWeight: 700,
            textShadow: `0 0 8px ${bgColor}, 0 0 14px ${bgColor}`,
            fontFamily: "'Courier New', monospace",
          }}>
            {units.map((u) => u.value).join(':')}
          </span>
        </div>
      );

    case 'split':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', ...style }}>
          {label && (
            <span style={{ color: textColor, fontSize: '10px', fontWeight: 600, marginRight: '4px' }}>
              {emojiPrefix}{label}
            </span>
          )}
          {units.map((u, i) => (
            <div key={i} style={{
              position: 'relative', background: bgColor, borderRadius: '4px',
              padding: '4px 6px', minWidth: '22px', textAlign: 'center',
              borderBottom: `1px solid ${shadeColor(bgColor, -25)}`,
            }}>
              <div style={{
                position: 'absolute', left: 0, right: 0, top: '50%',
                borderTop: `1px solid ${shadeColor(bgColor, -30)}`,
              }} />
              <span style={{ color: textColor, fontSize: '13px', fontWeight: 700, fontFamily: "'Courier New', monospace" }}>
                {u.value}
              </span>
            </div>
          ))}
        </div>
      );

    case 'stacked':
      return (
        <div style={{
          display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
          background: bgColor, borderRadius: '8px', padding: '4px 10px', ...style,
        }}>
          {label && <span style={{ color: textColor, fontSize: '8px', opacity: 0.85 }}>{emojiPrefix}{label}</span>}
          <span style={{ color: textColor, fontSize: '14px', fontWeight: 700, lineHeight: 1.2 }}>
            {units.map((u) => u.value).join(':')}
          </span>
        </div>
      );

    case 'classic':
    default:
      return (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: bgColor, borderRadius: '8px', padding: '6px 10px', ...style,
        }}>
          <span style={{ color: textColor, fontSize: '12px', fontWeight: 500 }}>
            {emojiPrefix}{label} {units.map((u) => u.value).join(':')}
          </span>
        </div>
      );
  }
};

/**
 * CountdownThemePicker - grid of visual swatches for choosing a theme, each
 * rendered with the merchant's current bg/text colors and sample time.
 */
export const CountdownThemePicker = ({ value = DEFAULT_THEME, onChange, bgColor, textColor }) => {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '4px',
    }}>
      {COUNTDOWN_TIMER_THEMES.map((t) => {
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
            <div style={{ transform: 'scale(0.85)' }}>
              <CountdownTimerDisplay
                theme={t.id}
                bgColor={bgColor}
                textColor={textColor}
                hours="12"
                minutes="34"
                seconds="56"
                label="Ends in:"
              />
            </div>
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

export default CountdownTimerDisplay;
