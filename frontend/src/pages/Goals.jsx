import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../libs/apiCall';
import GlassCard, { PageHeader } from '../components/ui';
import GoalRing from '../components/dashboard/GoalRing';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', target: '', current: '', icon: '🎯' });

  const load = () => {
    api
      .get('/goals')
      .then((res) => setGoals(res.data.data || []))
      .catch(() => toast.error('Failed to load goals'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const createGoal = async (e) => {
    e.preventDefault();
    try {
      await api.post('/goals', form);
      toast.success('Goal created');
      setForm({ name: '', target: '', current: '', icon: '🎯' });
      load();
    } catch {
      toast.error('Failed to create goal');
    }
  };

  if (loading) return <p className="text-[var(--muted)]">Loading goals...</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Goals" subtitle="Track savings goals — MacBook fund, travel, emergency fund" />

      <GoalRing goals={goals} />

      <GlassCard>
        <p className="text-sm font-semibold mb-4">Create New Goal</p>
        <form onSubmit={createGoal} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Goal name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Icon (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          <Input label="Target amount (₹)" type="number" min="1" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} required />
          <Input label="Current saved (₹)" type="number" min="0" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} />
          <div className="md:col-span-2">
            <Button type="submit">Create Goal</Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
