import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apps } from '../data/apps';

const SLIDE_MS = 5000;
const QUEUE_SIZE = 4;

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function heroBackground(color: string) {
  return `radial-gradient(ellipse 80% 60% at 78% 30%, ${color}33, transparent 60%), linear-gradient(115deg, #0f1117 0%, #14171f 45%, ${color}1a 100%)`;
}

// Rotating hero for the six storefront apps: one app takes over the hero on
// a timer while the next few queue up as small cards, with a progress bar
// driving the auto-advance. Backgrounds are pure CSS gradients plus each
// app's own icon, so there's no external art dependency per slide.
export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const current = apps[active];
  const CurrentIcon = current.icon;

  const goTo = (index: number) => setActive(((index % apps.length) + apps.length) % apps.length);
  const goNext = () => goTo(active + 1);
  const goPrev = () => goTo(active - 1);

  const queue = Array.from({ length: QUEUE_SIZE }, (_, i) => {
    const index = (active + 1 + i) % apps.length;
    return { app: apps[index], index };
  });

  return (
    <section
      className="relative w-full overflow-hidden border-b border-surface-border pt-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[560px] sm:h-[620px] lg:h-[680px]">
        <div
          key={current.slug}
          className="absolute inset-0"
          style={{ background: heroBackground(current.color), animation: 'hero-bg-in 500ms ease' }}
        >
          <CurrentIcon
            aria-hidden
            size={560}
            strokeWidth={1}
            color={current.color}
            className="absolute -right-24 top-1/2 hidden -translate-y-1/2 opacity-[0.12] md:block"
          />
        </div>

        <div className="absolute top-16 left-0 right-0 z-20 h-[3px] bg-white/10">
          <div
            key={current.slug}
            className="h-full"
            style={{
              background: current.color,
              animation: `hero-progress ${SLIDE_MS}ms linear forwards`,
              animationPlayState: paused ? 'paused' : 'running',
            }}
            onAnimationEnd={goNext}
          />
        </div>

        <div className="relative z-10 mx-auto h-full max-w-container-lg px-6">
          <div className="flex h-full flex-col justify-center pb-32 sm:pb-16">
            <div key={current.slug} className="max-w-xl" style={{ animation: 'hero-text-in 450ms ease' }}>
              <div
                className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
                style={{ color: current.color }}
              >
                <CurrentIcon size={15} />
                BusyBuddy App &middot; {pad(active + 1)} / {pad(apps.length)}
              </div>
              <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl">{current.name}</h1>
              <p className="mt-4 max-w-md text-base text-content-secondary sm:text-lg">{current.tagline}</p>
              <p className="mt-3 max-w-lg text-sm text-content-muted">{current.description}</p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <a
                  href="https://apps.shopify.com/busybuddy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-button px-5 py-3 text-sm font-semibold text-white shadow-button transition-fast"
                  style={{ background: current.color }}
                >
                  Install BusyBuddy
                </a>
                <div className="text-xs text-content-muted">Available on {current.plans.join(', ')}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-6 z-20 flex items-center gap-2 sm:bottom-10">
          <button
            onClick={goPrev}
            aria-label="Previous app"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur-sm transition-fast hover:bg-black/50"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            onClick={goNext}
            aria-label="Next app"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur-sm transition-fast hover:bg-black/50"
          >
            <ChevronRight size={17} />
          </button>
        </div>

        <div className="absolute bottom-8 left-6 right-6 z-20 flex justify-end gap-2.5 overflow-hidden sm:bottom-10">
          {queue.map(({ app, index }, i) => {
            const Icon = app.icon;
            return (
              <Link
                key={app.slug}
                to={`/#app-${app.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(index);
                }}
                className="group hidden w-28 shrink-0 rounded-lg border border-white/10 bg-black/30 p-3 text-left backdrop-blur-sm transition-fast hover:border-white/25 hover:bg-black/45 sm:block"
                style={{ animation: `hero-card-in 400ms ease ${i * 60}ms both` }}
              >
                <div
                  className="mb-2 flex h-7 w-7 items-center justify-center rounded-md"
                  style={{ background: `${app.color}26`, color: app.color }}
                >
                  <Icon size={14} />
                </div>
                <div className="line-clamp-2 text-xs font-medium leading-snug text-white">{app.name}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
