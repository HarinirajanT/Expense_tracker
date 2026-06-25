import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../libs/apiCall';
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
        navigate('/overview');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign in" subtitle="Track expenses, accounts, and insights in one place.">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
      </form>
      <p className="text-sm text-center text-slate-500 mt-4">
        No account?{' '}
        <Link to="/sign-up" className="text-violet-600 font-medium hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
