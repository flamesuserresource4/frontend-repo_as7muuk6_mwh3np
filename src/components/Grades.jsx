import React, { useMemo, useState } from 'react';
import { Calculator, Download } from 'lucide-react';

function monthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function semesterKey(dateStr) {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = d.getMonth() + 1; // 1-12
  // Semester 1: Juli (7) - Des (12) of current year
  // Semester 2: Jan (1) - Juni (6) of current year
  if (m >= 7) return `S1-${y}`; // July-Dec
  return `S2-${y}`; // Jan-Jun
}

export default function Grades({ classes, students, grades, onAddGrade, selectedClassId, setSelectedClassId }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [studentId, setStudentId] = useState('');
  const [score, setScore] = useState('');

  const studentsInClass = useMemo(() => students.filter(s => s.classId === selectedClassId), [students, selectedClassId]);

  const addGrade = () => {
    const val = Number(score);
    if (!studentId || Number.isNaN(val)) return;
    onAddGrade({ date, studentId, score: val, classId: selectedClassId });
    setScore('');
  };

  const computed = useMemo(() => {
    const daily = grades.filter(g => !selectedClassId || g.classId === selectedClassId);
    // Map student -> month -> [scores]
    const monthly = {};
    const semester = {};
    daily.forEach(g => {
      const mk = monthKey(g.date);
      const sk = semesterKey(g.date);
      monthly[g.studentId] = monthly[g.studentId] || {};
      monthly[g.studentId][mk] = monthly[g.studentId][mk] || [];
      monthly[g.studentId][mk].push(g.score);
      semester[g.studentId] = semester[g.studentId] || {};
      semester[g.studentId][sk] = semester[g.studentId][sk] || [];
      semester[g.studentId][sk].push(g.score);
    });

    const avg = (arr) => arr.reduce((a,b)=>a+b,0) / (arr.length || 1);

    return { monthly, semester, daily };
  }, [grades, selectedClassId]);

  const exportCSV = () => {
    const rows = [['Tanggal', 'Kelas', 'ID Siswa', 'Nama Siswa', 'Nilai']];
    const list = grades.filter(g => !selectedClassId || g.classId === selectedClassId);
    list.forEach(g => {
      const s = students.find(x => x.id === g.studentId);
      const c = classes.find(x => x.id === g.classId);
      rows.push([g.date, c?.name || '', s?.id || '', s?.name || '', g.score]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nilai_${selectedClassId || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-emerald-900">Nilai Harian</h2>
        <button onClick={exportCSV} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
          <Download size={18} /> Ekspor CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center mb-4">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-3 py-2 rounded-md border border-emerald-200" />
        <select value={selectedClassId || ''} onChange={(e) => setSelectedClassId(e.target.value || null)} className="px-3 py-2 rounded-md border border-emerald-200">
          <option value="">Pilih Kelas</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="px-3 py-2 rounded-md border border-emerald-200">
          <option value="">Pilih Siswa</option>
          {studentsInClass.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <input type="number" placeholder="Nilai" value={score} onChange={(e) => setScore(e.target.value)} className="w-24 px-3 py-2 rounded-md border border-emerald-200" />
        <button onClick={addGrade} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
          <Calculator size={18} /> Simpan Nilai
        </button>
      </div>

      {selectedClassId ? (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-emerald-100 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-emerald-50 text-emerald-900 font-medium">Rekap Bulanan</div>
            <div className="p-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="px-3 py-2">Siswa</th>
                    <th className="px-3 py-2">Bulan</th>
                    <th className="px-3 py-2">Rata-rata</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsInClass.flatMap(s => {
                    const m = computed.monthly[s.id] || {};
                    return Object.keys(m).sort().map(mk => (
                      <tr key={`${s.id}-${mk}`} className="border-t border-emerald-100">
                        <td className="px-3 py-2">{s.name}</td>
                        <td className="px-3 py-2">{mk}</td>
                        <td className="px-3 py-2">{(m[mk].reduce((a,b)=>a+b,0)/m[mk].length).toFixed(2)}</td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-emerald-100 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-emerald-50 text-emerald-900 font-medium">Rekap Semester</div>
            <div className="p-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="px-3 py-2">Siswa</th>
                    <th className="px-3 py-2">Semester</th>
                    <th className="px-3 py-2">Rata-rata</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsInClass.flatMap(s => {
                    const m = computed.semester[s.id] || {};
                    return Object.keys(m).sort().map(sk => (
                      <tr key={`${s.id}-${sk}`} className="border-t border-emerald-100">
                        <td className="px-3 py-2">{s.name}</td>
                        <td className="px-3 py-2">{sk === 'S1' ? 'Semester 1' : sk}</td>
                        <td className="px-3 py-2">{(m[sk].reduce((a,b)=>a+b,0)/m[sk].length).toFixed(2)}</td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-emerald-700">Pilih kelas untuk melihat rekap.</p>
      )}
    </div>
  );
}
