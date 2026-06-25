import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';
import api from '../libs/apiCall';
import GlassCard, { PageHeader, formatINR } from '../components/ui';
import HeroCard from '../components/dashboard/HeroCard';
import GoalRing from '../components/dashboard/GoalRing';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/intelligence/dashboard').then((res) => setData(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-[var(--muted)] text-center py-20">Loading dashboard...</p>;
  if (!data) return <p className="text-rose-600">Failed to load dashboard.</p>;

  const snap = data.snapshot || {};

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader title="Dashboard" subtitle="Your financial overview" />

      <HeroCard greeting={data.greeting} name={data.name} hero={data.hero} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Income', value: snap.income, color: 'text-emerald-600' },
          { label: 'Expense', value: snap.expenses, color: 'text-rose-600' },
          { label: 'Savings', value: snap.savings, color: 'text-indigo-600' },
          { label: 'Net Balance', value: snap.netBalance, color: 'text-[var(--text)]' },
        ].map(({ label, value, color }) => (
          <GlassCard key={label} hover={false} className="!p-4">
            <p className="text-xs text-[var(--muted)] mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{formatINR(value)}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard hover={false}>
          <p className="text-sm font-semibold mb-4">Spending Trend</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData || []}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip formatter={(v) => formatINR(v)} />
                <Line type="monotone" dataKey="expense" stroke="#dc2626" strokeWidth={2} dot={false} name="Expense" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-semibold">Recent Transactions</p>
            <Link to="/transactions" className="text-xs text-indigo-600 font-medium hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {(data.recentTransactions || []).map((t) => (
              <div key={t.id} className="flex justify-between text-sm py-2 border-b border-[var(--border)] last:border-0">
                <div>
                  <p className="font-medium">{t.description}</p>
                  <p className="text-xs text-[var(--muted)]">{t.source}</p>
                </div>
                <span className={`font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatINR(t.amount)}
                </span>
              </div>
            ))}
            {(!data.recentTransactions || data.recentTransactions.length === 0) && (
              <p className="text-sm text-[var(--muted)] text-center py-4">
                No transactions yet. <Link to="/transactions" className="text-indigo-600">Add one</Link>
              </p>
            )}
          </div>
        </GlassCard>
      </div>

      <GoalRing goals={data.goals} compact />

      <Link to="/transactions" className="fab hidden lg:flex" title="Add transaction">+</Link>
    </div>
  );
}
