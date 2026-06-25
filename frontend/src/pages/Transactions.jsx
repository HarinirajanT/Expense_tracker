import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import api from '../libs/apiCall';
import { groupTimeline } from '../libs/financeEngine';
import GlassCard, { PageHeader, formatINR } from '../components/ui';
import Input from '../components/Input';
import Button from '../components/Button';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Income', 'Other'];

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ account_id: '', description: '', source: 'Food', amount: '', type: 'expense' });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const [txRes, accRes] = await Promise.all([api.get('/transaction/'), api.get('/account/')]);
      setTransactions(txRes.data.data || []);
      setAccounts(accRes.data.data || []);
      if (accRes.data.data?.length && !form.account_id) {
        setForm((f) => ({ ...f, account_id: String(accRes.data.data[0].id) }));
      }
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (filter !== 'all' && t.type !== filter) return false;
      if (search && !`${t.description} ${t.source}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [transactions, filter, search]);

  const timeline = useMemo(() => groupTimeline(filtered), [filtered]);

  const addTransaction = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/transaction/add-transaction/${form.account_id}`, {
        description: form.description,
        source: form.source,
        amount: form.amount,
        type: form.type,
      });
      toast.success(form.type === 'income' ? 'Income recorded' : 'Expense recorded');
      setForm((f) => ({ ...f, description: '', amount: '' }));
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save transaction');
    }
  };

  if (loading) return <p className="text-[var(--muted)]">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Transactions" subtitle="Record income and expenses — everything you add shows up here" />

      <GlassCard hover={false}>
        <p className="text-sm font-semibold mb-4 text-[var(--text)]">Add Transaction</p>
        {accounts.length === 0 ? (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-4">
            Create an account first in the Accounts tab before recording transactions.
          </p>
        ) : (
          <form onSubmit={addTransaction} className="space-y-4">
            <div className="flex gap-2">
              {['expense', 'income'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, type: t })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition ${
                    form.type === t
                      ? t === 'income' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      : 'bg-[var(--surface-muted)] text-[var(--muted)] border border-[var(--border)]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Account</label>
                <select
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"
                  value={form.account_id}
                  onChange={(e) => setForm({ ...form, account_id: e.target.value })}
                  required
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.account_name} ({formatINR(a.account_balance)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Category</label>
                <select
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required placeholder={form.type === 'income' ? 'e.g. Salary' : 'e.g. Lunch at cafe'} />
              <Input label="Amount (₹)" type="number" min="1" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <Button type="submit">
              {form.type === 'income' ? 'Add Income' : 'Add Expense'}
            </Button>
          </form>
        )}
      </GlassCard>

      <div className="flex flex-wrap gap-3 items-center">
        <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        {['all', 'income', 'expense'].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm capitalize font-medium transition ${
              filter === f ? 'bg-teal-600 text-white' : 'bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <GlassCard hover={false}>
        {timeline.length === 0 ? (
          <p className="text-[var(--muted)] text-sm text-center py-8">No transactions yet. Add your first one above.</p>
        ) : (
          <div className="space-y-6">
            {timeline.map(({ label, items }) => (
              <div key={label}>
                <p className="text-xs font-semibold text-teal-700 uppercase tracking-wider mb-3">{label}</p>
                <div className="space-y-1 pl-4 border-l-2 border-teal-200">
                  {items.map((t) => (
                    <div key={t.id} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-[var(--surface-muted)] transition">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${t.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <div>
                          <p className="font-medium text-[var(--text)]">{t.description}</p>
                          <p className="text-xs text-[var(--muted)]">{t.source}</p>
                        </div>
                      </div>
                      <span className={`font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatINR(t.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
