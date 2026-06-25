import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hover = true, ...props }) {
  return (
    <motion.div
      className={`card p-6 ${hover ? 'card-hover' : ''} ${className}`}
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function PageHeader({ title, subtitle }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">{title}</h1>
      {subtitle && <p className="text-[var(--muted)] text-sm mt-1">{subtitle}</p>}
    </motion.div>
  );
}

export function formatINR(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}
