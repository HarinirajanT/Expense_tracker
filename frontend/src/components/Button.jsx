export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const styles =
    variant === 'primary'
      ? 'bg-violet-600 hover:bg-violet-700 text-white'
      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100';

  return (
    <button
      type="button"
      className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
