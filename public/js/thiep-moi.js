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
$('#skip-envelope').addEventListener('click', finishOpening);
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

// Music loads only on request, in a visible player; closing it stops playback.
const musicButton = $('#music-btn');
const musicPanel = $('#music-panel');
function closeMusic() {
  musicPanel.hidden = true;
  musicButton.setAttribute('aria-expanded', 'false');
  musicButton.setAttribute('aria-label', 'Mở nhạc I Do');
  $('#yt-player-host').replaceChildren();
  musicButton.focus({ preventScroll: true });
}
musicButton.addEventListener('click', () => {
  if (!musicPanel.hidden) { closeMusic(); return; }
  musicPanel.hidden = false;
  musicButton.setAttribute('aria-expanded', 'true');
  musicButton.setAttribute('aria-label', 'Dừng và đóng nhạc I Do');
  const player = document.createElement('iframe');
  player.title = 'I Do, 911 và Đức Phúc';
  player.src = 'https://www.youtube-nocookie.com/embed/7o5XAg_EeLw?autoplay=1&playsinline=1&rel=0';
  player.allow = 'autoplay; encrypted-media; picture-in-picture';
  player.referrerPolicy = 'strict-origin-when-cross-origin';
  $('#yt-player-host').replaceChildren(player);
});
$('#music-close').addEventListener('click', closeMusic);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !musicPanel.hidden) closeMusic(); });
