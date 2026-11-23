import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Calendar,
  Check,
  Gift,
  Heart,
  MapPin,
  Music,
  RotateCcw,
  Send,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

const TARGET_DATE = new Date('2026-12-20T17:00:00+07:00').getTime();

const TIMELINE_EVENTS = [
  { time: '17:00', title: 'Đón khách & chụp ảnh lưu niệm', note: 'Check-in sảnh tiệc cùng cô dâu chú rể' },
  { time: '17:30', title: 'Khai tiệc & Nghi lễ thành hôn', note: 'Ra mắt hai họ, rót rượu giao bôi' },
  { time: '18:15', title: 'Giao lưu & Biểu diễn văn nghệ', note: 'Chung vui cùng gia đình và bạn bè' },
  { time: '19:30', title: 'Kết thúc tiệc', note: 'Cảm ơn quý khách đã đến chung vui' },
];

const INITIAL_WISHES = [
  {
    id: 1,
    name: 'Hội bạn thân Hòa Bình',
    text: 'Chúc Tiến Anh & Thanh Thư trăm năm hạnh phúc, sớm đón tin vui nhé!',
  },
  {
    id: 2,
    name: 'Gia đình bác Hùng',
    text: 'Chúc hai cháu luôn yêu thương, đồng hành và bình an trên chặng đường mới.',
  },
];

