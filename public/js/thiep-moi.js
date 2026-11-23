// 1. Three.js 3D Floating Petals & Golden Particles with Graceful Fallback
let triggerBurst = () => {};
(async function initThree() {
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotionQuery.matches) return;

  try {
    const THREE = await import('https://unpkg.com/three@0.170.0/build/three.module.js');
    const canvas = document.getElementById('three-bg');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const dpr = window.devicePixelRatio || 1;
    renderer.setPixelRatio(Math.min(dpr, isMobile ? 1.3 : 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 18;

    // 3D Rose & Gold Petals (~40% reduction on mobile)
    const petalGeo = new THREE.PlaneGeometry(0.42, 0.56, 2, 2);
    const pos = petalGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, (x * x + y * y) * 0.45);
    }
    petalGeo.computeVertexNormals();

    const petalColors = [0xfda4af, 0xfb7185, 0xfde68a, 0xfecdd3];
    const petals = [];
    const petalCount = isMobile ? 28 : 48;
    for (let i = 0; i < petalCount; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: petalColors[i % petalColors.length],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.72,
      });
      const mesh = new THREE.Mesh(petalGeo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 26,
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 10
      );
      mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      mesh.userData = {
        vy: 0.015 + Math.random() * 0.025,
        vx: (Math.random() - 0.5) * 0.012,
        rx: (Math.random() - 0.5) * 0.03,
        ry: (Math.random() - 0.5) * 0.03,
      };
      scene.add(mesh);
      petals.push(mesh);
    }

    // Golden Stardust Motes (~40% reduction on mobile)
    const dustCount = isMobile ? 54 : 90;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPos[i] = (Math.random() - 0.5) * 28;
      dustPos[i + 1] = (Math.random() - 0.5) * 20;
      dustPos[i + 2] = (Math.random() - 0.5) * 12;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({ color: 0xfde68a, size: 0.14, transparent: true, opacity: 0.75 });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // Celebration Burst Particles (~40% reduction on mobile)
    const burstGroup = [];
    const burstCount = isMobile ? 22 : 36;
    triggerBurst = () => {
      for (let i = 0; i < burstCount; i++) {
        const mat = new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0xfde68a : 0xfb7185,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 1,
        });
        const m = new THREE.Mesh(petalGeo, mat);
        m.position.set(0, 0, 4);
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.08 + Math.random() * 0.18;
        m.userData = {
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed + 0.04,
          vz: (Math.random() - 0.5) * 0.12,
          life: 1,
        };
        scene.add(m);
        burstGroup.push(m);
      }
    };

    let targetCamX = 0;
    let targetCamY = 0;
    window.addEventListener('pointermove', (e) => {
      targetCamX = (e.clientX / window.innerWidth - 0.5) * 1.4;
      targetCamY = -(e.clientY / window.innerHeight - 0.5) * 1.0;
    }, { passive: true });

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Pause Three when document.hidden or canvas is not intersecting
    let isVisible = !document.hidden;
    let isIntersecting = true;
    let animId = null;

    function renderLoop() {
      if (!isVisible || !isIntersecting) {
        animId = null;
        return;
      }
      animId = requestAnimationFrame(renderLoop);

      camera.position.x += (targetCamX - camera.position.x) * 0.04;
      camera.position.y += (targetCamY - camera.position.y) * 0.04;

      for (const p of petals) {
        p.position.y -= p.userData.vy;
        p.position.x += p.userData.vx + Math.sin(p.position.y * 0.5) * 0.008;
        p.rotation.x += p.userData.rx;
        p.rotation.y += p.userData.ry;
        if (p.position.y < -11) p.position.y = 11;
      }

      dust.rotation.y += 0.0008;

      for (let i = burstGroup.length - 1; i >= 0; i--) {
        const b = burstGroup[i];
        b.position.x += b.userData.vx;
        b.position.y += b.userData.vy;
        b.position.z += b.userData.vz;
        b.userData.vy -= 0.0035;
        b.userData.life -= 0.015;
        b.material.opacity = Math.max(0, b.userData.life);
        b.rotation.z += 0.08;
        if (b.userData.life <= 0) {
          scene.remove(b);
          burstGroup.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    }

    function checkActive() {
      const shouldRun = isVisible && isIntersecting;
      if (shouldRun && !animId) {
        animId = requestAnimationFrame(renderLoop);
      }
    }

    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
      checkActive();
    });

    const canvasObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isIntersecting = entry.isIntersecting;
        checkActive();
      });
    }, { threshold: 0.01 });
    canvasObserver.observe(canvas);

    checkActive();
  } catch {
    // WebGL unavailable in weak in-app browser: silent fallback
  }
})();

// Reduced motion state & listener
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = reducedMotionQuery.matches;
reducedMotionQuery.addEventListener('change', (e) => {
  reducedMotion = e.matches;
  if (reducedMotion && tiltCard) {
    tiltCard.style.transform = '';
  }
});

