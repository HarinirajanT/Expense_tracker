export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg)]">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-11 h-11 flex items-center justify-center bg-indigo-600 rounded-xl text-white font-bold text-xl">₹</div>
          <div>
            <span className="text-2xl font-bold">Expense Tracker</span>
            <p className="text-xs text-[var(--muted)]">Track income & expenses</p>
          </div>
        </div>
        <div className="card p-8">
          <h1 className="text-2xl font-bold mb-1">{title}</h1>
          <p className="text-[var(--muted)] text-sm mb-6">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
