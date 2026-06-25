import { Link } from 'react-router-dom';
import { RiCurrencyFill } from 'react-icons/ri';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 flex items-center justify-center bg-violet-700 rounded-xl">
            <RiCurrencyFill className="text-white text-3xl" />
          </div>
          <span className="text-2xl font-bold">Smart Expense Tracker</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold mb-1">{title}</h1>
          <p className="text-slate-500 text-sm mb-6">{subtitle}</p>
          {children}
        </div>
        <p className="text-center text-sm text-slate-500 mt-6">
          <Link to="/sign-in" className="text-violet-600 hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
