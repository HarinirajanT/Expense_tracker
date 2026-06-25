import { create } from 'zustand';
import { isDemoMode, isJwtToken, setAuthToken, setOnUnauthorized } from '../libs/apiCall';

function loadUser() {
  try {
    const stored = localStorage.getItem('user');
    const parsed = stored ? JSON.parse(stored) : null;
    if (parsed?.token && !isDemoMode && !isJwtToken(parsed.token)) {
      localStorage.removeItem('user');
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}

const initial = loadUser();
if (initial?.token) setAuthToken(initial.token);

const useStore = create((set) => ({
  user: initial,
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

setOnUnauthorized(() => {
  useStore.getState().setCredentials(null);
  if (!window.location.pathname.includes('/sign-in')) {
    window.location.href = '/sign-in';
  }
});

export default useStore;
