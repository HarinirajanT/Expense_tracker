import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiDashboardLine, RiExchangeLine, RiBarChartBoxLine, RiFlagLine,
  RiLightbulbLine, RiWallet3Line, RiSettings3Line, RiLogoutBoxRLine, RiRepeatLine,
} from 'react-icons/ri';
import useStore from '../store';

const nav = [
  { label: 'Dashboard', to: '/overview', icon: RiDashboardLine },
  { label: 'Transactions', to: '/transactions', icon: RiExchangeLine },
  { label: 'Analytics', to: '/analytics', icon: RiBarChartBoxLine },
  { label: 'Goals', to: '/goals', icon: RiFlagLine },
  { label: 'Insights', to: '/insights', icon: RiLightbulbLine },
  { label: 'Subscriptions', to: '/subscriptions', icon: RiRepeatLine },
  { label: 'Accounts', to: '/accounts', icon: RiWallet3Line },
  { label: 'Settings', to: '/settings', icon: RiSettings3Line },
];

export default function Layout() {
  const { user, setCredentials } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const signOut = () => {
    setCredentials(null);
    navigate('/sign-in');
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg)]">
      <aside className="hidden lg:flex flex-col w-60 bg-[var(--surface)] border-r border-[var(--border)] p-5 shrink-0">
        <div className="flex items-center gap-2.5 mb-10 px-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">₹</div>
          <div>
            <p className="font-bold text-sm">Expense Tracker</p>
            <p className="text-[10px] text-[var(--muted)]">Personal Finance</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5">
          {nav.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'text-[var(--muted)] hover:bg-[var(--surface-muted)]'
                }`}>
              <Icon className="text-lg" />{label}
            </NavLink>
          ))}
        </nav>
        <div className="pt-4 border-t border-[var(--border)]">
          <div className="px-3 mb-3">
            <p className="text-sm font-semibold truncate">{user?.user?.firstname || user?.user?.firstName}</p>
            <p className="text-xs text-[var(--muted)] truncate">{user?.user?.email}</p>
          </div>
          <button type="button" onClick={signOut}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-[var(--muted)] hover:bg-[var(--surface-muted)]">
            <RiLogoutBoxRLine /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[var(--surface)] border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">₹</div>
            <p className="font-bold">Expense Tracker</p>
          </div>
          <button type="button" onClick={signOut} className="text-sm text-[var(--muted)]">Sign out</button>
        </header>
        <nav className="lg:hidden flex gap-1 overflow-x-auto px-4 py-2 bg-[var(--surface)] border-b border-[var(--border)] text-xs">
          {nav.map(({ label, to }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `px-3 py-1.5 rounded-full whitespace-nowrap font-medium ${isActive ? 'bg-indigo-600 text-white' : 'text-[var(--muted)]'}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <main className="flex-1 p-4 md:p-8 overflow-auto pb-24">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <NavLink to="/transactions" className="fab lg:hidden" title="Add transaction">+</NavLink>
      </div>
    </div>
  );
}
