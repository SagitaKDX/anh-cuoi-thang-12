import { useEffect, useState } from 'react';
import { Calculator, CheckCircle2, AlertCircle } from 'lucide-react';
import { FIRST_TIME_PREP, HIDDEN_COSTS } from '../data/weddingData';

const PRESET_PACKAGES = [
  { label: '8,9 tr (Palatino / Yêu Media)', value: 8.9 },
  { label: '12,9 tr (Fely Luxury II)', value: 12.9 },
  { label: '14,9 tr (2H Ngoại thành 01)', value: 14.9 },
  { label: '16,8 tr (Fely Luxury III)', value: 16.8 },
  { label: '18,5 tr (2H Ngoại thành 02)', value: 18.5 },
];

export default function FirstTimePlanner() {
  const [basePackage, setBasePackage] = useState(14.9);
  const [selectedExtras, setSelectedExtras] = useState(
    () => new Set(['tickets', 'meals', 'buffer']),
  );

  const [checkedPrep, setCheckedPrep] = useState(() => {
    try {
      const saved = localStorage.getItem('prep-checklist-v2');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('prep-checklist-v2', JSON.stringify([...checkedPrep]));
    } catch {
      // ignore storage errors
    }
  }, [checkedPrep]);

  const toggleExtra = (id) => {
    setSelectedExtras((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePrep = (id) => {
    setCheckedPrep((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const extraSum = HIDDEN_COSTS.filter(
    (item) => item.id !== 'buffer' && selectedExtras.has(item.id),
  ).reduce((acc, item) => acc + item.defaultCost, 0);

  const bufferSum = selectedExtras.has('buffer') ? 1.0 : 0;
  const total = Number((basePackage + extraSum + bufferSum).toFixed(2));
  const isOverBudget = total > 20;

  const basePct = total > 0 ? (basePackage / total) * 100 : 100;
  const extraPct = total > 0 ? (extraSum / total) * 100 : 0;
  const bufferPct = total > 0 ? (bufferSum / total) * 100 : 0;

  const totalPrepItems = FIRST_TIME_PREP.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <section className="section" id="lan-dau-chup">
      <h2>Lần đầu chụp ảnh cưới: phải tính điều gì?</h2>
      <p className="lead">
        Giá gói niêm yết hiếm khi là con số cuối cùng bạn trả. Với cặp đôi chụp lần đầu vào tháng 12, cần tính đủ cả chi phí phát sinh ngoài hợp đồng, đồ cá nhân giữ ấm và thời gian trả ảnh.
      </p>

      <div className="calc-grid">
        <div className="calc-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Calculator size={18} color="var(--primary)" aria-hidden="true" />
            <h3 style={{ margin: 0 }}>Bộ tính tổng chi phí thực tế buổi chụp</h3>
          </div>
          <p className="note" style={{ marginTop: 0 }}>
            Chọn mức giá gói gốc rồi tick các khoản dễ phát sinh để xem tổng chi phí có nằm gọn trong mức 15–20 triệu không.
          </p>

          <div style={{ marginTop: 14 }}>
            <label
              htmlFor="base-slider"
              style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}
            >
              <span>1. Giá gói chụp niêm yết</span>
              <span className="tabular" style={{ color: 'var(--primary)' }}>
                {String(basePackage).replace('.', ',')} triệu
              </span>
            </label>
            <input
              id="base-slider"
              type="range"
              min="5.9"
              max="20"
              step="0.1"
              value={basePackage}
              onChange={(e) => setBasePackage(parseFloat(e.target.value))}
              style={{ width: '100%', marginTop: 8, accentColor: 'var(--primary)' }}
            />
            <div className="preset-row">
              {PRESET_PACKAGES.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className="chip"
                  aria-pressed={Math.abs(basePackage - p.value) < 0.05}
                  onClick={() => setBasePackage(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: 8 }}>
            2. Các khoản ngoài hợp đồng cần tính thêm
          </div>
          <div className="addon-list">
            {HIDDEN_COSTS.map((item) => {
              const checked = selectedExtras.has(item.id);
              return (
                <label
                  key={item.id}
                  className={`addon-item ${checked ? 'checked' : ''}`}
                >
                  <div className="addon-left">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleExtra(item.id)}
                    />
                    <div>
                      <div style={{ fontSize: '0.91rem', fontWeight: 500, color: 'var(--ink)' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 2 }}>
                        {item.tip} (thường {item.range})
                      </div>
                    </div>
                  </div>
                  <span className="addon-cost tabular">
                    +{String(item.defaultCost).replace('.', ',')} tr
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <aside className="summary-box" aria-live="polite">
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>
            Tổng dự trù buổi chụp
          </div>
          <div className="total-figure tabular">
            {String(total).replace('.', ',')} triệu
          </div>

          <div className={`budget-status ${isOverBudget ? 'over' : 'ok'}`}>
            {isOverBudget ? (
              <>
                <AlertCircle size={15} aria-hidden="true" />
                Vượt trần 20 tr (+{String((total - 20).toFixed(1)).replace('.', ',')} tr)
              </>
            ) : (
              <>
                <CheckCircle2 size={15} aria-hidden="true" />
                Nằm gọn trong ngân sách 15–20 tr
              </>
            )}
          </div>

          <div className="stacked-bar" aria-hidden="true">
            <div className="bar-base" style={{ width: `${basePct}%` }} />
            <div className="bar-extra" style={{ width: `${extraPct}%` }} />
            <div className="bar-buffer" style={{ width: `${bufferPct}%` }} />
          </div>

          <dl style={{ margin: '14px 0 0', display: 'grid', gap: 8, fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <dt style={{ color: 'var(--ink-soft)' }}>• Gói chụp cơ bản</dt>
              <dd className="tabular" style={{ margin: 0, fontWeight: 600 }}>
                {String(basePackage).replace('.', ',')} tr
              </dd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <dt style={{ color: 'var(--ink-soft)' }}>• Phát sinh &amp; nâng cấp</dt>
              <dd className="tabular" style={{ margin: 0, fontWeight: 600 }}>
                {String(extraSum.toFixed(1)).replace('.', ',')} tr
              </dd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <dt style={{ color: 'var(--ink-soft)' }}>• Tiền mặt dự phòng</dt>
              <dd className="tabular" style={{ margin: 0, fontWeight: 600 }}>
                {String(bufferSum.toFixed(1)).replace('.', ',')} tr
              </dd>
            </div>
          </dl>

          <p className="note" style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
            Lưu ý tháng 12: Mùa cưới cao điểm từ tháng 9 đến tháng 2 dương lịch, thời gian chỉnh ảnh và in album thường mất <strong>3–5 tuần</strong>. Cần chụp sớm nếu định dùng ảnh cho lễ cưới đầu năm.
          </p>
        </aside>
      </div>

      <div style={{ marginTop: 40 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--serif)', margin: 0 }}>
              Kế hoạch &amp; Checklist từ A đến Z (Trước 2 tháng đến sau ngày chụp)
            </h3>
            <p className="note" style={{ margin: '4px 0 0' }}>
              Tick trực tiếp theo từng mốc thời gian; trình duyệt tự động lưu tiến độ của hai bạn.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="note tabular" style={{ margin: 0 }}>
              Hoàn thành: <strong>{checkedPrep.size}</strong> / {totalPrepItems} mục
            </span>
            {checkedPrep.size > 0 && (
              <button
                type="button"
                className="btn-ghost"
                style={{ padding: '5px 10px', fontSize: '0.82rem' }}
                onClick={() => setCheckedPrep(new Set())}
              >
                Đặt lại
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            height: 8,
            background: 'var(--line)',
            borderRadius: 99,
            overflow: 'hidden',
            marginTop: 12,
          }}
          aria-hidden="true"
        >
          <div
            style={{
              height: '100%',
              width: `${totalPrepItems > 0 ? (checkedPrep.size / totalPrepItems) * 100 : 0}%`,
              background: 'var(--emerald)',
              transition: 'width 0.2s ease',
            }}
          />
        </div>

        <div className="prep-grid">
          {FIRST_TIME_PREP.map((group) => (
            <div className="info-panel" key={group.group}>
              <h4 style={{ margin: '0 0 4px', fontSize: '0.98rem', fontWeight: 600 }}>
                {group.group}
              </h4>
              <ul className="checklist-ul">
                {group.items.map((item) => {
                  const done = checkedPrep.has(item.id);
                  return (
                    <li key={item.id}>
                      <label className={done ? 'done' : ''}>
                        <input
                          type="checkbox"
                          checked={done}
                          onChange={() => togglePrep(item.id)}
                        />
                        <span>{item.text}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
