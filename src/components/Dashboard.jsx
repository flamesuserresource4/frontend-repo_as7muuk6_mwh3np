import React from 'react';
import { Users, Layers, ClipboardCheck, BookOpen } from 'lucide-react';

export default function Dashboard({ stats }) {
  const cards = [
    { label: 'Total Siswa', value: stats.students, icon: Users },
    { label: 'Total Kelas', value: stats.classes, icon: Layers },
    { label: 'Rekaman Absensi (bulan ini)', value: stats.attendanceThisMonth, icon: ClipboardCheck },
    { label: 'Entri Nilai (bulan ini)', value: stats.gradesThisMonth, icon: BookOpen },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-emerald-900">Dashboard</h2>
        <p className="text-emerald-700">Ringkasan aktivitas terbaru.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-emerald-100 bg-white shadow-sm p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white grid place-items-center">
              <Icon size={20} />
            </div>
            <div>
              <p className="text-sm text-emerald-700">{label}</p>
              <p className="text-xl font-semibold text-emerald-900">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
