import { motion } from 'framer-motion';
import GlassCard from '../ui';

export default function HealthScore({ score = 0, label = 'Fair' }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <GlassCard className="flex flex-col items-center justify-center text-center">
      <p className="text-sm text-[var(--muted)] mb-4 w-full text-left">Financial Health</p>
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#d8e0db" strokeWidth="8" />
          <motion.circle
            cx="60" cy="60" r="54" fill="none" stroke="#0d9488" strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-[var(--text)]">{score}</span>
          <span className="text-xs text-[var(--muted)]">/ 100</span>
        </div>
      </div>
      <p className="mt-3 text-lg font-semibold text-teal-700">{label}</p>
    </GlassCard>
  );
}
