import React from 'react';
import { Home, Layers, ClipboardList, BookOpen, LogIn, LogOut, GraduationCap } from 'lucide-react';

const NavButton = ({ active, label, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
      active ? 'bg-emerald-600 text-white' : 'text-emerald-900 hover:bg-emerald-100'
    }`}
  >
    <Icon size={18} />
    <span className="font-medium">{label}</span>
  </button>
);

export default function Navbar({ currentPage, setCurrentPage, appName, currentUser, onLogout }) {
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-emerald-50/80 border-b border-emerald-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white grid place-items-center shadow">
            <GraduationCap size={20} />
          </div>
          <h1 className="text-emerald-900 font-semibold tracking-tight">
            {appName}
          </h1>
        </div>

        <nav className="flex items-center gap-2">
          <NavButton
            label="Dashboard"
            icon={Home}
            active={currentPage === 'dashboard'}
            onClick={() => setCurrentPage('dashboard')}
          />
          <NavButton
            label="Kelas"
            icon={Layers}
            active={currentPage === 'kelas'}
            onClick={() => setCurrentPage('kelas')}
          />
          <NavButton
            label="Absensi"
            icon={ClipboardList}
            active={currentPage === 'absensi'}
            onClick={() => setCurrentPage('absensi')}
          />
          <NavButton
            label="Nilai Siswa"
            icon={BookOpen}
            active={currentPage === 'nilai'}
            onClick={() => setCurrentPage('nilai')}
          />
        </nav>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-emerald-900 text-sm">Halo, <span className="font-semibold">{currentUser.username}</span></span>
              <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2 rounded-md text-emerald-900 hover:bg-emerald-100">
                <LogOut size={18} />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <button onClick={() => setCurrentPage('login')} className="flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
              <LogIn size={18} />
              <span>Masuk/Daftar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
