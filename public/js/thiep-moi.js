import { initScrollMoments } from './scroll-moments.js';
document.documentElement.classList.add('js');
const $ = (selector) => document.querySelector(selector);
const envelope = $('#envelope');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let coverTimer;
let opening = false;

function syncScrollLock() {
  document.body.classList.toggle('modal-open', Boolean(document.querySelector('dialog[open]')));
}

function finishOpening() {
  clearTimeout(coverTimer);
  if (envelope.open) envelope.close();
  envelope.classList.remove('is-opening');
  opening = false;
  $('#open-btn').disabled = false;
  $('#open-seal').disabled = false;
  syncScrollLock();
  $('#invitation').focus({ preventScroll: true });
}

function showEnvelope() {
  clearTimeout(coverTimer);
  opening = false;
  envelope.classList.remove('is-opening');
  $('#open-btn').disabled = false;
  $('#open-seal').disabled = false;
  $('#cover-hint').textContent = 'Chạm để mở một niềm vui.';
  if (!envelope.open) envelope.showModal();
  syncScrollLock();
}

function openEnvelope() {
  if (opening) return;
  startInvitationMusic();
  if (reducedMotion.matches) {
    finishOpening();
    return;
  }
  opening = true;
  $('#open-btn').disabled = true;
  $('#open-seal').disabled = true;
  $('#cover-hint').textContent = 'Dành cho ngày mình chung đôi.';
  envelope.classList.add('is-opening');
  // One sequence, with a finite fallback if the animation is interrupted.
  coverTimer = window.setTimeout(finishOpening, 3000);
}

$('#open-btn').addEventListener('click', openEnvelope);
$('#open-seal').addEventListener('click', openEnvelope);
$('#skip-envelope').addEventListener('click', () => { startInvitationMusic(); finishOpening(); });
$('#replay-btn').addEventListener('click', showEnvelope);
envelope.addEventListener('cancel', (event) => { event.preventDefault(); finishOpening(); });
envelope.addEventListener('close', () => { clearTimeout(coverTimer); syncScrollLock(); });
reducedMotion.addEventListener('change', () => { if (reducedMotion.matches && opening) finishOpening(); });
showEnvelope();

const targetDate = new Date('2026-12-20T17:00:00+07:00').getTime();
function updateCountdown() {
  const remaining = Math.max(0, targetDate - Date.now());
  const values = [Math.floor(remaining / 86400000), Math.floor(remaining / 3600000) % 24, Math.floor(remaining / 60000) % 60, Math.floor(remaining / 1000) % 60];
  ['#cd-days', '#cd-hours', '#cd-mins', '#cd-secs'].forEach((id, index) => { $(id).textContent = String(values[index]).padStart(2, '0'); });
}
updateCountdown();
let countdownTimer = window.setInterval(updateCountdown, 1000);
document.addEventListener('visibilitychange', () => {
  clearInterval(countdownTimer);
  if (!document.hidden) { updateCountdown(); countdownTimer = window.setInterval(updateCountdown, 1000); }
});

const storageKey = 'tien-anh-thanh-thu-invitation-v2';
const form = $('#rsvp-form');
let savedState = { rsvp: null, wishes: [] };
try {
  const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
  if (stored && typeof stored === 'object') {
    if (stored.rsvp && typeof stored.rsvp.name === 'string') savedState.rsvp = stored.rsvp;
    if (Array.isArray(stored.wishes)) savedState.wishes = stored.wishes.filter((wish) => typeof wish?.name === 'string' && typeof wish?.text === 'string').slice(0, 20).map((wish) => ({ name: wish.name.slice(0, 100), text: wish.text.slice(0, 1000) }));
  }
} catch { /* A private browser can still use the form during this visit. */ }

function renderLocalWishes() {
  document.querySelectorAll('.local-wish').forEach((item) => item.remove());
  const fragment = document.createDocumentFragment();
  savedState.wishes.forEach((wish) => {
    const block = document.createElement('blockquote');
    block.className = 'local-wish';
    const text = document.createElement('p');
    const author = document.createElement('cite');
    text.textContent = wish.text;
    author.textContent = wish.name;
    block.append(text, author);
    fragment.appendChild(block);
  });
  $('#wish-list').prepend(fragment);
}

