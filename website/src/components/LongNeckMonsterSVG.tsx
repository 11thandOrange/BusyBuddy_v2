import type { LucideIcon } from 'lucide-react';

interface LongNeckMonsterSVGProps {
  color: string;
  icon: LucideIcon;
  size?: number;
}

function shade(hex: string, amt: number) {
  const n = hex.replace('#', '');
  const num = parseInt(n, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const adjust = (c: number) => Math.max(0, Math.min(255, Math.round(c + (amt >= 0 ? (255 - c) * amt : c * amt))));
  return `rgb(${adjust(r)}, ${adjust(g)}, ${adjust(b)})`;
}

// A flat-SVG original creature (not the 3D/WebGL approach): a curved neck
// built from a single tapered path (not a stack of segments this time), two
// eyes, four legs, a tail, and a "fur" texture faked with rows of small
// teardrop tufts traced along the body/neck/tail outline - a cheap but
// effective substitute for a real fur shader in flat vector art.
function furRow(cx: number, cy: number, count: number, spread: number, tuftLen: number, angleDeg: number, seed: number) {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const rad = (angleDeg * Math.PI) / 180;
  const tufts: string[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const along = (t - 0.5) * spread;
    const px = cx + Math.cos(rad + Math.PI / 2) * along;
    const py = cy + Math.sin(rad + Math.PI / 2) * along;
    const len = tuftLen * (0.75 + rand() * 0.5);
    const wig = (rand() - 0.5) * 10;
    const tx = px + Math.cos(rad) * len + wig;
    const ty = py + Math.sin(rad) * len;
    tufts.push(`M ${px - 4} ${py} Q ${(px + tx) / 2} ${(py + ty) / 2} ${tx} ${ty} Q ${(px + tx) / 2 + 4} ${(py + ty) / 2} ${px + 4} ${py} Z`);
  }
  return tufts;
}

export function LongNeckMonsterSVG({ color, icon: Icon, size = 260 }: LongNeckMonsterSVGProps) {
  const dark = shade(color, -0.38);
  const light = shade(color, 0.32);

  const bodyFur = furRow(118, 166, 10, 110, 14, -90, 5);
  const neckFur = furRow(99, 115, 6, 108, 12, 180, 21).concat(furRow(139, 115, 6, 108, 12, 0, 34));

  return (
    <div style={{ width: size, height: size }}>
      <svg viewBox="0 0 240 260" className="h-full w-full">
        <ellipse cx="118" cy="238" rx="58" ry="10" fill="black" opacity="0.08" />

        {/* tail */}
        <path d="M60 210 Q30 220 28 195 Q26 178 45 182" fill={color} stroke={dark} strokeWidth="2" />

        {/* back legs */}
        <rect x="70" y="205" width="16" height="34" rx="8" fill={dark} />
        <rect x="150" y="205" width="16" height="34" rx="8" fill={dark} />
        {/* front legs */}
        <rect x="95" y="212" width="16" height="30" rx="8" fill={color} stroke={dark} strokeWidth="2" />
        <rect x="128" y="212" width="16" height="30" rx="8" fill={color} stroke={dark} strokeWidth="2" />
        {/* feet */}
        {[78, 158, 103, 136].map((x, i) => (
          <ellipse key={i} cx={x} cy={i < 2 ? 240 : 244} rx="11" ry="7" fill="white" stroke={dark} strokeWidth="1.5" />
        ))}

        {/* body */}
        <ellipse cx="118" cy="205" rx="62" ry="42" fill={color} stroke={dark} strokeWidth="2.5" />
        <ellipse cx="118" cy="212" rx="34" ry="20" fill={light} opacity="0.55" />

        {/* body fur tufts */}
        {bodyFur.map((d, i) => (
          <path key={`bf-${i}`} d={d} fill={i % 2 === 0 ? light : color} stroke={dark} strokeWidth="0.75" opacity="0.9" />
        ))}

        {/* right arm holding the icon */}
        <path d="M172 190 Q198 178 200 152" stroke={color} strokeWidth="15" fill="none" strokeLinecap="round" />
        <path d="M172 190 Q198 178 200 152" stroke={dark} strokeWidth="15" fill="none" strokeLinecap="round" opacity="0.15" />
        <circle cx="200" cy="146" r="22" fill="white" stroke={dark} strokeWidth="2" />
        <g transform="translate(200 146)">
          <foreignObject x="-11" y="-11" width="22" height="22">
            <div
              style={{
                width: 22,
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color,
              }}
            >
              <Icon size={16} strokeWidth={2.4} />
            </div>
          </foreignObject>
        </g>

        {/* left arm */}
        <path d="M64 195 Q40 200 34 178" stroke={color} strokeWidth="14" fill="none" strokeLinecap="round" />

        {/* neck - single tapered curve */}
        <path
          d="M96 175 C88 130 92 85 108 55 C112 47 128 47 132 55 C140 85 140 130 140 175 Z"
          fill={color}
          stroke={dark}
          strokeWidth="2.5"
        />
        {/* neck fur tufts */}
        {neckFur.map((d, i) => (
          <path key={`nf-${i}`} d={d} fill={i % 2 === 0 ? light : color} stroke={dark} strokeWidth="0.7" opacity="0.9" />
        ))}

        {/* head */}
        <ellipse cx="120" cy="48" rx="30" ry="26" fill={color} stroke={dark} strokeWidth="2.5" />
        {/* two small ear tufts */}
        <path d="M98 30 Q92 16 104 20 Q104 28 98 30 Z" fill={dark} />
        <path d="M142 30 Q148 16 136 20 Q136 28 142 30 Z" fill={dark} />

        {/* two eyes */}
        <circle cx="107" cy="46" r="12" fill="white" stroke={dark} strokeWidth="1.5" />
        <circle cx="133" cy="46" r="12" fill="white" stroke={dark} strokeWidth="1.5" />
        <circle cx="109" cy="48" r="5.5" fill="#1F2430" />
        <circle cx="135" cy="48" r="5.5" fill="#1F2430" />
        <circle cx="111" cy="45" r="1.6" fill="white" />
        <circle cx="137" cy="45" r="1.6" fill="white" />

        {/* small smile */}
        <path d="M110 64 Q120 70 130 64" stroke={dark} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}
