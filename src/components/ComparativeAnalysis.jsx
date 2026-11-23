import { Anchor, Check, MapPin, Scale, X } from 'lucide-react';
import { COMPARATIVE_MATRIX, DIRECTIONS } from '../data/weddingData';

export default function ComparativeAnalysis() {
  return (
    <section className="section" id="phuong-an">
      <h2>Phân tích so sánh 4 hướng đi (gồm cả Hạ Long)</h2>
      <p className="lead">
        Đặt cạnh nhau 4 lựa chọn thực tế nhất cho tháng 12/2026 khi xuất phát từ Hòa Bình: Hà Nội nội thành, Tây Hà Nội, Hòa Bình tại chỗ và Hạ Long – Quảng Ninh.
      </p>

      {/* 4 Summary Cards */}
      <div className="cols-4">
        {DIRECTIONS.map((dir) => (
          <div
            key={dir.id}
            className={`dir-card ${dir.recommended ? 'recommended' : ''}`}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <h3>{dir.title}</h3>
              {dir.recommended && (
                <span className="tag primary" style={{ margin: 0 }}>
                  Hợp nhất
                </span>
              )}
            </div>
            <div className="dir-budget tabular">{dir.budget}</div>

            <ul className="dir-list">
              {dir.pros.map((p) => (
                <li key={p}>
                  <Check size={16} color="var(--emerald)" aria-hidden="true" />
                  <span>{p}</span>
                </li>
              ))}
              {dir.cons.map((c) => (
                <li key={c}>
                  <X size={16} color="var(--rose)" aria-hidden="true" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Detailed Comparative Matrix (Desktop Table) */}
      <div style={{ marginTop: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Scale size={18} color="var(--primary)" aria-hidden="true" />
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontFamily: 'var(--serif)' }}>
            Bảng đối chiếu chi tiết theo 7 tiêu chí quyết định
          </h3>
        </div>

        <div className="table-wrap desktop-only-table">
          <table>
            <thead>
              <tr>
                <th style={{ width: '18%' }}>Tiêu chí</th>
                <th style={{ width: '20%' }}>A. Hà Nội (Phim trường)</th>
                <th style={{ width: '22%', background: 'var(--primary-soft)' }}>
                  B. Tây Hà Nội (Khuyên dùng)
                </th>
                <th style={{ width: '19%' }}>C. Hòa Bình (Tại chỗ)</th>
                <th style={{ width: '21%' }}>D. Hạ Long (Quảng Ninh)</th>
              </tr>
            </thead>
            <tbody>
              {COMPARATIVE_MATRIX.map((row) => (
                <tr key={row.criterion}>
                  <td>
                    <strong>{row.criterion}</strong>
                  </td>
                  <td>{row.hn}</td>
                  <td style={{ background: 'rgba(239, 246, 255, 0.45)', fontWeight: 500 }}>
                    {row.westHn}
                  </td>
                  <td>{row.hoaBinh}</td>
                  <td>{row.haLong}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Cards for Comparative Matrix */}
        <div className="mobile-package-list" aria-label="Bảng so sánh 4 phương án trên điện thoại">
          {COMPARATIVE_MATRIX.map((row) => (
            <article className="mobile-pkg-card" key={row.criterion}>
              <h4 style={{ margin: '0 0 10px', fontSize: '0.96rem', color: 'var(--primary-ink)' }}>
                {row.criterion}
              </h4>
              <dl className="mobile-pkg-meta" style={{ marginTop: 0, paddingTop: 0, borderTop: 0 }}>
                <div>
                  <dt>A. Hà Nội</dt>
                  <dd>{row.hn}</dd>
                </div>
                <div style={{ background: 'var(--primary-soft)', padding: '6px 8px', borderRadius: 6 }}>
                  <dt style={{ color: 'var(--primary-ink)', fontWeight: 600 }}>B. Tây HN</dt>
                  <dd style={{ color: 'var(--ink)', fontWeight: 500 }}>{row.westHn}</dd>
                </div>
                <div>
                  <dt>C. Hòa Bình</dt>
                  <dd>{row.hoaBinh}</dd>
                </div>
                <div>
                  <dt>D. Hạ Long</dt>
                  <dd>{row.haLong}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </div>

      {/* Location Highlights: Hòa Bình & Hạ Long */}
      <div className="review-cols" style={{ marginTop: 22 }}>
        <div className="info-panel" style={{ background: 'var(--surface)' }}>
          <div className="info-panel-head">
            <MapPin size={18} aria-hidden="true" />
            <h3 style={{ margin: 0 }}>Tọa độ gợi ý tại Hòa Bình</h3>
          </div>
          <p>
            <strong>Hồ Hòa Bình &amp; hồ Mắt Ngọc:</strong> mặt nước xanh thẳm, vách núi đá vắng người — hợp concept hồ núi.{' '}
            <strong>Mai Châu (Bản Lác, đèo Thung Khe):</strong> hợp sương núi tháng 12, gần khi đi từ Hòa Bình.
          </p>
        </div>

        <div className="info-panel" style={{ background: 'var(--surface)' }}>
          <div className="info-panel-head amber">
            <Anchor size={18} aria-hidden="true" />
            <h3 style={{ margin: 0 }}>Tọa độ gợi ý tại Hạ Long tháng 12</h3>
          </div>
          <p>
            <strong>Vịnh Hạ Long / Du thuyền &amp; Bãi Cháy:</strong> mặt biển lặng, nắng hanh vàng (chụp đẹp nhất 15h00–16h30).{' '}
            <strong>Bảo tàng Quảng Ninh &amp; Đồi Phượng Hoàng:</strong> kiến trúc đen tối giản có mái che tránh gió rét, hoặc đồi cỏ cháy kiểu Bohemian.
          </p>
        </div>
      </div>
    </section>
  );
}
