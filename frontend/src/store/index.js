import { create } from 'zustand';
import { setAuthToken } from '../libs/apiCall';

const stored = localStorage.getItem('user');
const parsed = stored ? JSON.parse(stored) : null;
if (parsed?.token) setAuthToken(parsed.token);

const useStore = create((set) => ({
  user: parsed,
  setCredentials: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      setAuthToken(user.token);
    } else {
      localStorage.removeItem('user');
      setAuthToken(null);
    }
    set({ user });
  },
}));

export default useStore;
