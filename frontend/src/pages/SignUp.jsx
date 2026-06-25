import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../libs/apiCall';
import useStore from '../store';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';

export default function SignUp() {
  const navigate = useNavigate();
  const setCredentials = useStore((s) => s.setCredentials);
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/sign-up', { firstName, email, password });
      const { data } = await api.post('/auth/sign-in', { email, password });
      if (data.status === 'success') {
        setCredentials({ user: data.user, token: data.token });
        toast.success('Account created!');
        navigate('/overview');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Start tracking your finances today.">
      <form onSubmit={submit} className="space-y-4">
        <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Sign up'}</Button>
      </form>
      <p className="text-sm text-center text-slate-500 mt-4">
        Already have an account?{' '}
        <Link to="/sign-in" className="text-violet-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
