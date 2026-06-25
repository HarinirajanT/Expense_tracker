import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../libs/apiCall';
import Card from '../components/Card';
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
      toast.success('Account created');
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
      toast.success('Deposit successful');
      setDeposit((d) => ({ ...d, amount: '' }));
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Deposit failed');
    }
  };

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Accounts</h1>
        <p className="text-slate-500 text-sm">Manage wallets and deposit funds</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Create Account">
          <form onSubmit={createAccount} className="space-y-4">
            <Input label="Account name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Account number" value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} required />
            <Input label="Initial balance (₹)" type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            <Button type="submit">Create Account</Button>
          </form>
        </Card>

        <Card title="Add Money">
          {accounts.length === 0 ? (
            <p className="text-sm text-slate-500">Create an account first.</p>
          ) : (
            <form onSubmit={addMoney} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Account</label>
                <select
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm"
                  value={deposit.id}
                  onChange={(e) => setDeposit({ ...deposit, id: e.target.value })}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.account_name}</option>
                  ))}
                </select>
              </div>
              <Input label="Amount (₹)" type="number" min="1" value={deposit.amount} onChange={(e) => setDeposit({ ...deposit, amount: e.target.value })} required />
              <Button type="submit">Deposit</Button>
            </form>
          )}
        </Card>
      </div>

      <Card title="Your Accounts">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {accounts.map((a) => (
            <div key={a.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <p className="font-semibold text-lg">{a.account_name}</p>
              <p className="text-xs text-slate-500 mb-2">{a.account_number}</p>
              <p className="text-2xl font-bold text-violet-600">₹{Number(a.account_balance).toLocaleString('en-IN')}</p>
            </div>
          ))}
          {accounts.length === 0 && <p className="text-slate-500 text-sm">No accounts yet.</p>}
        </div>
      </Card>
    </div>
  );
}
