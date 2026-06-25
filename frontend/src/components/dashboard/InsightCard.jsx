import { Link } from 'react-router-dom';
import GlassCard from '../ui';

const styles = {
  warning: 'border-amber-200 bg-amber-50',
  success: 'border-emerald-200 bg-emerald-50',
  info: 'border-teal-200 bg-teal-50',
};

export default function InsightCard({ insight, showLink }) {
  if (!insight) return null;
  const style = styles[insight.type] || styles.info;

  return (
    <GlassCard className={`!border ${style}`} hover={false}>
      <div className="flex items-start gap-3">
        <span className="text-xl">💡</span>
        <div className="flex-1">
          <p className="text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">Insight</p>
          <p className="font-semibold mb-1 text-[var(--text)]">{insight.title}</p>
          <p className="text-sm text-[var(--muted)] mb-2">{insight.body}</p>
          <p className="text-sm text-emerald-700 font-medium">{insight.savings}</p>
          {showLink && (
            <Link to="/insights" className="inline-block mt-3 text-xs text-teal-700 font-medium hover:underline">
              See all insights →
            </Link>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
