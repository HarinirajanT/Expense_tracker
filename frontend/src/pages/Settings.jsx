import useStore from '../store';
import GlassCard, { PageHeader } from '../components/ui';
import Button from '../components/Button';

export default function Settings() {
  const user = useStore((s) => s.user);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(user, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rupeeflow-profile.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearLocalData = () => {
    if (window.confirm('Clear all RupeeFlow local data? This cannot be undone.')) {
      localStorage.removeItem('finsight_ai_db_v1');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="Settings" subtitle="Your profile and preferences" />

      <GlassCard hover={false}>
        <p className="text-sm text-[var(--muted)] mb-4">Profile</p>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-[var(--muted)]">Name</p>
            <p className="font-semibold">{user?.user?.firstname || user?.user?.firstName || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted)]">Email</p>
            <p className="font-semibold">{user?.user?.email || '—'}</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard hover={false}>
        <p className="text-sm text-[var(--muted)] mb-4">Preferences</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Currency</p>
            <p className="text-xs text-[var(--muted)]">Indian Rupee (INR)</p>
          </div>
          <span className="text-lg">₹</span>
        </div>
      </GlassCard>

      <GlassCard hover={false}>
        <p className="text-sm text-[var(--muted)] mb-4">Data</p>
        <p className="text-sm text-[var(--muted)] mb-4">Your accounts and transactions are stored in your browser session.</p>
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={exportData} className="!w-auto px-5">Export Profile</Button>
          <Button type="button" variant="secondary" onClick={clearLocalData} className="!w-auto px-5 text-rose-600">Reset All Data</Button>
        </div>
      </GlassCard>
    </div>
  );
}
