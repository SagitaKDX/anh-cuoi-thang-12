// Phoenix Scroll-Path Bézier Companions & Projection Helpers
const PHOENIX_BEZIER_LEFT = [
  { x: 8, y: 12 },
  { x: 22, y: 35 },
  { x: 18, y: 62 },
  { x: 12, y: 88 },
];

const PHOENIX_BEZIER_RIGHT = [
  { x: 92, y: 14 },
  { x: 78, y: 38 },
  { x: 82, y: 65 },
  { x: 88, y: 90 },
];

function evalCubicBezier(p0, p1, p2, p3, t) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  const x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
  const y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;

  // Tangent derivative vector (dx/dt, dy/dt)
  const dx = 3 * uu * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * tt * (p3.x - p2.x);
  const dy = 3 * uu * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * tt * (p3.y - p2.y);

  return { x, y, dx, dy };
}

function viewportPercentToWorld(xPct, yPct, depthZ, camera, aspect) {
  const dist = camera.position.z - depthZ;
  const fovRad = (camera.fov * Math.PI) / 180;
  const halfH = dist * Math.tan(fovRad / 2);
  const halfW = halfH * (aspect !== undefined ? aspect : camera.aspect);
  const ndcX = (xPct / 100) * 2 - 1;
  const ndcY = 1 - (yPct / 100) * 2;
  return {
    x: camera.position.x + ndcX * halfW,
    y: camera.position.y + ndcY * halfH,
    z: depthZ,
  };
}

function headingFromBezier(dx, dy) {
  const headingDeg = Math.atan2(dx, dy) * (180 / Math.PI);
  const rotZ = (headingDeg * 0.55 * Math.PI) / 180;
  const clampedDegY = Math.max(-18, Math.min(18, (dx / 100) * 35));
  const rotY = (clampedDegY * Math.PI) / 180;
  return { rotZ, rotY };
}

let targetScrollP = 0;
let currentScrollP = 0;
let phoenix3dReady = false;
let checkThreeActive = () => {};
let setPhoenix3dVisible = () => {};

