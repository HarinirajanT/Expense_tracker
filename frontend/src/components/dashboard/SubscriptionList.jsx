import GlassCard, { formatINR } from '../ui';

export default function SubscriptionList({ subscriptions, total }) {
  return (
    <GlassCard>
      <p className="text-sm font-semibold text-[var(--text)] mb-4">Subscriptions</p>
      <div className="space-y-3">
        {(subscriptions || []).map((s) => (
          <div key={s.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-sm">📺</div>
              <span className="font-medium text-[var(--text)]">{s.name}</span>
            </div>
            <span className="text-[var(--muted)]">{formatINR(s.amount)}/mo</span>
          </div>
        ))}
        {(!subscriptions || subscriptions.length === 0) && (
          <p className="text-sm text-[var(--muted)]">No subscriptions tracked yet.</p>
        )}
      </div>
      {(subscriptions?.length > 0) && (
        <div className="mt-4 pt-4 border-t border-[var(--border)] flex justify-between items-center">
          <span className="text-sm text-[var(--muted)]">Total Monthly</span>
          <span className="text-lg font-bold text-rose-600">{formatINR(total)}</span>
        </div>
      )}
    </GlassCard>
  );
}
