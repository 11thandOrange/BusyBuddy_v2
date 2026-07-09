import type { LucideIcon } from 'lucide-react';

interface MonsterCharacterProps {
  variant: 1 | 2 | 3 | 4 | 5 | 6;
  color: string;
  icon: LucideIcon;
  size?: number;
  className?: string;
}

// Six original, simple flat-shape monster bodies. Each is a distinct
// silhouette (round, tall, wide, spiky, stacked, angular) so the six read as
// a family without being copies of one another. The held app icon renders as
// a normal HTML element positioned over the body's "hand" circle rather than
// being embedded in the SVG, so any lucide icon drops in cleanly.
function MonsterBody({ variant, color }: { variant: MonsterCharacterProps['variant']; color: string }) {
  const dark = shade(color, -0.35);
  const light = shade(color, 0.22);

  switch (variant) {
    case 1: // round body, single center horn, stubby arm
      return (
        <svg viewBox="0 0 200 200" className="h-full w-full">
          <ellipse cx="100" cy="185" rx="55" ry="10" fill="black" opacity="0.08" />
          <path d="M100 30 L112 55 L88 55 Z" fill={dark} />
          <circle cx="100" cy="110" r="70" fill={color} />
          <path d="M40 100 Q100 60 160 100 L160 130 Q100 170 40 130 Z" fill={light} opacity="0.5" />
          <circle cx="78" cy="105" r="16" fill="white" />
          <circle cx="122" cy="105" r="16" fill="white" />
          <circle cx="78" cy="108" r="7" fill="#1F2430" />
          <circle cx="122" cy="108" r="7" fill="#1F2430" />
          <path d="M85 140 Q100 150 115 140" stroke="#1F2430" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="152" cy="150" r="26" fill={dark} />
        </svg>
      );
    case 2: // tall teardrop body, two small horns, waving arm
      return (
        <svg viewBox="0 0 200 200" className="h-full w-full">
          <ellipse cx="100" cy="188" rx="50" ry="9" fill="black" opacity="0.08" />
          <path d="M75 40 L65 65 L85 60 Z" fill={dark} />
          <path d="M125 40 L135 65 L115 60 Z" fill={dark} />
          <path d="M100 45 C50 45 45 110 55 150 C65 185 135 185 145 150 C155 110 150 45 100 45 Z" fill={color} />
          <circle cx="82" cy="110" r="14" fill="white" />
          <circle cx="118" cy="110" r="14" fill="white" />
          <circle cx="82" cy="113" r="6" fill="#1F2430" />
          <circle cx="118" cy="113" r="6" fill="#1F2430" />
          <ellipse cx="100" cy="140" rx="10" ry="6" fill={dark} />
          <path d="M150 120 Q175 100 165 70" stroke={color} strokeWidth="14" fill="none" strokeLinecap="round" />
          <circle cx="163" cy="66" r="24" fill={dark} />
        </svg>
      );
    case 3: // wide squat body, big single eye, two arms out
      return (
        <svg viewBox="0 0 200 200" className="h-full w-full">
          <ellipse cx="100" cy="182" rx="62" ry="10" fill="black" opacity="0.08" />
          <ellipse cx="100" cy="120" rx="78" ry="58" fill={color} />
          <path d="M30 150 Q100 190 170 150 L170 165 Q100 200 30 165 Z" fill={light} opacity="0.5" />
          <path d="M40 115 Q20 100 30 75" stroke={color} strokeWidth="16" fill="none" strokeLinecap="round" />
          <circle cx="27" cy="70" r="22" fill={dark} />
          <path d="M160 115 Q182 130 172 155" stroke={color} strokeWidth="16" fill="none" strokeLinecap="round" />
          <circle cx="100" cy="112" r="30" fill="white" />
          <circle cx="100" cy="115" r="13" fill="#1F2430" />
          <circle cx="105" cy="110" r="4" fill="white" />
        </svg>
      );
    case 4: // spiky-top body, narrow build, one raised arm
      return (
        <svg viewBox="0 0 200 200" className="h-full w-full">
          <ellipse cx="100" cy="186" rx="48" ry="9" fill="black" opacity="0.08" />
          <path d="M65 55 L72 30 L82 52 M95 48 L100 20 L105 48 M118 52 L128 30 L135 55" fill={dark} />
          <rect x="55" y="50" width="90" height="115" rx="45" fill={color} />
          <circle cx="80" cy="105" r="13" fill="white" />
          <circle cx="120" cy="105" r="13" fill="white" />
          <circle cx="80" cy="108" r="5.5" fill="#1F2430" />
          <circle cx="120" cy="108" r="5.5" fill="#1F2430" />
          <path d="M78 135 Q100 148 122 135" stroke="#1F2430" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M145 110 Q170 95 168 65" stroke={color} strokeWidth="15" fill="none" strokeLinecap="round" />
          <circle cx="167" cy="60" r="23" fill={dark} />
        </svg>
      );
    case 5: // stacked two-tone body, sleepy eyes, arm at hip
      return (
        <svg viewBox="0 0 200 200" className="h-full w-full">
          <ellipse cx="100" cy="186" rx="54" ry="9" fill="black" opacity="0.08" />
          <path d="M50 90 Q100 55 150 90 L150 130 Q100 100 50 130 Z" fill={dark} />
          <ellipse cx="100" cy="135" rx="65" ry="50" fill={color} />
          <path d="M65 108 Q78 98 91 108" stroke="#1F2430" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M109 108 Q122 98 135 108" stroke="#1F2430" strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse cx="100" cy="150" rx="9" ry="6" fill={dark} />
          <path d="M148 140 Q172 148 168 172" stroke={color} strokeWidth="15" fill="none" strokeLinecap="round" />
          <circle cx="167" cy="176" r="20" fill={dark} />
        </svg>
      );
    case 6: // hexagon-ish body, antenna, two eyes offset
    default:
      return (
        <svg viewBox="0 0 200 200" className="h-full w-full">
          <ellipse cx="100" cy="186" rx="52" ry="9" fill="black" opacity="0.08" />
          <line x1="100" y1="45" x2="100" y2="20" stroke={dark} strokeWidth="5" strokeLinecap="round" />
          <circle cx="100" cy="16" r="8" fill={dark} />
          <path d="M100 45 L150 75 L150 135 L100 165 L50 135 L50 75 Z" fill={color} />
          <circle cx="85" cy="105" r="15" fill="white" />
          <circle cx="122" cy="115" r="12" fill="white" />
          <circle cx="85" cy="108" r="6.5" fill="#1F2430" />
          <circle cx="122" cy="118" r="5.5" fill="#1F2430" />
          <path d="M158 110 Q180 118 178 145" stroke={color} strokeWidth="14" fill="none" strokeLinecap="round" />
          <circle cx="177" cy="149" r="21" fill={dark} />
        </svg>
      );
  }
}

