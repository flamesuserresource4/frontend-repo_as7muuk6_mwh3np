import React, { useMemo, useState } from 'react';
import { CalendarDays, Download } from 'lucide-react';

const STATUS = [
  { key: 'H', label: 'Hadir', color: 'bg-emerald-600' },
  { key: 'I', label: 'Izin', color: 'bg-yellow-500' },
  { key: 'S', label: 'Sakit', color: 'bg-blue-500' },
  { key: 'A', label: 'Alpa', color: 'bg-red-600' },
];

export default function Attendance({ classes, students, records, onMark, selectedClassId, setSelectedClassId }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const studentsInClass = useMemo(() => students.filter(s => s.classId === selectedClassId), [students, selectedClassId]);

  const mark = (studentId, status) => {
    onMark({ date, studentId, status, classId: selectedClassId });
  };

  const exportCSV = () => {
    const rows = [['Tanggal', 'Kelas', 'ID Siswa', 'Nama Siswa', 'Status']];
    const rec = records[date]?.[selectedClassId] || {};
    studentsInClass.forEach(s => {
      rows.push([date, (classes.find(c => c.id === selectedClassId)?.name) || '', s.id, s.name, rec[s.id] || '']);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `absensi_${date}_${selectedClassId || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-emerald-900">Absensi</h2>
        <button onClick={exportCSV} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
          <Download size={18} /> Ekspor CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="text-emerald-700" size={18} />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-3 py-2 rounded-md border border-emerald-200" />
        </div>
        <select value={selectedClassId || ''} onChange={(e) => setSelectedClassId(e.target.value || null)} className="px-3 py-2 rounded-md border border-emerald-200">
          <option value="">Pilih Kelas</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {!selectedClassId && (
        <p className="text-emerald-700">Silakan pilih kelas terlebih dahulu.</p>
      )}

      {selectedClassId && (
        <div className="bg-white border border-emerald-100 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-emerald-50 text-emerald-900">
              <tr>
                <th className="text-left px-4 py-3">Nama Siswa</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tandai</th>
              </tr>
            </thead>
            <tbody>
              {studentsInClass.map((s) => {
                const current = records[date]?.[selectedClassId]?.[s.id] || '';
                return (
                  <tr key={s.id} className="border-t border-emerald-100">
                    <td className="px-4 py-2 text-emerald-900">{s.name}</td>
                    <td className="px-4 py-2">
                      {current && (
                        <span className={`inline-block text-white text-xs px-2 py-1 rounded ${STATUS.find(x => x.key === current)?.color || 'bg-gray-400'}`}>
                          {STATUS.find(x => x.key === current)?.label || current}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        {STATUS.map(st => (
                          <button key={st.key} onClick={() => mark(s.id, st.key)} className={`text-white text-sm px-3 py-1 rounded ${st.color} hover:opacity-90`}>
                            {st.key}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
