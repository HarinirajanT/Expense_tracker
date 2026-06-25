import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../libs/apiCall';
import GlassCard, { PageHeader, formatINR } from '../components/ui';

const PIE_COLORS = ['#0d9488', '#14b8a6', '#059669', '#f59e0b', '#e11d48', '#6366f1'];
const tooltipStyle = { backgroundColor: '#fff', border: '1px solid #d8e0db', borderRadius: 12, color: '#1a2e28' };

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/intelligence/analytics').then((res) => setData(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-[var(--muted)]">Loading analytics...</p>;
  if (!data) return <p className="text-rose-600">Failed to load analytics.</p>;

  const hasExpenses = (data.categoryData || []).length > 0;
  const topCategories = [...(data.categoryData || [])].slice(0, 5);

  if (!hasExpenses) {
    return (
      <div className="max-w-2xl mx-auto">
        <PageHeader title="Analytics" subtitle="Charts built from your transactions" />
        <div className="card p-10 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-bold text-lg mb-2">No data to chart yet</p>
          <p className="text-sm text-[var(--muted)] mb-6">Add some expenses and income first, then come back here.</p>
          <Link to="/transactions" className="text-teal-700 font-semibold hover:underline">Add transactions →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader title="Analytics" subtitle="Charts built from your real transaction data" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard hover={false}>
          <p className="text-sm text-[var(--muted)] mb-4">Spending by Category</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {data.categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatINR(v)} contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <GlassCard hover={false}>
          <p className="text-sm text-[var(--muted)] mb-4">Income vs Expense</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip formatter={(v) => formatINR(v)} contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="income" fill="#059669" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#e11d48" name="Expense" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <GlassCard hover={false}>
          <p className="text-sm text-[var(--muted)] mb-4">Savings Growth</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.savingsGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip formatter={(v) => formatINR(v)} contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="savings" stroke="#0d9488" fill="rgba(13,148,136,0.15)" name="Savings" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <GlassCard hover={false}>
          <p className="text-sm text-[var(--muted)] mb-4">Monthly Trend</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip formatter={(v) => formatINR(v)} contentStyle={tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#059669" strokeWidth={2} name="Income" dot={false} />
                <Line type="monotone" dataKey="expense" stroke="#e11d48" strokeWidth={2} name="Expense" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
      <GlassCard hover={false}>
        <p className="text-sm text-[var(--muted)] mb-4">Top Spending Categories</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topCategories} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip formatter={(v) => formatINR(v)} contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#0d9488" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
