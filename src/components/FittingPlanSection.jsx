import { CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { FITTING_TRIP_PLAN } from '../data/weddingData';

export default function FittingPlanSection() {
  return (
    <section className="section" id="lich-thu-vay">
      <h2>{FITTING_TRIP_PLAN.title}</h2>
      <p className="lead">{FITTING_TRIP_PLAN.subtitle}</p>

      <div className="timeline-list">
        {FITTING_TRIP_PLAN.timeline.map((step) => (
          <div className="timeline-item" key={step.time}>
            <div className="timeline-time tabular">
              <Clock size={14} aria-hidden="true" />
              <span>{step.time}</span>
            </div>
            <div className="timeline-body">
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="info-panel" style={{ marginTop: 18, background: 'var(--primary-soft)', borderColor: '#bfdbfe' }}>
        <div className="info-panel-head" style={{ color: 'var(--primary-ink)' }}>
          <Sparkles size={17} aria-hidden="true" />
          <h3 style={{ margin: 0 }}>Nếu chốt chụp ở Hạ Long thì sao?</h3>
        </div>
        <p style={{ color: 'var(--primary-ink)' }}>{FITTING_TRIP_PLAN.haLongNote}</p>
      </div>

      <div className="info-panel" style={{ marginTop: 18 }}>
        <h3 style={{ marginBottom: 10 }}>Chuẩn bị gì khi đi thử váy cưới?</h3>
        <ul className="review-list" style={{ marginTop: 0 }}>
          {FITTING_TRIP_PLAN.bringItems.map((item) => (
            <li key={item}>
              <CheckCircle2 size={16} color="var(--emerald)" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
