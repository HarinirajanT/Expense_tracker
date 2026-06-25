import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../libs/apiCall';
import GlassCard, { PageHeader, formatINR } from '../components/ui';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ name: '', account_number: '', amount: '' });
  const [deposit, setDeposit] = useState({ id: '', amount: '' });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get('/account/');
      setAccounts(data.data || []);
      if (data.data?.length) setDeposit((d) => ({ ...d, id: String(data.data[0].id) }));
    } catch {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createAccount = async (e) => {
    e.preventDefault();
    try {
      await api.post('/account/create', {
        name: form.name,
        account_number: form.account_number,
        amount: form.amount,
      });
      toast.success('Account created!');
      setForm({ name: '', account_number: '', amount: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create account');
    }
  };

  const addMoney = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/account/add-money/${deposit.id}`, { amount: deposit.amount });
      toast.success('Deposit recorded');
      setDeposit((d) => ({ ...d, amount: '' }));
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Deposit failed');
    }
  };

  if (loading) return <p className="text-[var(--muted)]">Loading...</p>;

  const totalBalance = accounts.reduce((s, a) => s + Number(a.account_balance), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Accounts" subtitle="Create your wallets and bank accounts with your real balances" />

      {accounts.length > 0 && (
        <GlassCard className="text-center">
          <p className="text-sm text-[var(--muted)] mb-1">Total Balance</p>
          <p className="text-4xl font-bold text-gradient-brand">{formatINR(totalBalance)}</p>
        </GlassCard>
      )}

      {accounts.length === 0 && (
        <div className="card p-8 text-center border-dashed border-2 border-teal-300 bg-teal-50/50">
          <p className="text-4xl mb-3">🏦</p>
          <p className="font-bold text-lg mb-2">No accounts yet</p>
          <p className="text-sm text-[var(--muted)] max-w-sm mx-auto">
            Create your first account below — e.g. &quot;HDFC Savings&quot; with your current balance.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {accounts.map((a) => (
          <GlassCard key={a.id}>
            <p className="text-xs text-[var(--muted)] mb-1">{a.account_number}</p>
            <p className="font-semibold text-lg mb-2 text-[var(--text)]">{a.account_name}</p>
            <p className="text-2xl font-bold text-teal-700">{formatINR(a.account_balance)}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard hover={false}>
          <p className="text-sm font-semibold mb-4 text-[var(--text)]">Create Account</p>
          <form onSubmit={createAccount} className="space-y-4">
            <Input label="Account name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Main Wallet" />
            <Input label="Account number / ID" value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} required placeholder="e.g. ACC-001" />
            <Input label="Current balance (₹)" type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required placeholder="0" />
            <Button type="submit">Create Account</Button>
          </form>
        </GlassCard>

        <GlassCard hover={false}>
          <p className="text-sm font-semibold mb-4 text-[var(--text)]">Add Money (Income)</p>
          {accounts.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">Create an account first.</p>
          ) : (
            <form onSubmit={addMoney} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Account</label>
                <select
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"
                  value={deposit.id}
                  onChange={(e) => setDeposit({ ...deposit, id: e.target.value })}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.account_name}</option>
                  ))}
                </select>
              </div>
              <Input label="Amount (₹)" type="number" min="1" value={deposit.amount} onChange={(e) => setDeposit({ ...deposit, amount: e.target.value })} required placeholder="e.g. 30000" />
              <Button type="submit">Record Deposit</Button>
            </form>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
