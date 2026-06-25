import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../libs/apiCall';
import GlassCard, { PageHeader, formatINR } from '../components/ui';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Subscriptions() {
  const [subs, setSubs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', amount: '', cycle: 'monthly', next_due: '' });

  const load = () => {
    api.get('/subscriptions').then((res) => {
      setSubs(res.data.data || []);
      setTotal(res.data.total || 0);
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.post('/subscriptions', form);
      toast.success('Subscription added');
      setForm({ name: '', amount: '', cycle: 'monthly', next_due: '' });
      load();
    } catch { toast.error('Failed to add'); }
  };

  const remove = async (id) => {
    await api.delete(`/subscriptions/${id}`);
    toast.success('Removed');
    load();
  };

  if (loading) return <p className="text-[var(--muted)]">Loading...</p>;

  const annual = total * 12;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title="Subscriptions" subtitle="Track recurring charges — Netflix, Spotify, Prime, and more" />

      <GlassCard className="text-center" hover={false}>
        <p className="text-sm text-[var(--muted)]">Total Monthly</p>
        <p className="text-3xl font-bold text-rose-600">{formatINR(total)}</p>
        <p className="text-xs text-[var(--muted)] mt-1">≈ {formatINR(annual)}/year</p>
      </GlassCard>

      <div className="space-y-3">
        {subs.map((s) => (
          <GlassCard key={s.id} hover={false} className="!p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">{s.name}</p>
              <p className="text-xs text-[var(--muted)]">
                Next billing: {s.next_due ? new Date(s.next_due).toLocaleDateString('en-IN') : '—'} · {s.cycle}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold">{formatINR(s.amount)}/mo</span>
              <button type="button" onClick={() => remove(s.id)} className="text-xs text-rose-600 hover:underline">Remove</button>
            </div>
          </GlassCard>
        ))}
        {subs.length === 0 && (
          <p className="text-center text-[var(--muted)] text-sm py-8">No subscriptions tracked. Add yours below.</p>
        )}
      </div>

      <GlassCard hover={false}>
        <p className="font-semibold mb-4">Add Subscription</p>
        <form onSubmit={add} className="grid md:grid-cols-2 gap-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Netflix" />
          <Input label="Monthly cost (₹)" type="number" min="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          <Input label="Next billing date" type="date" value={form.next_due} onChange={(e) => setForm({ ...form, next_due: e.target.value })} />
          <div className="flex items-end"><Button type="submit">Add</Button></div>
        </form>
      </GlassCard>
    </div>
  );
}
