import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(username, password);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-xl shadow p-6 space-y-4">
        <div className="text-center">
          <div className="text-3xl">🍽️</div>
          <h1 className="text-xl font-bold mt-1">Restro POS</h1>
          <p className="text-sm text-gray-500">Sign in to continue</p>
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 rounded p-2 text-center">{error}</div>}

        <label className="block">
          <span className="text-sm text-gray-600">Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:border-brand"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:border-brand"
          />
        </label>

        <button
          type="submit"
          disabled={busy}
          className="w-full py-2 rounded-md bg-brand hover:bg-brand-dark text-white font-semibold disabled:opacity-50"
        >
          {busy ? 'Signing in…' : 'Login'}
        </button>
        <p className="text-xs text-center text-gray-400">Default: admin / admin123</p>
      </form>
    </div>
  );
}
