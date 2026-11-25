let scrollMomentsController;

/** Enhance the existing invitation without changing its text, layout order or controls. */
export function initScrollMoments() {
  if (scrollMomentsController) return scrollMomentsController;

  const page = document.documentElement;
  const invitation = document.querySelector('#invitation');
  if (!invitation || !('IntersectionObserver' in window)) return null;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pendingReveals = new Set();
  const dateSection = invitation.querySelector('.date-section');
  const datePlane = dateSection?.querySelector('.date-layout > div:first-child');
  const rail = document.createElement('div');
  const progress = document.createElement('span');
  rail.className = 'scroll-reading-progress';
  rail.setAttribute('aria-hidden', 'true');
  rail.append(progress);
  document.body.append(rail);

  let revealObserver;
  let dateObserver;
  let dateInView = false;
  let dateFinished = false;
  let frame = 0;
  let listening = false;
  let disposed = false;
  let lastProgress = -1;
  let lastDateProgress = -1;

  const clamp = (value) => Math.max(0, Math.min(1, value));
  const mark = (element, className, delay = 0) => {
    element.classList.add(className);
    element.style.setProperty('--moment-delay', `${delay}ms`);
    const bounds = element.getBoundingClientRect();
    if (bounds.top < window.innerHeight - 24) {
      element.classList.add('is-scroll-visible');
    } else {
      pendingReveals.add(element);
    }
  };

  invitation.querySelectorAll('.family-section > h2, .story-intro > h2, .venue-copy > h2, .rsvp-copy > h2, .section-heading, .footer-sign > p').forEach((heading) => {
    mark(heading, 'scroll-heading');
  });
  invitation.querySelectorAll('.story-chapters > details').forEach((chapter, index) => {
    mark(chapter, 'scroll-chapter', Math.min(index * 45, 135));
  });
  invitation.querySelectorAll('.event-timeline > li').forEach((row, index) => {
    mark(row, 'scroll-timeline-row', Math.min(index * 35, 105));
  });
  datePlane?.classList.add('scroll-date-plane');

  function flattenDate() {
    datePlane?.style.setProperty('--date-fold-angle', '0deg');
    datePlane?.style.setProperty('--date-lift', '0px');
    datePlane?.classList.remove('is-scroll-tracking');
    dateFinished = true;
    dateInView = false;
    dateObserver?.disconnect();
  }

  function renderScroll() {
    frame = 0;
    if (disposed || document.hidden || reducedMotion.matches) return;

    const viewportHeight = window.innerHeight;
    const scrollable = document.documentElement.scrollHeight - viewportHeight;
    const reading = scrollable > 0 ? clamp(window.scrollY / scrollable) : 1;
    if (Math.abs(reading - lastProgress) > .0001) {
      rail.style.setProperty('--reading-progress', reading.toFixed(4));
      lastProgress = reading;
    }

    if (dateInView && datePlane && !dateFinished) {
      const bounds = dateSection.getBoundingClientRect();
      const unfold = clamp((viewportHeight - bounds.top) / (viewportHeight * .6));
      if (Math.abs(unfold - lastDateProgress) > .001) {
        // This is one paper plane; the neighbouring countdown never moves.
        datePlane.style.setProperty('--date-fold-angle', `${(12 * (1 - unfold)).toFixed(3)}deg`);
        datePlane.style.setProperty('--date-lift', `${(18 * (1 - unfold)).toFixed(3)}px`);
        lastDateProgress = unfold;
      }
      if (unfold >= 1) flattenDate();
    }
  }

  function requestRender() {
    if (!frame && !disposed && !reducedMotion.matches) frame = window.requestAnimationFrame(renderScroll);
  }

  function startListening() {
    if (listening) return;
    window.addEventListener('scroll', requestRender, { passive: true });
    window.addEventListener('resize', requestRender, { passive: true });
    document.addEventListener('visibilitychange', requestRender);
    listening = true;
    requestRender();
  }

  function stopListening() {
    window.removeEventListener('scroll', requestRender);
    window.removeEventListener('resize', requestRender);
    document.removeEventListener('visibilitychange', requestRender);
    listening = false;
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
  }

  function showAll() {
    pendingReveals.forEach((element) => element.classList.add('is-scroll-visible'));
    pendingReveals.clear();
    revealObserver?.disconnect();
    flattenDate();
  }

  function syncMotionPreference() {
    page.classList.toggle('scroll-motion-reduced', reducedMotion.matches);
    if (reducedMotion.matches) {
      showAll();
      stopListening();
    } else {
      startListening();
    }
  }

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-scroll-visible');
      pendingReveals.delete(entry.target);
      revealObserver.unobserve(entry.target);
    });
    if (pendingReveals.size === 0) revealObserver.disconnect();
  }, { rootMargin: '0px 0px -5% 0px', threshold: .08 });
  pendingReveals.forEach((element) => revealObserver.observe(element));

  if (dateSection && datePlane) {
    const bounds = dateSection.getBoundingClientRect();
    if (bounds.bottom <= 0) {
      flattenDate();
    } else {
      dateObserver = new IntersectionObserver((entries) => {
        const entry = entries[0];
        dateInView = entry.isIntersecting && !dateFinished;
        datePlane.classList.toggle('is-scroll-tracking', dateInView);
        if (dateInView) requestRender();
      }, { rootMargin: '10% 0px', threshold: 0 });
      dateObserver.observe(dateSection);
    }
  }

  // Only activate visual start states after every observer is ready.
  page.classList.add('js', 'motion-ready', 'scroll-moments-ready');
  reducedMotion.addEventListener('change', syncMotionPreference);
  syncMotionPreference();

  scrollMomentsController = {
    dispose() {
      if (disposed) return;
      disposed = true;
      showAll();
      stopListening();
      reducedMotion.removeEventListener('change', syncMotionPreference);
      rail.remove();
      page.classList.remove('scroll-moments-ready', 'scroll-motion-reduced');
      scrollMomentsController = undefined;
    },
  };
  return scrollMomentsController;
}
