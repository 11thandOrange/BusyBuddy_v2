import { useState } from 'react';
import { apps } from '../data/apps';
import { LongNeckMonster3D } from './LongNeckMonster3D';
import { MonsterCharacter } from './MonsterCharacter';
import { AppWidgetIllustration } from './AppWidgetIllustration';
import { cn } from '../lib/cn';

function pastel(hex: string) {
  const n = hex.replace('#', '');
  const num = parseInt(n, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const mix = (c: number) => Math.round(c + (255 - c) * 0.72);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

// Original hero mechanic: six character cards sit in a row at the bottom.
// Clicking one rotates the active monster to center stage in real 3D, with
// title top, description left, and a widget illustration right - all keyed
// to the active app. The full section (including the space behind the
// fixed header) is filled with a solid pastel wash of the active app's
// color, matched by <Home> making the header transparent on this page.
export function HeroCardTransition() {
  const [active, setActive] = useState(0);
  const current = apps[active];

  return (
    <section
      className="relative min-h-screen w-full overflow-hidden"
      style={{ background: pastel(current.color), transition: 'background 400ms ease' }}
    >
      <div className="relative mx-auto max-w-container-lg px-6 pb-56 pt-32 sm:pb-48">
        <div key={`title-${current.slug}`} className="text-center" style={{ animation: 'panel-rise-in 400ms ease' }}>
          <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: current.color }}>
            Meet the BusyBuddy apps
          </div>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight text-content sm:text-5xl">{current.name}</h1>
        </div>

        <div className="mt-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_auto_1fr]">
          <div
            key={`desc-${current.slug}`}
            className="order-2 lg:order-1"
            style={{ animation: 'panel-slide-in-left 450ms ease' }}
          >
            <p className="text-base text-content-secondary sm:text-lg">{current.tagline}</p>
            <p className="mt-3 max-w-sm prose-body">{current.description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href="https://apps.shopify.com/busybuddy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-button px-5 py-2.5 text-sm font-semibold text-white shadow-button transition-fast"
                style={{ background: current.color }}
              >
                Install BusyBuddy
              </a>
              <div className="text-xs text-content-muted">Available on {current.plans.join(', ')}</div>
            </div>
          </div>

          <div key={`monster-${current.slug}`} className="order-1 flex justify-center lg:order-2">
            <LongNeckMonster3D color={current.color} icon={current.icon} size={280} />
          </div>

          <div
            key={`widget-${current.slug}`}
            className="order-3 mx-auto w-full max-w-xs"
            style={{ animation: 'panel-slide-in-right 450ms ease' }}
          >
            <AppWidgetIllustration appSlug={current.slug} color={current.color} />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-black/5 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-container-lg items-end justify-center gap-3 overflow-x-auto px-6 py-5 sm:justify-between">
          {apps.map((app, i) => {
            const isActive = i === active;
            return (
              <button
                key={app.slug}
                onClick={() => setActive(i)}
                className={cn(
                  'flex shrink-0 flex-col items-center gap-1.5 rounded-xl p-2 transition-fast',
                  isActive ? 'scale-110' : 'opacity-60 hover:opacity-100'
                )}
              >
                <MonsterCharacter variant={app.monsterVariant} color={app.color} icon={app.icon} size={56} />
                <span
                  className={cn('hidden text-[11px] font-medium sm:block', isActive ? 'text-content' : 'text-content-muted')}
                >
                  {app.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
