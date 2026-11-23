import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Download, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { PACKAGES_DATA } from '../data/weddingData';

const PRICE_BUCKETS = [
  { label: 'Dưới 10 tr', match: (d) => d.gia !== null && d.gia < 10 },
  { label: '10–15 tr', match: (d) => d.gia !== null && d.gia >= 10 && d.gia < 15 },
  { label: '15–20 tr', match: (d) => d.gia !== null && d.gia >= 15 && d.gia <= 20 },
  { label: 'Chưa có giá', match: (d) => d.gia === null },
];

function uniqueValues(key) {
  const seen = [];
  PACKAGES_DATA.forEach((item) => {
    const raw = item[key];
    const list = Array.isArray(raw) ? raw : [raw];
    list.forEach((v) => {
      if (!seen.includes(v)) seen.push(v);
    });
  });
  return seen;
}

function formatPrice(item) {
  if (item.gia === null) return 'Liên hệ';
  const min = String(item.gia).replace('.', ',');
  if (item.giaMax) {
    return `${min}–${String(item.giaMax).replace('.', ',')} tr`;
  }
  return `${min} tr`;
}

export default function PackageExplorer({ onSelectStudio }) {
  const [selected, setSelected] = useState({
    khuVuc: new Set(),
    loai: new Set(),
    concepts: new Set(),
    muc: new Set(),
  });
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('asc');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const activeFilterCount =
    selected.khuVuc.size +
    selected.loai.size +
    selected.concepts.size +
    selected.muc.size;

  const filterRows = useMemo(
    () => [
      { key: 'khuVuc', label: 'Khu vực', values: uniqueValues('khuVuc') },
      { key: 'loai', label: 'Kiểu chụp', values: uniqueValues('loai') },
      { key: 'concepts', label: 'Concept', values: uniqueValues('concepts') },
      { key: 'muc', label: 'Mức giá', values: PRICE_BUCKETS.map((b) => b.label) },
    ],
    [],
  );

  const toggleFilter = (key, val) => {
    setSelected((prev) => {
      const nextSet = new Set(prev[key]);
      if (nextSet.has(val)) {
        nextSet.delete(val);
      } else {
        nextSet.add(val);
      }
      return { ...prev, [key]: nextSet };
    });
  };

  const resetAll = () => {
    setSelected({
      khuVuc: new Set(),
      loai: new Set(),
      concepts: new Set(),
      muc: new Set(),
    });
    setQuery('');
    setSortBy('asc');
  };

  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = PACKAGES_DATA.filter((d) => {
      if (selected.khuVuc.size && !selected.khuVuc.has(d.khuVuc)) return false;
      if (selected.loai.size && !selected.loai.has(d.loai)) return false;
      if (selected.concepts.size && !d.concepts.some((c) => selected.concepts.has(c))) {
        return false;
      }
      if (
        selected.muc.size &&
        !PRICE_BUCKETS.some((b) => selected.muc.has(b.label) && b.match(d))
      ) {
        return false;
      }
      if (q) {
        const hay = `${d.studio} ${d.goi} ${d.boiCanh} ${d.khuVuc} ${d.luuY}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'name') {
        return a.studio.localeCompare(b.studio, 'vi') || (a.gia || 0) - (b.gia || 0);
      }
      const x = a.gia === null ? Infinity : a.gia;
      const y = b.gia === null ? Infinity : b.gia;
      if (sortBy === 'asc') return x - y;
      if (a.gia === null) return 1;
      if (b.gia === null) return -1;
      return y - x;
    });
  }, [selected, query, sortBy]);

  const exportCsv = () => {
    const headers = [
      'Studio',
      'Gói',
      'Giá (triệu)',
      'Khu vực',
      'Kiểu chụp',
      'Concept',
      'Bối cảnh',
      'Thời lượng',
      'Lưu ý',
    ];
    const rows = filteredList.map((d) => [
      d.studio,
      d.goi,
      d.gia === null ? 'Liên hệ' : d.giaMax ? `${d.gia}-${d.giaMax}` : d.gia,
      d.khuVuc,
      d.loai,
      d.concepts.join('; '),
      d.boiCanh,
      d.thoiLuong,
      d.luuY,
    ]);
    const csvContent =
      '\ufeff' +
      [headers, ...rows]
        .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
        .join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'goi-chup-anh-cuoi-thang-12.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="section" id="bang-goi">
      <h2>Tất cả lựa chọn, lọc theo nhu cầu</h2>
      <p className="lead">
        Giá niêm yết trên website studio (cập nhật tháng 11/2026). Chỉ tính buổi chụp Pre-wedding, chưa gồm váy và trang điểm ngày cưới.
      </p>

      <div className="mobile-filter-bar">
        <div className="search-box" style={{ flex: 1 }}>
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm studio, địa điểm…"
            aria-label="Tìm kiếm gói chụp trên điện thoại"
          />
        </div>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setMobileFiltersOpen((v) => !v)}
          aria-expanded={mobileFiltersOpen}
        >
          <SlidersHorizontal size={15} aria-hidden="true" />
          <span>Lọc{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
          {mobileFiltersOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      <div
        className={`filters-box ${mobileFiltersOpen ? 'is-open-mobile' : 'is-closed-mobile'}`}
        role="group"
        aria-label="Bộ lọc gói chụp"
      >
        {filterRows.map((row) => (
          <div className="filter-row" key={row.key}>
            <span className="filter-label">{row.label}</span>
            {row.values.map((val) => {
              const active = selected[row.key].has(val);
              return (
                <button
                  key={val}
                  type="button"
                  className="chip"
                  aria-pressed={active}
                  onClick={() => toggleFilter(row.key, val)}
                >
                  {val}
                </button>
              );
            })}
          </div>
        ))}

        <div className="filter-tools">
          <div className="search-box">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm studio, địa điểm, ghi chú…"
              aria-label="Tìm kiếm gói chụp"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sắp xếp gói chụp"
          >
            <option value="asc">Giá thấp đến cao</option>
            <option value="desc">Giá cao đến thấp</option>
            <option value="name">Theo tên studio</option>
          </select>

          <button type="button" className="btn-ghost" onClick={resetAll}>
            <RotateCcw size={15} aria-hidden="true" />
            Xóa bộ lọc
          </button>

          <button type="button" className="btn-ghost" onClick={exportCsv}>
            <Download size={15} aria-hidden="true" />
            Tải CSV
          </button>
        </div>
      </div>

      <p className="result-count tabular" aria-live="polite">
        Đang hiện <strong>{filteredList.length}</strong> / {PACKAGES_DATA.length} gói chụp
      </p>

      <div className="table-wrap desktop-only-table">
        <table>
          <thead>
            <tr>
              <th>Studio &amp; gói</th>
              <th>Giá</th>
              <th>Khu vực</th>
              <th>Bối cảnh</th>
              <th>Thời lượng</th>
              <th>Đi kèm &amp; lưu ý</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                  Không có gói nào khớp bộ lọc hiện tại. Bỏ bớt một tiêu chí để xem thêm.
                </td>
              </tr>
            ) : (
              filteredList.map((d) => {
                const isFit = d.gia !== null && d.gia >= 13 && d.gia <= 20;
                return (
                  <tr key={d.id}>
                    <td>
                      <button
                        type="button"
                        onClick={() => onSelectStudio(d.studio)}
                        className="studio-link-btn"
                        title={`Xem đánh giá ${d.studio}`}
                      >
                        {d.studio}
                      </button>
                      <div style={{ marginTop: 2, fontWeight: 500 }}>{d.goi}</div>
                      <div>
                        {isFit && <span className="tag fit">sát budget</span>}
                        {d.concepts.map((c) => (
                          <span className="tag primary" key={c}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="price-cell tabular">{formatPrice(d)}</td>
                    <td>
                      <div>{d.khuVuc}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{d.loai}</div>
                    </td>
                    <td>{d.boiCanh}</td>
                    <td>{d.thoiLuong}</td>
                    <td style={{ color: 'var(--ink-soft)' }}>{d.luuY}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mobile-package-list" aria-label="Danh sách gói chụp trên điện thoại">
        {filteredList.length === 0 ? (
          <div className="info-panel" style={{ textAlign: 'center', color: 'var(--muted)' }}>
            Không có gói nào khớp bộ lọc hiện tại. Bỏ bớt một tiêu chí để xem thêm.
          </div>
        ) : (
          <>
            {(mobileExpanded || activeFilterCount > 0 || query.trim() ? filteredList : filteredList.slice(0, 6)).map((d) => {
              const isFit = d.gia !== null && d.gia >= 13 && d.gia <= 20;
              return (
                <article className="mobile-pkg-card" key={d.id}>
                  <div className="mobile-pkg-head">
                    <div>
                      <button
                        type="button"
                        onClick={() => onSelectStudio(d.studio)}
                        className="studio-link-btn"
                      >
                        {d.studio}
                      </button>
                      <div className="mobile-pkg-name">{d.goi}</div>
                    </div>
                    <div className="price-cell tabular">{formatPrice(d)}</div>
                  </div>

                  <div className="mobile-pkg-tags">
                    {isFit && <span className="tag fit">sát budget</span>}
                    {d.concepts.map((c) => (
                      <span className="tag primary" key={c}>
                        {c}
                      </span>
                    ))}
                  </div>

                  <dl className="mobile-pkg-meta">
                    <div>
                      <dt>Khu vực</dt>
                      <dd>{d.khuVuc} · {d.loai}</dd>
                    </div>
                    <div>
                      <dt>Bối cảnh</dt>
                      <dd>{d.boiCanh}</dd>
                    </div>
                    <div>
                      <dt>Thời lượng</dt>
                      <dd>{d.thoiLuong}</dd>
                    </div>
                    <div>
                      <dt>Lưu ý</dt>
                      <dd>{d.luuY}</dd>
                    </div>
                  </dl>
                </article>
              );
            })}
            {!mobileExpanded && activeFilterCount === 0 && !query.trim() && filteredList.length > 6 && (
              <button
                type="button"
                className="btn-ghost"
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                onClick={() => setMobileExpanded(true)}
              >
                Xem thêm {filteredList.length - 6} gói còn lại
              </button>
            )}
            {mobileExpanded && activeFilterCount === 0 && !query.trim() && filteredList.length > 6 && (
              <button
                type="button"
                className="btn-ghost"
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                onClick={() => setMobileExpanded(false)}
              >
                Thu gọn danh sách
              </button>
            )}
          </>
        )}
      </div>

      <p className="note">
        Nhãn “sát budget” đánh dấu gói từ 13 đến 20 triệu. Các gói 8–12 triệu vẫn rất đáng cân nhắc vì còn dư 3–6 triệu cho vé phim trường, xe di chuyển hoặc nâng cấp váy/album.
      </p>
    </section>
  );
}
