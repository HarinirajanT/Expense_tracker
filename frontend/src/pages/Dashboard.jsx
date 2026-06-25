import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../libs/apiCall';
import Card from '../components/Card';

function Stat({ label, value, color }) {
  return (
    <Card className="!p-5">
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>₹{Number(value || 0).toLocaleString('en-IN')}</p>
    </Card>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/transaction/dashboard')
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Loading dashboard...</p>;
  if (!data) return <p className="text-red-500">Failed to load dashboard. Is the backend running?</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-500 text-sm">Your financial overview at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="Available Balance" value={data.availableBalance} color="text-violet-600" />
        <Stat label="Total Income" value={data.totalIncome} color="text-emerald-600" />
        <Stat label="Total Expense" value={data.totalExpense} color="text-rose-500" />
      </div>

      <Card title="Income vs Expense (This Year)">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#f43f5e" name="Expense" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Recent Transactions">
          <ul className="space-y-3">
            {(data.lastTransactions || []).map((t) => (
              <li key={t.id} className="flex justify-between text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <p className="font-medium">{t.description}</p>
                  <p className="text-slate-500 text-xs">{t.source}</p>
                </div>
                <span className={t.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}>
                  {t.type === 'income' ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN')}
                </span>
              </li>
            ))}
            {(!data.lastTransactions || data.lastTransactions.length === 0) && (
              <p className="text-slate-500 text-sm">No transactions yet. Add an account and record expenses.</p>
            )}
          </ul>
        </Card>

        <Card title="Your Accounts">
          <ul className="space-y-3">
            {(data.lastAccount || []).map((a) => (
              <li key={a.id} className="flex justify-between text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <p className="font-medium">{a.account_name}</p>
                  <p className="text-slate-500 text-xs">{a.account_number}</p>
                </div>
                <span className="font-semibold text-violet-600">
                  ₹{Number(a.account_balance).toLocaleString('en-IN')}
                </span>
              </li>
            ))}
            {(!data.lastAccount || data.lastAccount.length === 0) && (
              <p className="text-slate-500 text-sm">No accounts yet. Create one in the Accounts tab.</p>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
