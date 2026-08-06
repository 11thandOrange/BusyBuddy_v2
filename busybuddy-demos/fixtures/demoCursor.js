/**
 * Playwright's own video capture (`video: 'on'` in playwright.config.js)
 * records the page's rendered frames, but it never draws an OS mouse
 * cursor into that recording - a raw Playwright run just shows elements
 * changing state with no visible pointer, even though real mousemove/
 * mousedown/mouseup DOM events are dispatched at real coordinates for
 * every `.click()`/`.hover()`. This installs a synthetic cursor dot +
 * click-ripple overlay driven by those same real events, so the recorded
 * .webm visually shows each click the way a human screen recording would.
 *
 * Mirrors playwright.config.js's RECORD_DEMOS flag: skipped entirely on a
 * fast pass/fail-only run (RECORD_DEMOS=false), so this never slows down
 * or risks flaking a non-recording run.
 */
export const RECORD = process.env.RECORD_DEMOS !== 'false';

const CURSOR_SCRIPT = `
(() => {
  if (window.__demoCursorInstalled) return;
  window.__demoCursorInstalled = true;

  const dot = document.createElement('div');
  const ripple = document.createElement('div');
  dot.id = '__demo-cursor-dot';
  ripple.id = '__demo-cursor-ripple';
  const baseStyle = 'position:fixed;pointer-events:none;z-index:2147483647;border-radius:50%;';
  dot.style.cssText = baseStyle + 'width:16px;height:16px;background:rgba(255,64,64,0.9);border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,0.5);transform:translate(-50%,-50%);left:-100px;top:-100px;transition:left 0.05s linear,top 0.05s linear;';
  ripple.style.cssText = baseStyle + 'width:36px;height:36px;border:3px solid rgba(255,64,64,0.9);transform:translate(-50%,-50%) scale(0);opacity:0;left:-100px;top:-100px;';

  const attach = () => {
    if (document.body) {
      document.body.appendChild(dot);
      document.body.appendChild(ripple);
    } else {
      requestAnimationFrame(attach);
    }
  };
  attach();

  window.addEventListener('mousemove', (e) => {
    dot.style.left = e.clientX + 'px';
    dot.style.top = e.clientY + 'px';
  }, true);

  const flashRipple = (x, y) => {
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.transition = 'none';
    ripple.style.transform = 'translate(-50%,-50%) scale(0)';
    ripple.style.opacity = '1';
    requestAnimationFrame(() => {
      ripple.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease-out';
      ripple.style.transform = 'translate(-50%,-50%) scale(1)';
      ripple.style.opacity = '0';
    });
  };

  window.addEventListener('mousedown', (e) => flashRipple(e.clientX, e.clientY), true);
})();
`;

/**
 * Injects the cursor overlay into a page or popup. No-ops when RECORD is
 * false. Must be called before navigation for `page` (addInitScript only
 * applies to documents loaded after it's registered), and again on any
 * popup/new tab Playwright hands back, since each is a separate Page with
 * its own document.
 */
export async function installDemoCursor(pageOrPopup) {
  if (!RECORD) return;
  await pageOrPopup.addInitScript(CURSOR_SCRIPT);
}

/**
 * Deliberate pacing between logical steps so a human watching the
 * recording can actually register each one, instead of automation-speed
 * actions blurring together. No-ops when RECORD is false, so normal
 * (non-recording) runs stay fast.
 */
export async function demoPause(page, ms = 600) {
  if (!RECORD) return;
  await page.waitForTimeout(ms);
}
