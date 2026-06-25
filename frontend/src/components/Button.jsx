export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const styles =
    variant === 'primary'
      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20'
      : 'bg-[var(--surface)] hover:bg-[var(--surface-muted)] text-[var(--text)] border border-[var(--border)]';

  return (
    <button
      type="button"
      className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
