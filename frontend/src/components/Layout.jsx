import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { RiCurrencyFill } from 'react-icons/ri';
import useStore from '../store';

const links = [
  { label: 'Dashboard', to: '/overview' },
  { label: 'Transactions', to: '/transactions' },
  { label: 'Accounts', to: '/accounts' },
];

export default function Layout() {
  const { user, setCredentials } = useStore();
  const navigate = useNavigate();

  const signOut = () => {
    setCredentials(null);
    navigate('/sign-in');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Link to="/overview" className="flex items-center gap-2">
            <div className="w-11 h-11 flex items-center justify-center bg-violet-700 rounded-xl">
              <RiCurrencyFill className="text-white text-2xl" />
            </div>
            <span className="text-xl font-bold">Smart Expense Tracker</span>
          </Link>

          <nav className="flex flex-wrap gap-2">
            {links.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-medium transition ${
                    isActive
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.user?.firstname || user?.user?.firstName}</p>
              <p className="text-xs text-slate-500">{user?.user?.email}</p>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Sign out
            </button>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
