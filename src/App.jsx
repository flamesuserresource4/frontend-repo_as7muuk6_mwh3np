import React, { useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Classes from './components/Classes';
import SiswaAbsensiNilai from './components/SiswaAbsensiNilai';

const APP_NAME = 'ABSENSI SISWA MAS AL-WASHLIYAH NAGUR';

const STORAGE_KEYS = {
  classes: 'absensi_classes',
  students: 'absensi_students',
  records: 'absensi_records',
  users: 'absensi_users',
  currentUser: 'absensi_current_user',
};

function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
}

function AuthPanel({ onSuccess }) {
  const [users, setUsers] = useLocalStorageState(STORAGE_KEYS.users, []);
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Lengkapi username dan password');
      return;
    }
    if (mode === 'register') {
      if (users.some((u) => u.username === username)) {
        setError('Username sudah digunakan');
        return;
      }
      const newUser = { id: crypto.randomUUID(), username, password };
      const list = [...users, newUser];
      setUsers(list);
      onSuccess(newUser);
    } else {
      const user = users.find((u) => u.username === username && u.password === password);
      if (!user) {
        setError('Username atau password salah');
        return;
      }
      onSuccess(user);
    }
  };

  return (
    <div className="max-w-md mx-auto rounded-xl p-6 bg-white/80 border border-emerald-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-emerald-900">{mode === 'login' ? 'Masuk' : 'Daftar'} Akun</h3>
        <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-emerald-700 underline">
          {mode === 'login' ? 'Buat akun baru' : 'Sudah punya akun? Masuk'}
        </button>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-sm text-emerald-800/80">Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 rounded-md border border-emerald-200" />
        </div>
        <div>
          <label className="text-sm text-emerald-800/80">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 rounded-md border border-emerald-200" />
        </div>
        {error && <div className="text-red-700 text-sm">{error}</div>}
        <button type="submit" className="w-full px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">{mode === 'login' ? 'Masuk' : 'Daftar'}</button>
      </form>
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [classes, setClasses] = useLocalStorageState(STORAGE_KEYS.classes, []);
  const [students, setStudents] = useLocalStorageState(STORAGE_KEYS.students, []);
  const [records, setRecords] = useLocalStorageState(STORAGE_KEYS.records, { attendance: {}, grades: {} });
  const [currentUser, setCurrentUser] = useLocalStorageState(STORAGE_KEYS.currentUser, null);

  const filteredData = useMemo(() => {
    if (!currentUser) return { classes, students };
    // Multi-user isolation placeholder: scope by user id if needed later
    return { classes, students };
  }, [classes, students, currentUser]);

  const onLogout = () => setCurrentUser(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200">
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        appName={APP_NAME}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {!currentUser && currentPage !== 'login' && (
          <div className="mb-6 p-4 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-900">
            Silakan masuk untuk menyimpan data Anda secara lokal di perangkat ini.
          </div>
        )}

        {currentPage === 'login' ? (
          <AuthPanel onSuccess={(u) => { setCurrentUser(u); setCurrentPage('dashboard'); }} />
        ) : null}

        {currentPage === 'dashboard' && (
          <Dashboard classes={classes} students={students} records={records} />
        )}

        {currentPage === 'kelas' && (
          <Classes classes={classes} setClasses={setClasses} />
        )}

        {currentPage === 'absensi' && (
          <SiswaAbsensiNilai
            classes={classes}
            students={students}
            setStudents={setStudents}
            records={records}
            setRecords={setRecords}
            mode="absensi"
          />
        )}

        {currentPage === 'nilai' && (
          <SiswaAbsensiNilai
            classes={classes}
            students={students}
            setStudents={setStudents}
            records={records}
            setRecords={setRecords}
            mode="nilai"
          />
        )}
      </main>

      <footer className="mt-10 py-6 text-center text-sm text-emerald-800/70">
        © {new Date().getFullYear()} {APP_NAME}
      </footer>
    </div>
  );
}
