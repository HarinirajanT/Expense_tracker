import GlassCard, { formatINR } from '../ui';

function Ring({ pct, icon }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#e2e8f0" strokeWidth="5" />
        <circle cx="32" cy="32" r={r} fill="none" stroke="#4f46e5" strokeWidth="5"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg">{icon}</span>
    </div>
  );
}

function daysUntil(dateStr) {
  if (!dateStr) return 365;
  return Math.max(1, Math.ceil((new Date(dateStr) - new Date()) / 86400000));
}

export default function GoalRing({ goals, compact }) {
  const list = compact ? (goals || []).slice(0, 2) : goals;

  return (
    <GlassCard>
      <p className="text-sm font-semibold mb-4">{compact ? 'Goal Progress' : 'Savings Goals'}</p>
      <div className="space-y-4">
        {(list || []).map((g) => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100));
          const remaining = g.target - g.current;
          const days = daysUntil(g.target_date);
          const daily = Math.ceil(remaining / days);
          return (
            <div key={g.id} className="flex items-center gap-4">
              <Ring pct={pct} icon={g.icon || '🎯'} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{g.name}</p>
                <p className="text-sm text-[var(--muted)]">{formatINR(g.current)} / {formatINR(g.target)}</p>
                <div className="mt-2 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                {remaining > 0 && (
                  <p className="text-xs text-indigo-600 mt-1 font-medium">Save {formatINR(daily)}/day to reach goal</p>
                )}
              </div>
            </div>
          );
        })}
        {(!list || list.length === 0) && (
          <p className="text-sm text-[var(--muted)]">No goals yet. <a href="/goals" className="text-indigo-600">Create one</a></p>
        )}
      </div>
    </GlassCard>
  );
}