// 1. Three.js 3D Floating Petals, Golden Particles & Articulated Dual-Plane Phoenix
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

    // Phoenix 3D Companions: Canvas2D SVG Atlas Rasterizer with TextureLoader Fallback
    function loadPhoenixTexture() {
      return new Promise((resolve, reject) => {
        const atlasW = isMobile ? 256 : 512;
        const atlasH = isMobile ? 128 : 256;
        const subW = atlasW / 2;
        const subH = atlasH;

        const canvasAtlas = document.createElement('canvas');
        canvasAtlas.width = atlasW;
        canvasAtlas.height = atlasH;
        const ctx = canvasAtlas.getContext('2d');
        if (!ctx) {
          const loader = new THREE.TextureLoader();
          return loader.load('./phoenix.svg', (tex) => resolve({ texture: tex, isAtlas: false }), undefined, reject);
        }

        const svgDefs = `<defs>
          <linearGradient id="phxGold" x1="0" y1="0" x2="180" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#fef3c7"/>
            <stop offset="45%" stop-color="#fcd34d"/>
            <stop offset="100%" stop-color="#b45309"/>
          </linearGradient>
          <linearGradient id="phxCrimson" x1="20" y1="20" x2="140" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#fb7185"/>
            <stop offset="100%" stop-color="#9f1239"/>
          </linearGradient>
        </defs>`;

        const bodySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${subW}" height="${subH}" viewBox="0 0 180 140" fill="none">
          ${svgDefs}
          <g id="tail">
            <path d="M18 118 C42 104, 62 84, 78 68 C58 92, 38 114, 12 128 Z" fill="url(#phxGold)" opacity="0.85"/>
            <path d="M28 128 C54 110, 74 90, 90 72 C72 98, 52 118, 24 134 Z" fill="url(#phxGold)" opacity="0.72"/>
            <path d="M46 132 C70 114, 86 94, 98 76 C84 102, 68 120, 44 136 Z" fill="url(#phxCrimson)" opacity="0.65"/>
          </g>
          <g id="body">
            <path d="M126 62 C136 52, 142 40, 140 28 C144 22, 154 20, 162 24 C154 28, 152 34, 148 44 C144 54, 136 64, 128 66 Z" fill="url(#phxGold)"/>
            <path d="M140 26 C132 14, 120 10, 108 12 C120 16, 130 22, 138 30 Z" fill="url(#phxGold)"/>
            <path d="M144 24 C140 12, 132 6, 122 4 C132 10, 138 16, 142 26 Z" fill="url(#phxCrimson)" opacity="0.8"/>
            <circle cx="148" cy="26" r="1.8" fill="#4c0519"/>
          </g>
        </svg>`;

        const wingSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${subW}" height="${subH}" viewBox="0 0 180 140" fill="none">
          ${svgDefs}
          <g id="wing-outer">
            <path d="M94 64 C78 36, 48 16, 16 14 C36 28, 58 46, 76 68 Z" fill="url(#phxGold)"/>
            <path d="M98 62 C86 34, 66 14, 38 6 C54 22, 72 42, 86 64 Z" fill="url(#phxGold)" opacity="0.9"/>
            <path d="M104 62 C98 36, 84 18, 62 10 C74 26, 86 44, 94 64 Z" fill="url(#phxCrimson)" opacity="0.75"/>
          </g>
          <g id="wing-inner">
            <path d="M88 68 C102 58, 120 56, 134 62 C122 76, 104 82, 84 78 Z" fill="url(#phxGold)"/>
          </g>
        </svg>`;

        function loadSvgImg(str) {
          return new Promise((res, rej) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => res(img);
            img.onerror = rej;
            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str);
          });
        }

        Promise.all([loadSvgImg(bodySvg), loadSvgImg(wingSvg)])
          .then(([bImg, wImg]) => {
            ctx.clearRect(0, 0, atlasW, atlasH);
            ctx.drawImage(bImg, 0, 0, subW, subH);
            ctx.drawImage(wImg, subW, 0, subW, subH);
            const tex = new THREE.CanvasTexture(canvasAtlas);
            tex.premultipliedAlpha = false;
            resolve({ texture: tex, isAtlas: true });
          })
          .catch(() => {
            const loader = new THREE.TextureLoader();
            loader.load('./phoenix.svg', (tex) => resolve({ texture: tex, isAtlas: false }), undefined, reject);
          });
      });
    }

    const texData = await loadPhoenixTexture();
    const meshW = 2.2;
    const meshH = meshW * (140 / 180);

    const bodyGeo = new THREE.PlaneGeometry(meshW, meshH);
    const wingGeo = new THREE.PlaneGeometry(meshW, meshH);

    if (texData.isAtlas) {
      const bUvs = bodyGeo.attributes.uv;
      for (let i = 0; i < bUvs.count; i++) {
        bUvs.setX(i, bUvs.getX(i) * 0.5);
      }
      const wUvs = wingGeo.attributes.uv;
      for (let i = 0; i < wUvs.count; i++) {
        wUvs.setX(i, 0.5 + wUvs.getX(i) * 0.5);
      }
    }

    // Wing root pivot offset at (95, 65) vs group center (90, 70)
    const pivotDx = ((95 - 90) / 180) * meshW;
    const pivotDy = ((70 - 65) / 140) * meshH;

    function buildPhoenixGroup(isRight) {
      const phoenixGroup = new THREE.Group();

      const mat = new THREE.MeshBasicMaterial({
        map: texData.texture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      const bodyMesh = new THREE.Mesh(bodyGeo, mat);
      bodyMesh.position.set(0, 0, 0);
      phoenixGroup.add(bodyMesh);

      const wingGroup = new THREE.Group();
      wingGroup.position.set(pivotDx, pivotDy, 0.04);

      const wingMesh = new THREE.Mesh(wingGeo, mat.clone());
      wingMesh.position.set(-pivotDx, -pivotDy, 0);
      wingGroup.add(wingMesh);

      phoenixGroup.add(wingGroup);
      scene.add(phoenixGroup);

      return {
        phoenixGroup,
        bodyMesh,
        wingGroup,
        wingMesh,
        mat,
        wingMat: wingMesh.material,
        isRight,
      };
    }

    const phoenixLeft = buildPhoenixGroup(false);
    const phoenixRight = buildPhoenixGroup(true);

    // Subtle Gold Ember Trail (~40 desktop / ~18 mobile, no purple)
    const trailCount = isMobile ? 18 : 40;
    const trailGeo = new THREE.BufferGeometry();
    const trailPos = new Float32Array(trailCount * 3);
    const trailMeta = [];

    for (let i = 0; i < trailCount; i++) {
      trailPos[i * 3] = 0;
      trailPos[i * 3 + 1] = 0;
      trailPos[i * 3 + 2] = -999;
      trailMeta.push({
        life: Math.random(),
        speed: 0.016 + Math.random() * 0.02,
        vx: (Math.random() - 0.5) * 0.02,
        vy: 0.005 + Math.random() * 0.015,
        vz: (Math.random() - 0.5) * 0.015,
        targetBird: i % 2 === 0 ? phoenixLeft : phoenixRight,
      });
    }
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
    const trailMat = new THREE.PointsMaterial({
      color: 0xfde68a,
      size: isMobile ? 0.16 : 0.22,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const trailPoints = new THREE.Points(trailGeo, trailMat);
    scene.add(trailPoints);

    setPhoenix3dVisible = (visible) => {
      phoenixLeft.phoenixGroup.visible = visible;
      phoenixRight.phoenixGroup.visible = visible;
      trailPoints.visible = visible;
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

      // Phoenix 3D Articulated Dual-Plane Flight & Ember Trail
      if (phoenix3dReady && !reducedMotion) {
        const scrollDiff = targetScrollP - currentScrollP;
        if (Math.abs(scrollDiff) > 0.0001) {
          currentScrollP += scrollDiff * 0.15;
        } else {
          currentScrollP = targetScrollP;
        }

        const y = window.scrollY;
        const op = Math.max(0, Math.min(1, (y - 40) / 75));
        const effectiveOpacity = 0.92 * op;

        phoenixLeft.mat.opacity = effectiveOpacity;
        phoenixLeft.wingMat.opacity = effectiveOpacity;
        phoenixRight.mat.opacity = effectiveOpacity;
        phoenixRight.wingMat.opacity = effectiveOpacity;

        const isBirdActive = op > 0.01;
        phoenixLeft.phoenixGroup.visible = isBirdActive;
        phoenixRight.phoenixGroup.visible = isBirdActive;

        if (isBirdActive) {
          const tL = Math.max(0, Math.min(1, currentScrollP));
          const tR = Math.max(0, Math.min(1, currentScrollP + 0.04));

          const posL = evalCubicBezier(
            PHOENIX_BEZIER_LEFT[0],
            PHOENIX_BEZIER_LEFT[1],
            PHOENIX_BEZIER_LEFT[2],
            PHOENIX_BEZIER_LEFT[3],
            tL
          );
          const posR = evalCubicBezier(
            PHOENIX_BEZIER_RIGHT[0],
            PHOENIX_BEZIER_RIGHT[1],
            PHOENIX_BEZIER_RIGHT[2],
            PHOENIX_BEZIER_RIGHT[3],
            tR
          );

          // Swoop forward in mid-flight (depth ~ z=4..8)
          const depthL = 5.0 + Math.sin(tL * Math.PI) * 2.0;
          const depthR = 5.0 + Math.sin(tR * Math.PI) * 2.0;

          const wPosL = viewportPercentToWorld(posL.x, posL.y, depthL, camera);
          const wPosR = viewportPercentToWorld(posR.x, posR.y, depthR, camera);

          phoenixLeft.phoenixGroup.position.set(wPosL.x, wPosL.y, wPosL.z);
          phoenixRight.phoenixGroup.position.set(wPosR.x, wPosR.y, wPosR.z);

          const hL = headingFromBezier(posL.dx, posL.dy);
          const hR = headingFromBezier(posR.dx, posR.dy);

          phoenixLeft.phoenixGroup.rotation.set(0, hL.rotY, hL.rotZ);
          phoenixRight.phoenixGroup.rotation.set(0, -hR.rotY, -hR.rotZ);

          const scaleL = 0.94 + Math.sin(tL * Math.PI) * 0.12;
          const scaleR = 0.94 + Math.sin(tR * Math.PI) * 0.12;

          phoenixLeft.phoenixGroup.scale.set(scaleL, scaleL, scaleL);
          phoenixRight.phoenixGroup.scale.set(-scaleR, scaleR, scaleR);

          // Articulated Wing Flap
          const flapTime = performance.now() * 0.007;
          const flapZ = Math.sin(flapTime) * 0.35;
          const flapX = Math.cos(flapTime) * 0.12;
          phoenixLeft.wingGroup.rotation.z = flapZ;
          phoenixLeft.wingGroup.rotation.x = flapX;
          phoenixRight.wingGroup.rotation.z = flapZ;
          phoenixRight.wingGroup.rotation.x = flapX;

          // Soft Gold Ember Trail Update
          const posArr = trailGeo.attributes.position.array;
          for (let i = 0; i < trailCount; i++) {
            const tm = trailMeta[i];
            tm.life += tm.speed;
            const idx = i * 3;
            if (tm.life >= 1) {
              tm.life = 0;
              const bPos = tm.targetBird.phoenixGroup.position;
              const bScale = tm.targetBird.phoenixGroup.scale.x > 0 ? 1 : -1;
              posArr[idx] = bPos.x - bScale * 0.6 + (Math.random() - 0.5) * 0.15;
              posArr[idx + 1] = bPos.y - 0.3 + (Math.random() - 0.5) * 0.15;
              posArr[idx + 2] = bPos.z - 0.2 + (Math.random() - 0.5) * 0.1;
            } else {
              posArr[idx] += tm.vx;
              posArr[idx + 1] += tm.vy;
              posArr[idx + 2] += tm.vz;
            }
          }
          trailGeo.attributes.position.needsUpdate = true;
          trailPoints.visible = true;
        } else {
          trailPoints.visible = false;
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
    checkThreeActive = checkActive;

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

    // Signal WebGL phoenix readiness and hide DOM flyer stage
    phoenix3dReady = true;
    const stage = document.getElementById('phoenix-stage');
    if (stage && !reducedMotion) {
      stage.classList.add('is-webgl');
    }
  } catch (err) {
    // WebGL or Texture unavailable: silent fallback to DOM flyer flight
    phoenix3dReady = false;
    const stage = document.getElementById('phoenix-stage');
    if (stage) stage.classList.remove('is-webgl');
  }
})();

// Reduced motion state & listener
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = reducedMotionQuery.matches;
reducedMotionQuery.addEventListener('change', (e) => {
  reducedMotion = e.matches;
  const stageEl = document.getElementById('phoenix-stage');
  if (reducedMotion) {
    if (stageEl) stageEl.classList.remove('is-webgl');
    if (typeof setPhoenix3dVisible === 'function') setPhoenix3dVisible(false);
    if (tiltCard) tiltCard.style.transform = '';
    if (flyerLeft) flyerLeft.style.cssText = '';
    if (flyerRight) flyerRight.style.cssText = '';
  } else {
    if (phoenix3dReady && stageEl) stageEl.classList.add('is-webgl');
    if (typeof setPhoenix3dVisible === 'function') setPhoenix3dVisible(true);
    updateScrollParallax();
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



// Phoenix Scroll-Path Flight (DOM Fallback)
const flyerLeft = document.querySelector('.phoenix-flyer--left');
const flyerRight = document.querySelector('.phoenix-flyer--right');
let flyerRafId = null;

function applyFlyerPose(flyerEl, pos, t, isRight) {
  if (!flyerEl) return;
  const w = window.innerWidth;
  const h = window.innerHeight;

  const fx = (pos.x / 100) * w;
  const fy = (pos.y / 100) * h;

  // translateZ depth: swoops forward in mid-flight (up to 40px closer)
  const fz = Math.sin(t * Math.PI) * 40;

  // Heading angles
  const dPxX = (pos.dx / 100) * w;
  const dPxY = (pos.dy / 100) * h;
  const headingAngle = Math.atan2(dPxX, dPxY) * (180 / Math.PI);

  // 2D heading rotateZ banked along path tangent
  const rotZ = isRight ? -headingAngle * 0.55 : headingAngle * 0.55;

  // Small rotateY from horizontal velocity for 3D feel
  const rotY = Math.max(-18, Math.min(18, (pos.dx / 100) * 35));

  // Scale: gentle breathing scale
  const scale = 0.94 + Math.sin(t * Math.PI) * 0.12;

  // Opacity ramp: appears smoothly after scrollY > ~40
  const y = window.scrollY;
  const op = Math.max(0, Math.min(1, (y - 40) / 75));

  flyerEl.style.setProperty('--fx', `${fx.toFixed(1)}px`);
  flyerEl.style.setProperty('--fy', `${fy.toFixed(1)}px`);
  flyerEl.style.setProperty('--fz', `${fz.toFixed(1)}px`);
  flyerEl.style.setProperty('--frot-y', `${rotY.toFixed(2)}deg`);
  flyerEl.style.setProperty('--frot-z', `${rotZ.toFixed(2)}deg`);
  flyerEl.style.setProperty('--fscale', `${scale.toFixed(3)}`);
  flyerEl.style.setProperty('--fop', `${op.toFixed(3)}`);
}

function updateFlyerFlight(scrollP) {
  if (reducedMotion || phoenix3dReady) return;

  const tL = Math.max(0, Math.min(1, scrollP));
  const tR = Math.max(0, Math.min(1, scrollP + 0.04));

  const posL = evalCubicBezier(
    PHOENIX_BEZIER_LEFT[0],
    PHOENIX_BEZIER_LEFT[1],
    PHOENIX_BEZIER_LEFT[2],
    PHOENIX_BEZIER_LEFT[3],
    tL
  );
  const posR = evalCubicBezier(
    PHOENIX_BEZIER_RIGHT[0],
    PHOENIX_BEZIER_RIGHT[1],
    PHOENIX_BEZIER_RIGHT[2],
    PHOENIX_BEZIER_RIGHT[3],
    tR
  );

  applyFlyerPose(flyerLeft, posL, tL, false);
  applyFlyerPose(flyerRight, posR, tR, true);
}

function flyerTick() {
  if (phoenix3dReady) {
    flyerRafId = null;
    return;
  }
  const diff = targetScrollP - currentScrollP;
  if (Math.abs(diff) > 0.0005) {
    currentScrollP += diff * 0.15; // Smooth lerp
    updateFlyerFlight(currentScrollP);
    flyerRafId = requestAnimationFrame(flyerTick);
  } else {
    currentScrollP = targetScrollP;
    updateFlyerFlight(currentScrollP);
    flyerRafId = null;
  }
}

function updateScrollParallax() {
  const y = window.scrollY;
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const scrollP = Math.max(0, Math.min(1, y / maxScroll));

  document.body.classList.toggle('scrolled', y > 120);

  if (reducedMotion) {
    document.documentElement.style.removeProperty('--py');
    document.documentElement.style.removeProperty('--scroll-p');
    if (flyerLeft) flyerLeft.style.cssText = '';
    if (flyerRight) flyerRight.style.cssText = '';
    return;
  }

  const py = Math.max(-1, Math.min(1, y / Math.max(window.innerHeight, 500)));
  document.documentElement.style.setProperty('--py', py.toFixed(3));
  document.documentElement.style.setProperty('--scroll-p', scrollP.toFixed(3));

  targetScrollP = scrollP;
  if (!phoenix3dReady) {
    if (!flyerRafId) {
      flyerRafId = requestAnimationFrame(flyerTick);
    }
  } else {
    checkThreeActive();
  }
}
window.addEventListener('scroll', updateScrollParallax, { passive: true });
window.addEventListener('resize', updateScrollParallax, { passive: true });
currentScrollP = 0;
targetScrollP = 0;
updateScrollParallax();
updateFlyerFlight(0);


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
