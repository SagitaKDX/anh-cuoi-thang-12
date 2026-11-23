import { useEffect, useState } from 'react';
import {
  ArrowUp,
  Camera,
  Clock,
  Compass,
  HeartHandshake,
  Printer,
  Snowflake,
  Sun,
  Wind,
} from 'lucide-react';
import {
  BRIEF_FACTS,
  CONCEPTS,
  DECEMBER_WEATHER,
  SAVE_THE_DATE,
  STUDIO_QUESTIONS,
} from './data/weddingData';
import PackageExplorer from './components/PackageExplorer';
import StudioReviews from './components/StudioReviews';
import ComparativeAnalysis from './components/ComparativeAnalysis';
import FirstTimePlanner from './components/FirstTimePlanner';

export default function App() {
  const [activeStudio, setActiveStudio] = useState('2H Studio');
  const [checkedQuestions, setCheckedQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem('studio-questions-v1');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('studio-questions-v1', JSON.stringify([...checkedQuestions]));
    } catch {
      // ignore storage errors
    }
  }, [checkedQuestions]);

  const handleSelectStudioFromTable = (studioName) => {
    setActiveStudio(studioName);
    const el = document.getElementById('danh-gia');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleQuestion = (id) => {
    setCheckedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <a href="#top" className="brand">
            <Camera size={18} color="var(--primary)" aria-hidden="true" />
            <span>Ảnh cưới tháng 12</span>
          </a>

          <nav className="nav-links" aria-label="Điều hướng mục">
            <a href="#du-kien">Dữ kiện</a>
            <a href="#thang-12">Tháng 12</a>
            <a href="#bang-goi">Bảng gói</a>
            <a href="#danh-gia">Review Studio</a>
            <a href="#phuong-an">So sánh 4 hướng</a>
            <a href="#lan-dau-chup">Checklist &amp; Chi phí</a>
            <a href="#hoi-studio">Hỏi trước cọc</a>
          </nav>

          <button type="button" className="print-btn" onClick={() => window.print()}>
            <Printer size={15} aria-hidden="true" />
            <span>In / Lưu PDF</span>
          </button>
        </div>
      </header>

      <main className="page-wrap" id="top">
        {/* Hero */}
        <section className="hero" aria-label="Giới thiệu">
          <div className="hero-grid">
            <div>
              <h1>Ảnh cưới tháng 12, giữa Hà Nội và Hòa Bình</h1>
              <p className="hero-sub">So sánh gói chụp trong tầm 15–20 triệu</p>
              <p className="lead">
                Lo buổi chụp Pre-wedding trước: đối chiếu giá gói, đọc review thực tế từng studio và tính trước các khoản phát sinh cho cặp đôi chụp ảnh cưới lần đầu. Trang điểm và váy ngày cưới tách riêng tính sau.
              </p>
              <div className="hero-actions">
                <a href="#bang-goi" className="btn-primary">
                  Lọc 19 gói chụp
                </a>
                <a href="#lan-dau-chup" className="btn-ghost">
                  Tính chi phí lần đầu chụp
                </a>
                <a href="#danh-gia" className="btn-ghost">
                  Xem review 6 studio
                </a>
              </div>
            </div>

            <div className="ridge-box">
              <svg className="ridge-svg" viewBox="0 0 1000 190" aria-hidden="true">
                <path
                  className="far"
                  d="M0 130 C90 78 150 65 220 102 S340 44 430 85 S570 35 660 80 S810 50 890 92 S965 75 1000 96"
                />
                <path d="M0 160 C100 118 175 106 265 132 S425 90 525 124 S695 95 785 126 S925 110 1000 135" />
                <path
                  className="field"
                  d="M0 160 C100 118 175 106 265 132 S425 90 525 124 S695 95 785 126 S925 110 1000 135 V180 H0 Z"
                />
                <path d="M0 172 H1000" style={{ strokeWidth: 1 }} />
                <path
                  className="reed"
                  d="M60 172 C62 150 66 136 74 126 M80 172 C80 152 84 140 92 130 M96 172 C98 156 100 144 108 136 M900 172 C902 150 906 136 914 126 M920 172 C920 152 924 140 932 132 M938 172 C940 158 942 146 950 138"
                />
              </svg>
              <p className="ridge-caption">
                <Compass size={15} color="var(--primary)" aria-hidden="true" />
                Trục di chuyển gợi ý: Hòa Bình — Đồng Mô / Cổ Đô — Hà Nội
              </p>
            </div>
          </div>

          <dl className="facts-grid" id="du-kien">
            {BRIEF_FACTS.map((fact) => (
              <div
                key={fact.label}
                className={`fact-item ${fact.muted ? 'is-muted' : ''}`}
              >
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Tháng 12 & Concept */}
        <section className="section" id="thang-12">
          <h2>Tháng 12 chụp gì đẹp &amp; 3 concept đề xuất</h2>
          <p className="lead">
            Đầu đông miền Bắc trời hanh, ít mưa, nắng dịu. Điểm nhấn thiên nhiên rõ nhất lúc này là cỏ lau trắng và mặt hồ trong nền núi. Một ngày chụp vừa đủ cho 2–3 concept.
          </p>

          <div className="cols-3">
            {DECEMBER_WEATHER.map((item) => {
              const Icon =
                item.id === 'reed' ? Wind : item.id === 'light' ? Sun : Snowflake;
              const tone =
                item.id === 'reed' ? '' : item.id === 'light' ? 'amber' : 'rose';
              return (
                <div className="info-panel" key={item.id}>
                  <div className={`info-panel-head ${tone}`}>
                    <Icon size={18} aria-hidden="true" />
                    <h3 style={{ margin: 0 }}>{item.title}</h3>
                  </div>
                  <p>{item.body}</p>
                </div>
              );
            })}
          </div>

          <p className="note">
            Lưu ý địa điểm: Lúa chín ở Mai Châu là mùa hè (tháng 5–6), nên tháng 12 ở Hòa Bình hợp cảnh hồ, núi và sương sớm hơn là đồng lúa.
          </p>

          <div className="table-wrap" style={{ marginTop: 22 }}>
            <table>
              <thead>
                <tr>
                  <th>Concept</th>
                  <th>Địa điểm gợi ý</th>
                  <th>Trang phục</th>
                  <th>Vì sao hợp tháng 12</th>
                  <th>Lưu ý</th>
                </tr>
              </thead>
              <tbody>
                {CONCEPTS.map((c) => (
                  <tr key={c.name}>
                    <td>
                      <strong>{c.name}</strong>
                      <div>
                        <span
                          className={`tag ${c.badgeTone === 'primary' ? 'primary' : ''}`}
                        >
                          {c.badge}
                        </span>
                      </div>
                    </td>
                    <td>{c.locations}</td>
                    <td>{c.outfits}</td>
                    <td>{c.whyDec}</td>
                    <td style={{ color: 'var(--ink-soft)' }}>{c.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bảng lọc 19 gói */}
        <PackageExplorer onSelectStudio={handleSelectStudioFromTable} />

        {/* Đánh giá studio (Research) */}
        <StudioReviews
          activeStudio={activeStudio}
          onSelectStudio={setActiveStudio}
        />

        {/* Phân tích so sánh 4 hướng đi (Hà Nội, Tây HN, Hòa Bình, Hạ Long) */}
        <ComparativeAnalysis />

        {/* Lần đầu chụp ảnh cưới: phải tính điều gì */}
        <FirstTimePlanner />

        {/* Hỏi studio trước khi cọc */}
        <section className="section" id="hoi-studio">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
            <h2>8 câu bắt buộc hỏi studio trước khi cọc</h2>
            <span className="note tabular" style={{ margin: 0 }}>
              Đã hỏi: <strong>{checkedQuestions.size}</strong> / {STUDIO_QUESTIONS.length}
            </span>
          </div>
          <p className="lead">
            Mọi câu trả lời về quà tặng, vé vào cửa và phụ phí di chuyển cần được ghi rõ trên hợp đồng hoặc tin nhắn xác nhận chính thức của studio.
          </p>

          <ul className="checklist-ul questions-grid">
            {STUDIO_QUESTIONS.map((q) => {
              const done = checkedQuestions.has(q.id);
              return (
                <li key={q.id}>
                  <label className={done ? 'done' : ''}>
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => toggleQuestion(q.id)}
                    />
                    <span>{q.text}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Bước tiếp theo: Save the Date */}
        <section className="section" id="save-the-date">
          <h2>Sau buổi chụp: trang Save the Date</h2>
          <p className="lead">
            Khi đã có ảnh chỉnh sửa, có thể dựng nhanh một trang web thiệp mời gọn nhẹ gửi qua Zalo, Messenger hoặc in mã QR lên thiệp giấy.
          </p>

          <div className="cols-3">
            {SAVE_THE_DATE.map((item, idx) => {
              const Icon = idx === 0 ? HeartHandshake : idx === 1 ? Clock : Camera;
              return (
                <div className="info-panel" key={item.title}>
                  <div className="info-panel-head">
                    <Icon size={18} aria-hidden="true" />
                    <h3 style={{ margin: 0 }}>{item.title}</h3>
                  </div>
                  <p>{item.body}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <a href="#top" className="back-to-top" aria-label="Lên đầu trang">
        <ArrowUp size={18} aria-hidden="true" />
      </a>
    </>
  );
}