function syncAttendance() {
  $('#guest-count').disabled = $('#guest-attendance').value === 'no';
}
if (savedState.rsvp) {
  $('#guest-name').value = savedState.rsvp.name.slice(0, 100);
  $('#guest-attendance').value = savedState.rsvp.attendance === 'no' ? 'no' : 'yes';
  $('#guest-count').value = ['1', '2', '3', '4', '5'].includes(String(savedState.rsvp.count)) ? String(savedState.rsvp.count) : '1';
}
syncAttendance();
renderLocalWishes();
$('#guest-attendance').addEventListener('change', syncAttendance);
$('#guest-name').addEventListener('input', () => $('#guest-name').setCustomValidity(''));
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = $('#guest-name').value.trim();
  if (!name) {
    $('#guest-name').setCustomValidity('Bạn hãy điền tên để chúng mình biết nhé.');
    $('#guest-name').reportValidity();
    return;
  }
  const wish = $('#guest-wish').value.trim();
  savedState.rsvp = { name, attendance: $('#guest-attendance').value, count: $('#guest-count').value };
  if (wish && !savedState.wishes.some((item) => item.name === name && item.text === wish)) savedState.wishes.unshift({ name, text: wish });
  savedState.wishes = savedState.wishes.slice(0, 20);
  let persisted = true;
  try { localStorage.setItem(storageKey, JSON.stringify(savedState)); } catch { persisted = false; }
  renderLocalWishes();
  $('#guest-wish').value = '';
  const status = $('#rsvp-done');
  status.hidden = false;
  status.textContent = persisted ? `Cảm ơn ${name}! Đã lưu xác nhận trên thiết bị này${wish ? ' và thêm lời chúc vào lưu bút' : ''}.` : `Cảm ơn ${name}! Trình duyệt chưa cho phép lưu. Thông tin chỉ được giữ trong lần xem này.`;
});

const giftDialog = $('#gift-modal');
$('#open-gift').addEventListener('click', () => { giftDialog.showModal(); syncScrollLock(); });
$('#gift-close').addEventListener('click', () => giftDialog.close());
giftDialog.addEventListener('close', syncScrollLock);
giftDialog.addEventListener('click', (event) => {
  const rect = giftDialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) giftDialog.close();
});

// A single official YouTube player supplies I Do as background music.
const musicButton = $('#music-btn');
const musicPanel = $('#music-panel');
const musicStatus = $('#music-status');
let musicPlayer;
let musicReady = false;
let musicWanted = false;
let musicStarted = false;
let musicLoading;
let musicLoadFailed = false;
let musicAttempt = 0;

function updateMusicButton(playing = false) {
  musicButton.classList.toggle('is-playing', playing);
  musicButton.setAttribute('aria-pressed', String(musicWanted));
  musicButton.setAttribute('aria-label', musicWanted ? 'Tắt nhạc nền I Do' : 'Bật nhạc nền I Do');
  musicButton.title = musicWanted ? 'Tắt nhạc I Do' : 'Bật nhạc I Do';
}

