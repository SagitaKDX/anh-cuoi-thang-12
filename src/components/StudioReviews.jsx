import { AlertTriangle, CheckCircle2, MapPin, Sparkles, Tag } from 'lucide-react';
import { STUDIO_REVIEWS } from '../data/weddingData';

export default function StudioReviews({ activeStudio, onSelectStudio }) {
  const current =
    STUDIO_REVIEWS.find((s) => s.studio === activeStudio) || STUDIO_REVIEWS[0];

  return (
    <section className="section" id="danh-gia">
      <h2>Đánh giá thực tế các studio</h2>
      <p className="lead">
        Tổng hợp phản hồi từ cộng đồng dâu rể (Hội Cô Dâu, Tripi, Mytour, HanoiReview, Calibridal) và thông tin chính thức của từng ảnh viện để bạn cân nhắc trước khi đặt lịch thử váy.
      </p>

      <div className="studio-tabs" role="tablist" aria-label="Chọn studio xem đánh giá">
        {STUDIO_REVIEWS.map((item) => {
          const isActive = item.studio === current.studio;
          return (
            <button
              key={item.studio}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`studio-tab ${isActive ? 'active' : ''}`}
              onClick={() => onSelectStudio(item.studio)}
            >
              {item.studio}
            </button>
          );
        })}
      </div>

      <article className="review-dossier" role="tabpanel">
        <div className="review-head">
          <div>
            <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--serif)', marginBottom: 4 }}>
              {current.studio}
            </h3>
            <div className="review-meta">
              <span>
                <MapPin size={15} aria-hidden="true" />
                {current.area}
              </span>
              <span className="tabular">
                <Tag size={15} aria-hidden="true" />
                {current.priceRange}
              </span>
            </div>
          </div>
          <span className="tag" style={{ margin: 0 }}>
            Nguồn: {current.sources}
          </span>
        </div>

        <p style={{ marginTop: 14, marginBottom: 0, color: 'var(--ink-soft)' }}>
          {current.summary}
        </p>

        <div className="review-fit-box">
          <Sparkles size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} aria-hidden="true" />
          <strong>Hợp nhất với:</strong> {current.bestFor}
        </div>

        <div className="review-cols">
          <div>
            <h3 style={{ color: 'var(--emerald)', fontSize: '0.96rem' }}>
              Điểm cộng từ review thực tế
            </h3>
            <ul className="review-list">
              {current.pros.map((pro) => (
                <li key={pro}>
                  <CheckCircle2 size={16} color="var(--emerald)" aria-hidden="true" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 style={{ color: 'var(--rose-ink)', fontSize: '0.96rem' }}>
              Điểm cần kiểm tra kỹ trước khi cọc
            </h3>
            <ul className="review-list">
              {current.cons.map((con) => (
                <li key={con}>
                  <AlertTriangle size={16} color="var(--rose)" aria-hidden="true" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>
    </section>
  );
}
