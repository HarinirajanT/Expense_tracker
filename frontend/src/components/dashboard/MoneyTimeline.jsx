import { Link } from 'react-router-dom';
import GlassCard, { formatINR } from '../ui';

export default function MoneyTimeline({ timeline, compact = false }) {
  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-[var(--text)]">Money Timeline</p>
        {!compact && (
          <Link to="/transactions" className="text-xs text-teal-700 font-medium hover:underline">View all</Link>
        )}
      </div>
      <div className="space-y-5">
        {(timeline || []).map(({ label, items }) => (
          <div key={label}>
            <p className="text-xs font-semibold text-teal-700 uppercase tracking-wider mb-2">{label}</p>
            <div className="space-y-2 pl-3 border-l-2 border-teal-200">
              {items.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-1.5">
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{t.description}</p>
                    <p className="text-xs text-[var(--muted)]">{t.source}</p>
                  </div>
                  <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatINR(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {(!timeline || timeline.length === 0) && (
          <p className="text-sm text-[var(--muted)]">No transactions yet.</p>
        )}
      </div>
    </GlassCard>
  );
}