function loadMusic() {
  if (musicLoadFailed) {
    musicPlayer?.destroy?.();
    musicPlayer = undefined;
    musicReady = false;
    musicLoading = undefined;
    musicLoadFailed = false;
    document.querySelector('script[data-invite-music-failed]')?.remove();
  }
  if (musicLoading) return musicLoading;
  musicLoading = new Promise((resolve, reject) => {
    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) { musicLoadFailed = true; settled = true; reject(new Error('Music unavailable')); }
    }, 15000);
    function createPlayer() {
      if (musicPlayer || !window.YT?.Player) return;
      musicPlayer = new window.YT.Player('yt-player-host', {
        width: 288,
        height: 200,
        videoId: '7o5XAg_EeLw',
        playerVars: {
          playsinline: 1,
          controls: 1,
          rel: 0,
          loop: 1,
          playlist: '7o5XAg_EeLw',
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            clearTimeout(timeout);
            musicReady = true;
            musicPlayer.setVolume(42);
            if (musicWanted) musicPlayer.playVideo();
            if (!settled) { settled = true; resolve(musicPlayer); }
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              if (!musicWanted) { musicPlayer.pauseVideo(); return; }
              musicButton.removeAttribute('aria-busy');
              updateMusicButton(true);
              musicStatus.textContent = 'Đang phát I Do, 911 và Đức Phúc.';
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              musicWanted = false;
              musicButton.removeAttribute('aria-busy');
              updateMusicButton(false);
              musicStatus.textContent = 'Nhạc nền đã tắt. Chạm nút nhạc để nghe tiếp.';
            }
          },
          onAutoplayBlocked: () => {
            musicButton.removeAttribute('aria-busy');
            musicStatus.textContent = 'Chạm nút phát bên dưới để nghe I Do.';
            showMusicPanel();
          },
          onError: () => {
            musicLoadFailed = true;
            clearTimeout(timeout);
            musicReady = false;
            musicWanted = false;
            musicButton.removeAttribute('aria-busy');
            updateMusicButton(false);
            musicStatus.textContent = 'Chưa phát được nhạc. Bạn có thể thử lại hoặc nghe I Do trên YouTube.';
            if (!settled) { settled = true; reject(new Error('Music unavailable')); }
          },
        },
      });
    }
    if (window.YT?.Player) { createPlayer(); return; }
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { previous?.(); createPlayer(); };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.onerror = () => { musicLoadFailed = true; script.setAttribute('data-invite-music-failed', ''); clearTimeout(timeout); if (!settled) { settled = true; reject(new Error('Music unavailable')); } };
      document.head.appendChild(script);
    }
  });
  return musicLoading;
}

async function playMusic() {
  musicWanted = true;
  const attempt = ++musicAttempt;
  updateMusicButton();
  musicButton.setAttribute('aria-busy', 'true');
  musicStatus.textContent = 'Đang mở nhạc I Do…';
  // Keep this call synchronous with the tap whenever the player is ready.
  if (musicReady) musicPlayer.playVideo();
  try {
    await loadMusic();
    if (!musicWanted || attempt !== musicAttempt) return;
    musicPlayer.playVideo();
    window.setTimeout(() => {
      if (musicWanted && attempt === musicAttempt && musicPlayer.getPlayerState?.() !== window.YT.PlayerState.PLAYING) {
        musicButton.removeAttribute('aria-busy');
        musicStatus.textContent = 'Chạm nút phát trong trình phát để bắt đầu I Do.';
        showMusicPanel();
      }
    }, 6000);
  } catch {
    if (attempt !== musicAttempt) return;
    musicWanted = false;
    musicButton.removeAttribute('aria-busy');
    updateMusicButton();
    musicStatus.textContent = 'Chưa tải được nhạc. Bạn có thể nghe I Do trên YouTube hoặc thử lại.';
    showMusicPanel();
  }
}

function pauseMusic() {
  musicWanted = false;
  musicAttempt++;
  musicButton.removeAttribute('aria-busy');
  if (musicReady) musicPlayer.pauseVideo();
  updateMusicButton();
  musicStatus.textContent = 'Nhạc nền đã tắt. Chạm nút nhạc để nghe tiếp.';
}

function startInvitationMusic() {
  if (musicStarted) return;
  musicStarted = true;
  playMusic();
}

function showMusicPanel() {
  musicPanel.classList.add('is-expanded');
  musicPanel.removeAttribute('aria-hidden');
  musicPanel.inert = false;
  $('#music-info').setAttribute('aria-expanded', 'true');
}
function hideMusicPanel() {
  musicPanel.classList.remove('is-expanded');
  musicPanel.setAttribute('aria-hidden', 'true');
  musicPanel.inert = true;
  $('#music-info').setAttribute('aria-expanded', 'false');
}

musicButton.addEventListener('click', () => {
  musicStarted = true;
  if (musicWanted) pauseMusic(); else playMusic();
});
$('#music-info').addEventListener('click', () => {
  if (musicPanel.classList.contains('is-expanded')) hideMusicPanel();
  else { showMusicPanel(); loadMusic().catch(() => {}); }
});
$('#music-close').addEventListener('click', () => { hideMusicPanel(); $('#music-info').focus({ preventScroll: true }); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && musicPanel.classList.contains('is-expanded')) hideMusicPanel(); });
// Prepare the API while the guest reads the cover; playback always waits for a tap.
loadMusic().catch(() => {});

initScrollMoments();
