import React, { useState } from 'react';
import { UserPlus, LogIn } from 'lucide-react';

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!username || !password) return;
    // Simple local auth demo. In real app, connect to backend.
    onLogin({ username });
  };

  return (
    <div className="min-h-[60vh] grid place-items-center p-6">
      <div className="w-full max-w-md bg-white border border-emerald-100 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-emerald-900">{mode === 'login' ? 'Masuk' : 'Daftar'} Akun</h2>
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-emerald-700 hover:underline">
            {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />

          <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
            {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
            <span>{mode === 'login' ? 'Masuk' : 'Daftar'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
