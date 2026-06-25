import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../libs/apiCall';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ account_id: '', description: '', source: '', amount: '' });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [txRes, accRes] = await Promise.all([
        api.get('/transaction/'),
        api.get('/account/'),
      ]);
      setTransactions(txRes.data.data || []);
      setAccounts(accRes.data.data || []);
      if (accRes.data.data?.length && !form.account_id) {
        setForm((f) => ({ ...f, account_id: String(accRes.data.data[0].id) }));
      }
    } catch (err) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/transaction/add-transaction/${form.account_id}`, {
        description: form.description,
        source: form.source,
        amount: form.amount,
      });
      toast.success('Expense recorded');
      setForm((f) => ({ ...f, description: '', source: '', amount: '' }));
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense');
    }
  };

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-slate-500 text-sm">Add expenses and view your history</p>
      </div>

      <Card title="Add Expense">
        {accounts.length === 0 ? (
          <p className="text-sm text-amber-600">Create an account first in the Accounts tab.</p>
        ) : (
          <form onSubmit={addExpense} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Account</label>
              <select
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm"
                value={form.account_id}
                onChange={(e) => setForm({ ...form, account_id: e.target.value })}
                required
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.account_name} (₹{a.account_balance})
                  </option>
                ))}
              </select>
            </div>
            <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            <Input label="Category / Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} required />
            <Input label="Amount (₹)" type="number" min="1" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            <div className="md:col-span-2">
              <Button type="submit">Add Expense</Button>
            </div>
          </form>
        )}
      </Card>

      <Card title="All Transactions">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <th className="pb-2 pr-4">Description</th>
                <th className="pb-2 pr-4">Source</th>
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-3 pr-4">{t.description}</td>
                  <td className="py-3 pr-4 text-slate-500">{t.source}</td>
                  <td className="py-3 pr-4 capitalize">{t.type}</td>
                  <td className="py-3 pr-4">{t.status}</td>
                  <td className={`py-3 text-right font-medium ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {t.type === 'income' ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && <p className="text-slate-500 py-4">No transactions found.</p>}
        </div>
      </Card>
    </div>
  );
}
