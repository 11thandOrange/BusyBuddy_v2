import { useState } from 'react';
import { apps } from '../data/apps';
import { MonsterCharacter } from './MonsterCharacter';
import { AppWidgetIllustration } from './AppWidgetIllustration';
import { cn } from '../lib/cn';

// Original hero mechanic: six character cards sit in a row at the bottom.
// Clicking one rotates/scales it up to center stage, with title top,
// description left, and a widget illustration right - all keyed to the
// active app so the transition replays on every switch.
export function HeroCardTransition() {
  const [active, setActive] = useState(0);
  const current = apps[active];

  return (
    <section
      className="relative w-full overflow-hidden pt-16"
      style={{ background: `linear-gradient(180deg, ${current.color}14 0%, #FBF7F0 65%)` }}
    >
      <div className="relative mx-auto min-h-[720px] max-w-container-lg px-6 pb-56 pt-14 sm:pb-48">
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

          <div key={`monster-${current.slug}`} className="order-1 flex justify-center lg:order-2" style={{ animation: 'monster-spin-in 550ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <MonsterCharacter variant={current.monsterVariant} color={current.color} icon={current.icon} size={220} />
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

      <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-surface-border bg-white/70 backdrop-blur-sm">
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