// 2. 3D Envelope Open & Replay
const envelope = document.getElementById('envelope');
function openEnvelope() {
  envelope.classList.add('is-opening');
  triggerBurst();
  if (!musicOn) toggleMusic(true);
  setTimeout(() => envelope.classList.add('is-open'), 1250);
}
document.getElementById('open-seal').addEventListener('click', openEnvelope);
document.getElementById('open-btn').addEventListener('click', openEnvelope);
document.getElementById('replay-btn').addEventListener('click', () => {
  envelope.classList.remove('is-open', 'is-opening');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 3. 3D Parallax Tilt on Couple Photo Arch (Guarded by reducedMotion)
const tiltCard = document.getElementById('tilt-card');
if (tiltCard) {
  const applyTilt = (clientX, clientY) => {
    if (reducedMotion) return;
    const rect = tiltCard.getBoundingClientRect();
    const x = Math.max(-0.5, Math.min(0.5, (clientX - rect.left) / rect.width - 0.5));
    const y = Math.max(-0.5, Math.min(0.5, (clientY - rect.top) / rect.height - 0.5));
    tiltCard.style.transform = `rotateY(${x * 16}deg) rotateX(${-y * 14}deg) scale(1.02)`;
  };
  tiltCard.addEventListener('pointermove', (e) => applyTilt(e.clientX, e.clientY));
  tiltCard.addEventListener('touchmove', (e) => {
    if (e.touches[0]) applyTilt(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  tiltCard.addEventListener('pointerleave', () => {
    tiltCard.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
  });
  tiltCard.addEventListener('touchend', () => {
    tiltCard.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
  });
}

// 4. Scroll Reveal + Parallax Depth (--py) & Scroll Flight (--scroll-p)
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

function updateScrollParallax() {
  const y = window.scrollY;
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const scrollP = Math.max(0, Math.min(1, y / maxScroll));

  document.body.classList.toggle('scrolled', y > 120);

  if (reducedMotion) {
    document.documentElement.style.removeProperty('--py');
    document.documentElement.style.removeProperty('--scroll-p');
    return;
  }

  const py = Math.max(-1, Math.min(1, y / Math.max(window.innerHeight, 500)));
  document.documentElement.style.setProperty('--py', py.toFixed(3));
  document.documentElement.style.setProperty('--scroll-p', scrollP.toFixed(3));
}
window.addEventListener('scroll', updateScrollParallax, { passive: true });
updateScrollParallax();

// 5. Countdown
const targetMs = new Date('2026-12-20T17:00:00+07:00').getTime();
function updateCountdown() {
  const diff = Math.max(0, targetMs - Date.now());
  document.getElementById('cd-days').textContent = Math.floor(diff / 86400000);
  document.getElementById('cd-hours').textContent = String(Math.floor((diff / 3600000) % 24)).padStart(2, '0');
  document.getElementById('cd-mins').textContent = String(Math.floor((diff / 60000) % 60)).padStart(2, '0');
  document.getElementById('cd-secs').textContent = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

// 6. Modals & RSVP
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.getElementById('open-rsvp').addEventListener('click', () => {
  document.getElementById('rsvp-form').style.display = 'grid';
  document.getElementById('rsvp-done').style.display = 'none';
  openModal('rsvp-modal');
});
document.getElementById('open-gift').addEventListener('click', () => openModal('gift-modal'));
document.querySelectorAll('[data-close]').forEach((btn) => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});
document.querySelectorAll('.modal-backdrop').forEach((bg) => {
  bg.addEventListener('click', (e) => {
    if (e.target === bg) bg.classList.remove('open');
  });
});

document.getElementById('rsvp-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('guest-name').value.trim();
  const wish = document.getElementById('guest-wish').value.trim();
  if (name && wish) {
    const card = document.createElement('div');
    card.className = 'wish-item';
    const strong = document.createElement('strong');
    strong.style.color = 'var(--crimson)';
    strong.textContent = name;
    const p = document.createElement('p');
    p.style.cssText = 'margin: 6px 0 0; color: var(--ink-soft); font-size: 0.94rem;';
    p.textContent = wish;
    card.appendChild(strong);
    card.appendChild(p);
    document.getElementById('wish-list').prepend(card);
  }
  document.getElementById('rsvp-form').style.display = 'none';
  document.getElementById('rsvp-done').style.display = 'block';
});

// 7. Real YouTube Track: 7o5XAg_EeLw (start at 1s) via YouTube IFrame API
let musicOn = false;
let ytPlayer = null;
let ytReady = false;
let pendingPlay = false;
const musicBtn = document.getElementById('music-btn');
const musicLabel = document.getElementById('music-label');

// Load YouTube IFrame API asynchronously
const ytScript = document.createElement('script');
ytScript.src = 'https://www.youtube.com/iframe_api';
document.head.appendChild(ytScript);

window.onYouTubeIframeAPIReady = () => {
  ytPlayer = new window.YT.Player('yt-player-host', {
    width: '200',
    height: '113',
    videoId: '7o5XAg_EeLw',
    playerVars: {
      autoplay: 0,
      controls: 0,
      start: 1,
      loop: 1,
      playlist: '7o5XAg_EeLw',
      playsinline: 1,
      enablejsapi: 1,
      origin: window.location.origin,
      rel: 0,
    },
    events: {
      onReady: () => {
        ytReady = true;
        if (pendingPlay) {
          pendingPlay = false;
          ytPlayer.setVolume(80);
          ytPlayer.playVideo();
        }
      },
    },
  });
};

function toggleMusic(forceState) {
  musicOn = typeof forceState === 'boolean' ? forceState : !musicOn;
  musicBtn.classList.toggle('playing', musicOn);
  if (musicLabel) musicLabel.textContent = musicOn ? 'Đang phát: I Do (911)' : 'Nhạc: I Do (911)';

  if (!musicOn) {
    pendingPlay = false;
    if (ytReady && ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
      ytPlayer.pauseVideo();
    }
    return;
  }

  if (ytReady && ytPlayer && typeof ytPlayer.playVideo === 'function') {
    ytPlayer.setVolume(80);
    ytPlayer.playVideo();
  } else {
    pendingPlay = true;
  }
}

musicBtn.addEventListener('click', () => toggleMusic());
