import GlassCard, { formatINR } from '../ui';

const items = [
  { key: 'income', label: 'Income', color: 'text-emerald-600' },
  { key: 'expenses', label: 'Expenses', color: 'text-rose-600' },
  { key: 'savings', label: 'Savings', color: 'text-teal-700' },
  { key: 'savingsRate', label: 'Savings Rate', color: 'text-amber-600', suffix: '%' },
];

export default function MonthlySnapshot({ snapshot }) {
  return (
    <GlassCard>
      <p className="text-sm text-[var(--muted)] mb-4">Monthly Snapshot</p>
      <div className="grid grid-cols-2 gap-4">
        {items.map(({ key, label, color, suffix }) => (
          <div key={key} className="rounded-xl bg-[var(--surface-muted)] p-4 border border-[var(--border)]">
            <p className="text-xs text-[var(--muted)] mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>
              {suffix ? `${snapshot?.[key] ?? 0}${suffix}` : formatINR(snapshot?.[key])}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