// Roughly matches the "hand" circle position drawn above for each variant,
// as a percentage box so the icon overlay lines up without re-deriving
// coordinates from the SVG path data.
const HAND_POSITION: Record<MonsterCharacterProps['variant'], { top: string; left: string }> = {
  1: { top: '75%', left: '76%' },
  2: { top: '33%', left: '81.5%' },
  3: { top: '35%', left: '13.5%' },
  4: { top: '30%', left: '83.5%' },
  5: { top: '88%', left: '83.5%' },
  6: { top: '74.5%', left: '88.5%' },
};

function shade(hex: string, amt: number) {
  const n = hex.replace('#', '');
  const num = parseInt(n, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  const adjust = (c: number) => Math.max(0, Math.min(255, Math.round(c + (amt >= 0 ? (255 - c) * amt : c * amt))));
  r = adjust(r);
  g = adjust(g);
  b = adjust(b);
  return `rgb(${r}, ${g}, ${b})`;
}

export function MonsterCharacter({ variant, color, icon: Icon, size = 140, className }: MonsterCharacterProps) {
  const hand = HAND_POSITION[variant];
  const iconSize = Math.round(size * 0.16);
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative' }}>
      <MonsterBody variant={variant} color={color} />
      <div
        className="absolute flex items-center justify-center rounded-full bg-white shadow-card"
        style={{
          top: hand.top,
          left: hand.left,
          width: iconSize * 1.9,
          height: iconSize * 1.9,
          transform: 'translate(-50%, -50%)',
          color,
        }}
      >
        <Icon size={iconSize} strokeWidth={2.2} />
      </div>
    </div>
  );
}
