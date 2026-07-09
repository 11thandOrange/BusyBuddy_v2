interface AppWidgetIllustrationProps {
  appSlug: string;
  color: string;
}

// Simplified, original mockups of a storefront browser window showing each
// app's widget in context - abstract enough to not represent any real
// screenshot, just enough detail to communicate what each app does.
export function AppWidgetIllustration({ appSlug, color }: AppWidgetIllustrationProps) {
  return (
    <svg viewBox="0 0 320 260" className="h-full w-full">
      {/* browser chrome */}
      <rect x="10" y="10" width="300" height="240" rx="14" fill="white" stroke="#E4DED2" strokeWidth="2" />
      <rect x="10" y="10" width="300" height="30" rx="14" fill="#F3EDE0" />
      <circle cx="26" cy="25" r="4" fill="#E4A2A2" />
      <circle cx="38" cy="25" r="4" fill="#E7CE9C" />
      <circle cx="50" cy="25" r="4" fill="#A7D3B0" />

      {widgetContent(appSlug, color)}
    </svg>
  );
}

function widgetContent(appSlug: string, color: string) {
  switch (appSlug) {
    case 'announcement-bar':
      return (
        <g>
          <rect x="10" y="40" width="300" height="24" fill={color} />
          <rect x="120" y="48" width="80" height="8" rx="4" fill="white" opacity="0.85" />
          <rect x="30" y="90" width="260" height="60" rx="6" fill="#F3EDE0" />
          <rect x="30" y="170" width="120" height="10" rx="5" fill="#E4DED2" />
          <rect x="30" y="190" width="180" height="10" rx="5" fill="#E4DED2" />
        </g>
      );
    case 'inactive-tab-message':
      return (
        <g>
          <rect x="30" y="55" width="260" height="16" rx="4" fill="#F3EDE0" />
          <rect x="30" y="90" width="260" height="70" rx="6" fill="#F3EDE0" />
          <rect x="220" y="40" width="70" height="22" rx="11" fill={color} />
          <rect x="232" y="47" width="46" height="8" rx="4" fill="white" opacity="0.85" />
          <rect x="30" y="180" width="150" height="10" rx="5" fill="#E4DED2" />
        </g>
      );
    case 'bundle-discounts':
      return (
        <g>
          <rect x="30" y="50" width="120" height="120" rx="8" fill="#F3EDE0" />
          <rect x="30" y="185" width="120" height="10" rx="5" fill="#E4DED2" />
          <rect x="170" y="55" width="120" height="34" rx="8" fill={color} opacity="0.15" />
          <rect x="182" y="65" width="96" height="8" rx="4" fill={color} />
          <rect x="182" y="80" width="60" height="7" rx="3.5" fill={color} opacity="0.6" />
          <rect x="170" y="100" width="120" height="34" rx="8" fill="white" stroke="#E4DED2" strokeWidth="2" />
          <rect x="170" y="145" width="120" height="34" rx="8" fill="white" stroke="#E4DED2" strokeWidth="2" />
          <rect x="170" y="192" width="120" height="26" rx="13" fill={color} />
        </g>
      );
    case 'buy-one-get-one':
      return (
        <g>
          <rect x="30" y="50" width="110" height="110" rx="8" fill="#F3EDE0" />
          <rect x="30" y="172" width="70" height="9" rx="4.5" fill="#E4DED2" />
          <rect x="30" y="188" width="45" height="9" rx="4.5" fill={color} opacity="0.7" />
          <circle cx="180" cy="105" r="34" fill={color} opacity="0.15" />
          <path d="M180 88 v34 M164 105 h32" stroke={color} strokeWidth="6" strokeLinecap="round" />
          <rect x="235" y="70" width="55" height="70" rx="8" fill="white" stroke="#E4DED2" strokeWidth="2" />
          <rect x="150" y="180" width="140" height="26" rx="13" fill={color} />
        </g>
      );
    case 'volume-discounts':
      return (
        <g>
          <rect x="30" y="50" width="260" height="34" rx="8" fill="white" stroke="#E4DED2" strokeWidth="2" />
          <rect x="42" y="60" width="60" height="8" rx="4" fill="#E4DED2" />
          <rect x="240" y="58" width="38" height="16" rx="8" fill="#E4DED2" />
          <rect x="30" y="94" width="260" height="34" rx="8" fill={color} opacity="0.12" stroke={color} strokeWidth="2" />
          <rect x="42" y="104" width="70" height="8" rx="4" fill={color} />
          <rect x="240" y="102" width="38" height="16" rx="8" fill={color} />
          <rect x="30" y="138" width="260" height="34" rx="8" fill="white" stroke="#E4DED2" strokeWidth="2" />
          <rect x="42" y="148" width="80" height="8" rx="4" fill="#E4DED2" />
          <rect x="240" y="146" width="38" height="16" rx="8" fill="#E4DED2" />
          <rect x="30" y="192" width="260" height="26" rx="13" fill={color} />
        </g>
      );
    case 'mix-and-match':
    default:
      return (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={30 + (i % 2) * 68}
              y={50 + Math.floor(i / 2) * 68}
              width="58"
              height="58"
              rx="8"
              fill={i % 3 === 0 ? color : '#F3EDE0'}
              opacity={i % 3 === 0 ? 0.85 : 1}
            />
          ))}
          <rect x="180" y="50" width="110" height="76" rx="8" fill="white" stroke="#E4DED2" strokeWidth="2" />
          <rect x="192" y="62" width="70" height="8" rx="4" fill="#E4DED2" />
          <rect x="192" y="78" width="86" height="8" rx="4" fill="#E4DED2" />
          <rect x="192" y="94" width="50" height="8" rx="4" fill={color} />
          <rect x="30" y="192" width="260" height="26" rx="13" fill={color} />
        </g>
      );
  }
}
