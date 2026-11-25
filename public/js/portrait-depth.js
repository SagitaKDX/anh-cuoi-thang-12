const portrait = document.querySelector('.hero-portrait');
const mat = portrait?.querySelector('.portrait-mat');
const photograph = mat?.querySelector('img');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (portrait && mat && photograph) {
  // The original image remains the layout and content fallback without this module.
  const imageWindow = document.createElement('div');
  imageWindow.className = 'portrait-image-window';
  photograph.before(imageWindow);
  imageWindow.append(photograph);
  portrait.classList.add('depth-ready');

  let pointerX = 0;
  let pointerY = 0;
  let touchActive = false;
  let scrollProgress = 0;
  let visible = true;
  let frame = 0;
  const current = { x: 0, y: 0, lift: 0 };
  const target = { x: 0, y: 0, lift: 0 };
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function paint() {
    frame = 0;
    if (reducedMotion.matches || !visible) return;
    const smoothing = .12;
    current.x += (target.x - current.x) * smoothing;
    current.y += (target.y - current.y) * smoothing;
    current.lift += (target.lift - current.lift) * smoothing;
    mat.style.setProperty('--portrait-rx', `${current.x.toFixed(3)}deg`);
    mat.style.setProperty('--portrait-ry', `${current.y.toFixed(3)}deg`);
    mat.style.setProperty('--portrait-y', `${(-scrollProgress * 8).toFixed(2)}px`);
    mat.style.setProperty('--portrait-z', `${current.lift.toFixed(2)}px`);
    mat.style.setProperty('--portrait-shadow-x', `${(4 - current.y * 1.6).toFixed(2)}px`);
    mat.style.setProperty('--portrait-shadow-y', `${(20 + current.lift * .45).toFixed(2)}px`);
    mat.style.setProperty('--portrait-gloss-opacity', `${(.035 + Math.abs(current.y) * .014).toFixed(3)}`);
    if (Math.abs(target.x - current.x) + Math.abs(target.y - current.y) + Math.abs(target.lift - current.lift) > .025) frame = requestAnimationFrame(paint);
  }

  function schedule() {
    if (!frame && visible && !reducedMotion.matches) frame = requestAnimationFrame(paint);
  }

  function aim() {
    target.x = -pointerY * 5 + scrollProgress * 3;
    target.y = pointerX * 5;
    target.lift = Math.abs(pointerX) + Math.abs(pointerY) > .01 ? 12 : scrollProgress * 4;
    schedule();
  }

  function point(event) {
    if (event.pointerType === 'touch' && !touchActive) return;
    const rect = portrait.getBoundingClientRect();
    pointerX = clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
    pointerY = clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
    aim();
  }

  function settle() {
    touchActive = false;
    pointerX = 0;
    pointerY = 0;
    aim();
  }

  portrait.addEventListener('pointerdown', (event) => {
    touchActive = event.pointerType === 'touch';
    point(event);
  }, { passive: true });
  portrait.addEventListener('pointermove', point, { passive: true });
  portrait.addEventListener('pointerleave', settle, { passive: true });
  window.addEventListener('pointerup', settle, { passive: true });
  window.addEventListener('pointercancel', settle, { passive: true });

  function readScroll() {
    const hero = portrait.closest('.hero');
    const rect = hero.getBoundingClientRect();
    scrollProgress = clamp(-rect.top / Math.max(rect.height * .65, 1), 0, 1);
    aim();
  }
  window.addEventListener('scroll', readScroll, { passive: true });
  window.addEventListener('resize', readScroll, { passive: true });
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) readScroll();
    else if (frame) { cancelAnimationFrame(frame); frame = 0; }
  }, { rootMargin: '40px' });
  observer.observe(portrait);
  reducedMotion.addEventListener('change', () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (reducedMotion.matches) {
      ['--portrait-rx', '--portrait-ry', '--portrait-y', '--portrait-z', '--portrait-shadow-x', '--portrait-shadow-y', '--portrait-gloss-opacity'].forEach((property) => mat.style.removeProperty(property));
      current.x = 0; current.y = 0; current.lift = 0;
    } else readScroll();
  });
  readScroll();
}
