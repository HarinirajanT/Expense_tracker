import { Navigate, Route, Routes } from 'react-router-dom';
import useStore from './store';
import Layout from './components/Layout';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Goals from './pages/Goals';
import Insights from './pages/Insights';
import Subscriptions from './pages/Subscriptions';
import Accounts from './pages/Accounts';
import Settings from './pages/Settings';

function PrivateRoute({ children, requireOnboarded = false }) {
  const user = useStore((s) => s.user);
  if (!user?.token) return <Navigate to="/sign-in" replace />;
  if (requireOnboarded && user.user?.onboarded === false) return <Navigate to="/onboarding" replace />;
  return children;
}

function OnboardingRoute({ children }) {
  const user = useStore((s) => s.user);
  if (!user?.token) return <Navigate to="/sign-in" replace />;
  if (user.user?.onboarded) return <Navigate to="/overview" replace />;
  return children;
}

function PublicRoute({ children }) {
  const user = useStore((s) => s.user);
  if (user?.token) {
    if (user.user?.onboarded === false) return <Navigate to="/onboarding" replace />;
    return <Navigate to="/overview" replace />;
  }
  return children;
}

export default function App() {
  const user = useStore((s) => s.user);

  const rootRedirect = () => {
    if (!user?.token) return <Navigate to="/sign-in" replace />;
    if (user.user?.onboarded === false) return <Navigate to="/onboarding" replace />;
    return <Navigate to="/overview" replace />;
  };

  return (
    <Routes>
      <Route path="/" element={rootRedirect()} />
      <Route path="/sign-in" element={<PublicRoute><SignIn /></PublicRoute>} />
      <Route path="/sign-up" element={<PublicRoute><SignUp /></PublicRoute>} />
      <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />
      <Route element={<PrivateRoute requireOnboarded><Layout /></PrivateRoute>}>
        <Route path="/overview" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/sign-in" replace />} />
    </Routes>
  );
}
