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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/sign-up', { firstName, email, password, confirmPassword });
      const { data } = await api.post('/auth/sign-in', { email, password });
      if (data.status === 'success') {
        setCredentials({ user: data.user, token: data.token });
        toast.success('Account created! Complete your setup.');
        navigate('/onboarding');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Sign up with your email — your data starts completely empty">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <Input label="Confirm password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
        <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Register'}</Button>
      </form>
      <p className="text-sm text-center text-[var(--muted)] mt-4">
        Already have an account? <Link to="/sign-in" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
