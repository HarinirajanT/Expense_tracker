import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../libs/apiCall';
import { PageHeader } from '../components/ui';
import InsightCard from '../components/dashboard/InsightCard';

export default function Insights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/intelligence/insights')
      .then((res) => setInsights(res.data.insights || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-[var(--muted)]">Loading insights...</p>;

  const isDefaultOnly = insights.length === 1 && insights[0]?.id === 'default';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title="Insights" subtitle="Spending patterns detected from your transactions" />

      {isDefaultOnly ? (
        <div className="card p-10 text-center">
          <p className="text-4xl mb-3">💡</p>
          <p className="font-bold text-lg mb-2">Not enough data yet</p>
          <p className="text-sm text-[var(--muted)] mb-6">
            Record a week of expenses and insights will appear here automatically.
          </p>
          <Link to="/transactions" className="text-teal-700 font-semibold hover:underline">Add transactions →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
}