function useCountdown(targetMs) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const diff = Math.max(0, targetMs - now);
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function WeddingInvitePreview() {
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [justOpened, setJustOpened] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [hideTestBar, setHideTestBar] = useState(false);

  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestCount, setGuestCount] = useState('1');
  const [attending, setAttending] = useState('yes');
  const [wishInput, setWishInput] = useState('');

  const [giftOpen, setGiftOpen] = useState(false);
  const [wishes, setWishes] = useState(INITIAL_WISHES);

  const audioCtxRef = useRef(null);
  const melodyTimerRef = useRef(null);
  const countdown = useCountdown(TARGET_DATE);

  // Floating petals data (deterministic positions)
  const petals = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: `${(i * 7.3 + 4) % 96}%`,
        delay: `${(i * 0.65).toFixed(2)}s`,
        duration: `${7 + (i % 5) * 1.4}s`,
        size: 10 + (i % 4) * 3,
      })),
    [],
  );

  // Scroll reveal for invitation cards
  useEffect(() => {
    if (!envelopeOpen) return;
    const els = document.querySelectorAll('.inv-reveal');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [envelopeOpen]);

  // Soft Web Audio chime loop when musicOn is toggled
  useEffect(() => {
    if (!musicOn) {
      if (melodyTimerRef.current) clearInterval(melodyTimerRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.0, 783.99];
      let step = 0;

      const playNote = () => {
        if (!audioCtxRef.current) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = notes[step % notes.length];
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.15);
        step += 1;
      };

      playNote();
      melodyTimerRef.current = setInterval(playNote, 950);
    } catch {
      // AudioContext blocked or unsupported
    }

    return () => {
      if (melodyTimerRef.current) clearInterval(melodyTimerRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [musicOn]);

  const handleOpenEnvelope = () => {
    setEnvelopeOpen(true);
    setJustOpened(true);
    setTimeout(() => setJustOpened(false), 1800);
  };

  const handleReplayEnvelope = () => {
    setEnvelopeOpen(false);
    setJustOpened(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRsvpSubmit = (e) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    if (wishInput.trim()) {
      setWishes((prev) => [
        { id: Date.now(), name: guestName.trim(), text: wishInput.trim() },
        ...prev,
      ]);
    }
    setRsvpSubmitted(true);
  };

  return (
    <section className="inv-stage" aria-label="Bản review thử thiệp cưới">
      {!hideTestBar && (
        <div className="inv-test-bar">
          <div>
            <strong>Bản Review Thử Nghiệm</strong> · Phong cách Long Phụng Đỏ (HTML + CSS + Three.js 3D)
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a
              href="./thiep-moi.html"
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.82rem' }}
            >
              <Sparkles size={14} aria-hidden="true" />
              <span>Mở Full-Screen (Three.js 3D)</span>
            </a>
            <button type="button" className="btn-ghost" onClick={handleReplayEnvelope} style={{ padding: '5px 10px', fontSize: '0.82rem' }}>
              <RotateCcw size={14} aria-hidden="true" />
              <span>Xem lại hiệu ứng mở thiệp</span>
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setHideTestBar(true)}
              style={{ padding: '5px 10px', fontSize: '0.82rem' }}
            >
              Ẩn thanh test
            </button>
          </div>
        </div>
      )}

      <div className="inv-phone-frame">
        {/* Floating petals */}
        {envelopeOpen && (
          <div className="inv-petals" aria-hidden="true">
            {petals.map((p) => (
              <span
                key={p.id}
                className="inv-petal"
                style={{
                  left: p.left,
                  animationDelay: p.delay,
                  animationDuration: p.duration,
                  width: p.size,
                  height: p.size * 1.25,
                }}
              />
            ))}
          </div>
        )}

        {/* Golden burst when envelope opens */}
        {justOpened && (
          <div className="inv-sparkles" aria-hidden="true">
            {Array.from({ length: 16 }, (_, i) => (
              <span
                key={i}
                className="inv-spark"
                style={{
                  '--angle': `${i * 22.5}deg`,
                  '--dist': `${80 + (i % 3) * 45}px`,
                }}
              />
            ))}
          </div>
        )}

        {/* Music floating button */}
        {envelopeOpen && (
          <button
            type="button"
            className={`inv-music-btn ${musicOn ? 'playing' : ''}`}
            onClick={() => setMusicOn((v) => !v)}
            aria-label={musicOn ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
            title={musicOn ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
          >
            <Music size={16} aria-hidden="true" />
          </button>
        )}

        {/* 3D Double-door Crimson Envelope */}
        {!envelopeOpen ? (
          <div className="inv-envelope-wrap">
            <div className="inv-door inv-door-left" />
            <div className="inv-door inv-door-right" />
            <div className="inv-envelope-content">
              <div className="inv-kicker-gold">THIỆP MỜI THÀNH HÔN</div>
              <div className="inv-seal-ring" onClick={handleOpenEnvelope} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleOpenEnvelope()}>
                <div className="inv-seal-inner">
                  <span className="inv-double-happy">囍</span>
                </div>
              </div>
              <div className="inv-env-names">
                <span>Lã Tiến Anh</span>
                <span className="inv-amp">&amp;</span>
                <span>Đỗ Thị Thanh Thư</span>
              </div>
              <p className="inv-env-guest">Trân trọng kính mời Quý Khách</p>
              <button type="button" className="inv-open-btn" onClick={handleOpenEnvelope}>
                <Sparkles size={16} aria-hidden="true" />
                <span>Chạm để mở thiệp</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="inv-card-body">
            {/* Hero Arch */}
            <header className="inv-hero inv-reveal is-visible">
              <div className="inv-corner tl" aria-hidden="true" />
              <div className="inv-corner tr" aria-hidden="true" />
              <div className="inv-corner bl" aria-hidden="true" />
              <div className="inv-corner br" aria-hidden="true" />

              <div className="inv-hero-badge">HAPPY WEDDING</div>
              <h2 className="inv-couple-title">
                Lã Tiến Anh
                <span className="inv-heart-divider">
                  <Heart size={18} fill="currentColor" aria-hidden="true" />
                </span>
                Đỗ Thị Thanh Thư
              </h2>
              <p className="inv-date-pill tabular">Chủ Nhật · 20 Tháng 12, 2026</p>

              <div className="inv-photo-arch">
                <img
                  src="./couple-photo.jpg"
                  alt="Lã Tiến Anh và Đỗ Thị Thanh Thư"
                  className="inv-hero-photo"
                />
                <div className="inv-photo-shimmer" aria-hidden="true" />
              </div>

              <p className="inv-quote">
                “Trân trọng kính mời Quý Khách đến dự buổi tiệc chung vui cùng gia đình chúng tôi.”
              </p>
            </header>

            {/* Family Info */}
            <section className="inv-block inv-reveal">
              <div className="inv-block-title">Gia Đình Hai Họ</div>
              <div className="inv-family-grid">
                <div className="inv-family-col">
                  <div className="inv-family-role">NHÀ TRAI</div>
                  <div className="inv-family-name">Lã Tiến Anh</div>
                  <div className="inv-family-sub">Hòa Bình</div>
                </div>
                <div className="inv-family-divider" aria-hidden="true">囍</div>
                <div className="inv-family-col">
                  <div className="inv-family-role">NHÀ GÁI</div>
                  <div className="inv-family-name">Đỗ Thị Thanh Thư</div>
                  <div className="inv-family-sub">Hòa Bình</div>
                </div>
              </div>
            </section>

            {/* Countdown */}
            <section className="inv-block inv-reveal">
              <div className="inv-block-title">Đếm Ngược Ngày Chung Đôi</div>
              <div className="inv-countdown tabular">
                <div className="inv-cd-box">
                  <strong>{countdown.days}</strong>
                  <span>Ngày</span>
                </div>
                <div className="inv-cd-box">
                  <strong>{String(countdown.hours).padStart(2, '0')}</strong>
                  <span>Giờ</span>
                </div>
                <div className="inv-cd-box">
                  <strong>{String(countdown.minutes).padStart(2, '0')}</strong>
                  <span>Phút</span>
                </div>
                <div className="inv-cd-box">
                  <strong>{String(countdown.seconds).padStart(2, '0')}</strong>
                  <span>Giây</span>
                </div>
              </div>
            </section>

            {/* Timeline */}
            <section className="inv-block inv-reveal">
              <div className="inv-block-title">Lịch Trình Hôn Lễ</div>
              <div className="inv-timeline">
                {TIMELINE_EVENTS.map((ev) => (
                  <div className="inv-tl-row" key={ev.time}>
                    <span className="inv-tl-time tabular">{ev.time}</span>
                    <div>
                      <div className="inv-tl-title">{ev.title}</div>
                      <div className="inv-tl-note">{ev.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Venue */}
            <section className="inv-block inv-reveal">
              <div className="inv-block-title">Địa Điểm Tổ Chức</div>
              <p style={{ margin: '0 0 12px', textAlign: 'center', fontSize: '0.94rem', color: '#4a1c24' }}>
                <MapPin size={15} style={{ verticalAlign: '-2px', marginRight: 4, color: '#9f1239' }} />
                Trung tâm Tiệc cưới (Bản Review Test) · TP. Hòa Bình
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                <a
                  href="https://maps.google.com/?q=Hoa+Binh+Vietnam"
                  target="_blank"
                  rel="noreferrer"
                  className="inv-outline-btn"
                >
                  <MapPin size={15} aria-hidden="true" />
                  Xem bản đồ
                </a>
                <a
                  href="#tong-quan"
                  onClick={(e) => {
                    e.preventDefault();
                    setRsvpOpen(true);
                  }}
                  className="inv-outline-btn"
                >
                  <Calendar size={15} aria-hidden="true" />
                  Lưu lịch tham dự
                </a>
              </div>
            </section>

            {/* Interactive Action Bar: RSVP + Gift Box */}
            <section className="inv-block inv-reveal">
              <div className="inv-action-row">
                <button
                  type="button"
                  className="inv-primary-btn"
                  onClick={() => {
                    setRsvpSubmitted(false);
                    setRsvpOpen(true);
                  }}
                >
                  <Users size={16} aria-hidden="true" />
                  Xác nhận tham dự (RSVP)
                </button>
                <button
                  type="button"
                  className="inv-gold-btn"
                  onClick={() => setGiftOpen(true)}
                >
                  <Gift size={16} aria-hidden="true" />
                  Hộp Mừng Cưới
                </button>
              </div>
            </section>

            {/* Guestbook */}
            <section className="inv-block inv-reveal">
              <div className="inv-block-title">Sổ Lưu Bút Lời Chúc</div>
              <div className="inv-wishes">
                {wishes.map((w) => (
                  <div className="inv-wish-card" key={w.id}>
                    <div className="inv-wish-author">{w.name}</div>
                    <p className="inv-wish-text">{w.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <footer className="inv-footer">
              <div>Sự hiện diện của Quý Khách là niềm vinh hạnh cho gia đình chúng tôi!</div>
              <div style={{ marginTop: 6, fontWeight: 600 }}>Lã Tiến Anh ♥ Đỗ Thị Thanh Thư</div>
            </footer>
          </div>
        )}
      </div>

      {/* RSVP Modal */}
      {rsvpOpen && (
        <div className="inv-modal-backdrop" onClick={() => setRsvpOpen(false)}>
          <div className="inv-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="inv-modal-close"
              onClick={() => setRsvpOpen(false)}
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
            <h3 style={{ fontFamily: 'var(--serif)', color: '#881337', marginTop: 0 }}>
              Xác nhận tham dự
            </h3>
            {rsvpSubmitted ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ display: 'inline-flex', padding: 12, borderRadius: 99, background: '#ecfdf5', color: '#047857', marginBottom: 10 }}>
                  <Check size={24} />
                </div>
                <p style={{ margin: 0, fontWeight: 600 }}>Cảm ơn {guestName} đã xác nhận!</p>
                <p className="note">Lời chúc của bạn đã được thêm vào sổ lưu bút bên dưới.</p>
              </div>
            ) : (
              <form onSubmit={handleRsvpSubmit} style={{ display: 'grid', gap: 12 }}>
                <label style={{ display: 'grid', gap: 4, fontSize: '0.88rem', fontWeight: 600 }}>
                  Tên Quý Khách
                  <input
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Ví dụ: Anh Minh & Gia đình"
                    style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid var(--line-strong)', font: 'inherit' }}
                  />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <label style={{ display: 'grid', gap: 4, fontSize: '0.88rem', fontWeight: 600 }}>
                    Trạng thái
                    <select
                      value={attending}
                      onChange={(e) => setAttending(e.target.value)}
                      style={{ padding: '9px 10px', borderRadius: 8, border: '1px solid var(--line-strong)', font: 'inherit' }}
                    >
                      <option value="yes">Sẽ tham dự</option>
                      <option value="no">Bận không thể đến</option>
                    </select>
                  </label>
                  <label style={{ display: 'grid', gap: 4, fontSize: '0.88rem', fontWeight: 600 }}>
                    Số khách
                    <select
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      style={{ padding: '9px 10px', borderRadius: 8, border: '1px solid var(--line-strong)', font: 'inherit' }}
                    >
                      <option value="1">1 người</option>
                      <option value="2">2 người</option>
                      <option value="3">3+ người</option>
                    </select>
                  </label>
                </div>
                <label style={{ display: 'grid', gap: 4, fontSize: '0.88rem', fontWeight: 600 }}>
                  Lời chúc gửi cô dâu chú rể
                  <textarea
                    rows={3}
                    value={wishInput}
                    onChange={(e) => setWishInput(e.target.value)}
                    placeholder="Chúc Lã Tiến Anh & Đỗ Thị Thanh Thư hạnh phúc..."
                    style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid var(--line-strong)', font: 'inherit' }}
                  />
                </label>
                <button type="submit" className="inv-primary-btn" style={{ justifyContent: 'center' }}>
                  <Send size={15} aria-hidden="true" />
                  Gửi xác nhận (Test)
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Gift Box Modal */}
      {giftOpen && (
        <div className="inv-modal-backdrop" onClick={() => setGiftOpen(false)}>
          <div className="inv-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="inv-modal-close"
              onClick={() => setGiftOpen(false)}
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
            <h3 style={{ fontFamily: 'var(--serif)', color: '#881337', marginTop: 0 }}>
              Hộp Mừng Cưới (Bản Test)
            </h3>
            <p className="note" style={{ marginTop: 0 }}>
              Khi chốt ảnh cưới &amp; ngày cưới xong, mình sẽ gắn mã VietQR thật của chú rể &amp; cô dâu vào đây.
            </p>
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ padding: 14, borderRadius: 10, border: '1px solid #fecdd3', background: '#fff1f2' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9f1239' }}>MỪNG CHÚ RỂ</div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>Lã Tiến Anh</div>
                <div className="note" style={{ margin: '2px 0 0' }}>Ngân hàng &amp; STK sẽ điền khi phát hành</div>
              </div>
              <div style={{ padding: 14, borderRadius: 10, border: '1px solid #fde68a', background: '#fffbeb' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#b45309' }}>MỪNG CÔ DÂU</div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>Đỗ Thị Thanh Thư</div>
                <div className="note" style={{ margin: '2px 0 0' }}>Ngân hàng &amp; STK sẽ điền khi phát hành</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
