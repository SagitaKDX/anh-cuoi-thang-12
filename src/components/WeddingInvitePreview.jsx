import { useState } from 'react';
import { ArrowUpRight, Monitor, Smartphone } from 'lucide-react';
import './WeddingInvitePreview.css';

export default function WeddingInvitePreview() {
  const [previewMode, setPreviewMode] = useState('desktop');

  return (
    <section className="wedding-preview" aria-labelledby="wedding-preview-title">
      <header className="wedding-preview-heading">
        <div>
          <h1 id="wedding-preview-title">Thiệp mời thành hôn</h1>
          <p className="wedding-preview-intro">
            Tiến Anh và Thanh Thư · Ngày 20 tháng 12 năm 2026. Mở thiệp để cùng đón ngày chung đôi.
          </p>
        </div>
        <a
          className="wedding-preview-open"
          href="./thiep-moi.html"
          target="_blank"
          rel="noreferrer"
        >
          Mở thiệp toàn màn hình
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </header>

      <div className="wedding-preview-workspace">
        <div className="wedding-preview-toolbar">
          <span className="wedding-preview-caption">Bản xem trước</span>
          <div className="wedding-preview-switch" role="group" aria-label="Kích thước xem thiệp">
            <button
              type="button"
              aria-pressed={previewMode === 'desktop'}
              onClick={() => setPreviewMode('desktop')}
            >
              <Monitor size={16} aria-hidden="true" />
              <span>Máy tính</span>
            </button>
            <button
              type="button"
              aria-pressed={previewMode === 'mobile'}
              onClick={() => setPreviewMode('mobile')}
            >
              <Smartphone size={16} aria-hidden="true" />
              <span>Điện thoại</span>
            </button>
          </div>
        </div>

        <div className={`wedding-preview-canvas wedding-preview-canvas--${previewMode}`}>
          <div className="wedding-preview-viewport">
            <iframe
              src="./thiep-moi.html?preview=1"
              title="Thiệp cưới Lã Tiến Anh và Đỗ Thị Thanh Thư"
              allow="autoplay; fullscreen"
              className="wedding-preview-iframe"
            />
          </div>
        </div>
      </div>
      <p className="wedding-preview-footnote">
        Bản thiệp đang hoàn thiện. Thông tin địa điểm và mừng cưới sẽ được cập nhật trước khi gửi lời mời.
      </p>
    </section>
  );
}
