import { motion } from 'framer-motion';
import { formatINR } from '../ui';

export default function HeroCard({ greeting, name, hero }) {
  const { spendChange, spendPct, savedThisWeek } = hero || {};

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl p-6 md:p-8 border border-indigo-500 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 shadow-lg shadow-indigo-600/20"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="relative z-10 text-white">
        <p className="text-white/90 text-sm font-medium mb-1">{greeting},</p>
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">
          {name} <span aria-hidden="true">👋</span>
        </h2>
        {savedThisWeek > 0 ? (
          <p className="text-lg text-white">
            You&apos;ve saved <span className="font-bold text-emerald-300">{formatINR(savedThisWeek)}</span> this week.
          </p>
        ) : spendChange === 'more' && spendPct > 0 ? (
          <p className="text-lg text-amber-200 font-medium">Spending is up {spendPct}% vs last week.</p>
        ) : spendChange === 'less' && spendPct > 0 ? (
          <p className="text-lg text-white">You spent {spendPct}% less than last week. Keep going!</p>
        ) : (
          <p className="text-base text-white/95 font-medium">
            Track your expenses to unlock weekly insights.
          </p>
        )}
      </div>
    </motion.div>
  );
}
