import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../libs/apiCall';
import useStore from '../store';
import Input from '../components/Input';
import Button from '../components/Button';

const GOALS = ['Buy Laptop', 'Travel', 'Emergency Fund', 'New Phone', 'Custom'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, setCredentials } = useStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    monthlyIncome: '',
    currentSavings: '',
    currency: 'INR',
    goalName: 'Emergency Fund',
    goalTarget: '',
    targetDate: '',
  });

  const submit = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/user/onboarding', form);
      setCredentials({ user: data.user, token: user.token });
      toast.success('Setup complete!');
      navigate('/overview');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">₹</div>
          <h1 className="text-2xl font-bold">Welcome, {user?.user?.firstname || user?.user?.firstName}!</h1>
          <p className="text-[var(--muted)] text-sm mt-2">Set up your accounts — only the details you enter will show up.</p>
        </div>

        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${step >= s ? 'bg-indigo-600' : 'bg-[var(--border)]'}`} />
          ))}
        </div>

        <div className="card p-8">
          {step === 1 && (
            <>
              <h2 className="font-bold text-lg mb-4">Your finances</h2>
              <div className="space-y-4">
                <Input label="Monthly income (₹)" type="number" min="0" value={form.monthlyIncome}
                  onChange={(e) => setForm({ ...form, monthlyIncome: e.target.value })} placeholder="e.g. 30000" />
                <Input label="Current savings (₹)" type="number" min="0" value={form.currentSavings}
                  onChange={(e) => setForm({ ...form, currentSavings: e.target.value })} placeholder="e.g. 5000" />
                <div>
                  <label className="block text-sm font-medium mb-1.5">Currency</label>
                  <select className="w-full rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm"
                    value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>
              <Button type="button" className="mt-6" onClick={() => setStep(2)}>Continue</Button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-bold text-lg mb-4">Your first goal</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Goal type</label>
                  <select className="w-full rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm"
                    value={form.goalName} onChange={(e) => setForm({ ...form, goalName: e.target.value })}>
                    {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <Input label="Target amount (₹)" type="number" min="0" value={form.goalTarget}
                  onChange={(e) => setForm({ ...form, goalTarget: e.target.value })} placeholder="e.g. 80000" />
                <Input label="Target date" type="date" value={form.targetDate}
                  onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="button" variant="secondary" onClick={() => setStep(1)}>Back</Button>
                <Button type="button" onClick={() => setStep(3)}>Continue</Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-bold text-lg mb-4">You&apos;re all set</h2>
              <div className="space-y-3 text-sm bg-[var(--surface-muted)] rounded-xl p-4">
                <p><span className="text-[var(--muted)]">Income:</span> <strong>₹{form.monthlyIncome || '0'}/mo</strong></p>
                <p><span className="text-[var(--muted)]">Savings:</span> <strong>₹{form.currentSavings || '0'}</strong></p>
                <p><span className="text-[var(--muted)]">Goal:</span> <strong>{form.goalName} — ₹{form.goalTarget || '0'}</strong></p>
              </div>
              <p className="text-xs text-[var(--muted)] mt-4">
                We&apos;ll create your wallet and goal. All future transactions are added by you — nothing is pre-filled.
              </p>
              <div className="flex gap-3 mt-6">
                <Button type="button" variant="secondary" onClick={() => setStep(2)}>Back</Button>
                <Button type="button" disabled={loading} onClick={submit}>
                  {loading ? 'Setting up...' : 'Start tracking'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
