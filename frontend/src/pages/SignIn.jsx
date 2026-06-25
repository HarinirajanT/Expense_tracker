import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api, { isDemoMode } from '../libs/apiCall';
import { DEMO_USER } from '../libs/demoApi';
import useStore from '../store';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';

export default function SignIn() {
  const navigate = useNavigate();
  const setCredentials = useStore((s) => s.setCredentials);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/sign-in', { email, password });
      if (data.status === 'success') {
        setCredentials({ user: data.user, token: data.token });
        toast.success('Welcome back!');
        navigate(data.user.onboarded === false ? '/onboarding' : '/overview');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign in" subtitle="Enter your email and password to open your dashboard.">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
      </form>
      <p className="text-sm text-center text-[var(--muted)] mt-4">
        New here? <Link to="/sign-up" className="text-indigo-600 font-semibold hover:underline">Create account</Link>
      </p>
      {isDemoMode && (
        <button type="button" onClick={() => { setEmail(DEMO_USER.email); setPassword(DEMO_USER.password); }}
          className="w-full mt-4 text-xs text-[var(--muted)] hover:text-indigo-600">
          Try demo account
        </button>
      )}
    </AuthLayout>
  );
}
