import GlassCard from '../ui';

const COLORS = ['#e2e8f0', '#99f6e4', '#5eead4', '#fbbf24', '#f87171'];

export default function SpendingHeatmap({ heatmap }) {
  const weeks = [];
  for (let i = 0; i < (heatmap?.length || 0); i += 7) {
    weeks.push(heatmap.slice(i, i + 7));
  }

  return (
    <GlassCard>
      <p className="text-sm font-semibold text-[var(--text)] mb-1">Spending Heatmap</p>
      <p className="text-xs text-[var(--muted)] mb-4">Darker = more spending</p>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                title={`${new Date(day.date).toLocaleDateString()} — ₹${day.amount}`}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: COLORS[day.level] }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-[var(--muted)]">
        <span>Less</span>
        {COLORS.map((c, i) => (
          <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <span>More</span>
      </div>
    </GlassCard>
  );
}
