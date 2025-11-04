import React, { useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Save, Download } from 'lucide-react';

function formatDateInput(d) {
  return d.toISOString().slice(0, 10);
}

function monthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function semesterKey(dateStr) {
  const d = new Date(dateStr);
  const m = d.getMonth() + 1; // 1-12
  const semester = m >= 7 && m <= 12 ? 1 : 2; // 1: Jul-Dec, 2: Jan-Jun
  // For clarity, bind semester to the calendar year of its months
  return `${d.getFullYear()}-S${semester}`;
}

export default function SiswaAbsensiNilai({ classes, students, setStudents, records, setRecords, mode = 'absensi' }) {
  const [tab, setTab] = useState(mode); // 'absensi' | 'nilai'
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editClass, setEditClass] = useState('');

  const today = formatDateInput(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [gradeScore, setGradeScore] = useState('');

  const studentsByClass = useMemo(() => {
    const map = {};
    for (const c of classes) map[c.id] = c.name;
    return students
      .map((s) => ({ ...s, className: map[s.classId] || '-' }))
      .sort((a, b) => a.className.localeCompare(b.className) || a.name.localeCompare(b.name));
  }, [classes, students]);

  const addStudent = () => {
    if (!newStudentName.trim()) return;
    const s = { id: crypto.randomUUID(), name: newStudentName.trim(), classId: newStudentClass || '' };
    setStudents((prev) => [...prev, s]);
    setNewStudentName('');
    setNewStudentClass('');
  };

  const startEdit = (s) => {
    setEditId(s.id);
    setEditName(s.name);
    setEditClass(s.classId || '');
  };

  const saveEdit = () => {
    setStudents((prev) => prev.map((s) => (s.id === editId ? { ...s, name: editName.trim() || s.name, classId: editClass } : s)));
    setEditId(null);
    setEditName('');
    setEditClass('');
  };

  const removeStudent = (id) => {
    if (!confirm('Hapus siswa ini?')) return;
    setStudents((prev) => prev.filter((s) => s.id !== id));
    // Optional: clean related records
    setRecords((prev) => {
      const r = { ...prev, attendance: { ...(prev.attendance || {}) }, grades: { ...(prev.grades || {}) } };
      for (const date of Object.keys(r.attendance)) {
        if (r.attendance[date] && r.attendance[date][id] !== undefined) {
          const { [id]: _, ...rest } = r.attendance[date];
          r.attendance[date] = rest;
        }
      }
      if (r.grades[id]) delete r.grades[id];
      return r;
    });
  };

  const setAttendance = (studentId, value) => {
    setRecords((prev) => {
      const r = { attendance: { ...(prev.attendance || {}) }, grades: { ...(prev.grades || {}) } };
      const day = { ...(r.attendance[selectedDate] || {}) };
      day[studentId] = value; // 'H', 'A', 'S'
      r.attendance[selectedDate] = day;
      return r;
    });
  };

  const addGrade = (studentId) => {
    const score = Number(gradeScore);
    if (isNaN(score)) return;
    setRecords((prev) => {
      const r = { attendance: { ...(prev.attendance || {}) }, grades: { ...(prev.grades || {}) } };
      const arr = r.grades[studentId] ? [...r.grades[studentId]] : [];
      arr.push({ date: selectedDate, score });
      r.grades[studentId] = arr;
      return r;
    });
    setGradeScore('');
  };

  const gradeAgg = useMemo(() => {
    const agg = { monthly: {}, semester: {} };
    for (const sid of Object.keys(records.grades || {})) {
      for (const g of records.grades[sid]) {
        const mk = monthKey(g.date);
        const sk = semesterKey(g.date);
        if (!agg.monthly[mk]) agg.monthly[mk] = {};
        if (!agg.monthly[mk][sid]) agg.monthly[mk][sid] = [];
        agg.monthly[mk][sid].push(g.score);
        if (!agg.semester[sk]) agg.semester[sk] = {};
        if (!agg.semester[sk][sid]) agg.semester[sk][sid] = [];
        agg.semester[sk][sid].push(g.score);
      }
    }
    // convert to average
    for (const mk of Object.keys(agg.monthly)) {
      for (const sid of Object.keys(agg.monthly[mk])) {
        const arr = agg.monthly[mk][sid];
        agg.monthly[mk][sid] = arr.reduce((a, b) => a + b, 0) / arr.length;
      }
    }
    for (const sk of Object.keys(agg.semester)) {
      for (const sid of Object.keys(agg.semester[sk])) {
        const arr = agg.semester[sk][sid];
        agg.semester[sk][sid] = arr.reduce((a, b) => a + b, 0) / arr.length;
      }
    }
    return agg;
  }, [records]);

  const exportCSV = () => {
    const rows = [["ID", "Nama", "Kelas", "Tanggal", "Absensi", "Nilai"]];
    const att = records.attendance || {};
    const grd = records.grades || {};
    for (const s of studentsByClass) {
      const gradeMap = {};
      (grd[s.id] || []).forEach((g) => {
        gradeMap[g.date] = (gradeMap[g.date] || []).concat([g.score]);
      });
      const allDates = new Set([
        ...Object.keys(att),
        ...Object.keys(gradeMap),
      ]);
      if (allDates.size === 0) {
        rows.push([s.id, s.name, s.className, '', '', '']);
      } else {
        Array.from(allDates).sort().forEach((d) => {
          const a = (att[d] && att[d][s.id]) || '';
          const gArr = gradeMap[d] || [];
          const g = gArr.length ? (gArr.reduce((x, y) => x + y, 0) / gArr.length).toFixed(2) : '';
          rows.push([s.id, s.name, s.className, d, a, g]);
        });
      }
    }
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'absensi_nilai.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    // Simple HTML table as XLS (Excel-compatible)
    let html = '<table><tr><th>ID</th><th>Nama</th><th>Kelas</th><th>Tanggal</th><th>Absensi</th><th>Nilai</th></tr>';
    const att = records.attendance || {};
    const grd = records.grades || {};
    for (const s of studentsByClass) {
      const gradeMap = {};
      (grd[s.id] || []).forEach((g) => {
        gradeMap[g.date] = (gradeMap[g.date] || []).concat([g.score]);
      });
      const allDates = new Set([
        ...Object.keys(att),
        ...Object.keys(gradeMap),
      ]);
      if (allDates.size === 0) {
        html += `<tr><td>${s.id}</td><td>${s.name}</td><td>${s.className}</td><td></td><td></td><td></td></tr>`;
      } else {
        Array.from(allDates).sort().forEach((d) => {
          const a = (att[d] && att[d][s.id]) || '';
          const gArr = gradeMap[d] || [];
          const g = gArr.length ? (gArr.reduce((x, y) => x + y, 0) / gArr.length).toFixed(2) : '';
          html += `<tr><td>${s.id}</td><td>${s.name}</td><td>${s.className}</td><td>${d}</td><td>${a}</td><td>${g}</td></tr>`;
        });
      }
    }
    html += '</table>';
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'absensi_nilai.xls';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:bg-white">
      {/* STUDENT CRUD */}
      <div className="rounded-xl p-5 bg-white/70 border border-emerald-100">
        <h3 className="text-lg font-semibold text-emerald-900 mb-3">Kelola Siswa</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            placeholder="Nama siswa"
            className="px-3 py-2 rounded-md border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <select
            value={newStudentClass}
            onChange={(e) => setNewStudentClass(e.target.value)}
            className="px-3 py-2 rounded-md border border-emerald-200"
          >
            <option value="">Pilih kelas (opsional)</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button onClick={addStudent} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
            <Plus size={18} /> Tambah Siswa
          </button>
        </div>
      </div>

      <div className="rounded-xl p-5 bg-white/70 border border-emerald-100 overflow-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setTab('absensi')} className={`px-4 py-2 rounded-md ${tab === 'absensi' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-900'}`}>Absensi</button>
            <button onClick={() => setTab('nilai')} className={`px-4 py-2 rounded-md ${tab === 'nilai' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-900'}`}>Nilai</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="px-3 py-2 rounded-md bg-emerald-50 text-emerald-900 hover:bg-emerald-100 flex items-center gap-2">
              <Download size={18} /> Ekspor CSV
            </button>
            <button onClick={exportExcel} className="px-3 py-2 rounded-md bg-emerald-50 text-emerald-900 hover:bg-emerald-100 flex items-center gap-2">
              <Download size={18} /> Ekspor Excel
            </button>
            <button onClick={exportPDF} className="px-3 py-2 rounded-md bg-emerald-50 text-emerald-900 hover:bg-emerald-100 flex items-center gap-2 print:hidden">
              <Download size={18} /> Ekspor PDF
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <label className="text-sm text-emerald-800/80">Tanggal:</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-3 py-2 rounded-md border border-emerald-200" />
          {tab === 'nilai' && (
            <>
              <label className="text-sm text-emerald-800/80">Nilai harian:</label>
              <input type="number" min="0" max="100" value={gradeScore} onChange={(e) => setGradeScore(e.target.value)} className="px-3 py-2 rounded-md border border-emerald-200 w-28" />
              <span className="text-sm text-emerald-800/80">(0-100)</span>
            </>
          )}
        </div>

        <table className="min-w-full border border-emerald-100 rounded-lg overflow-hidden">
          <thead className="bg-emerald-50 text-emerald-900">
            <tr>
              <th className="text-left px-3 py-2">Nama</th>
              <th className="text-left px-3 py-2">Kelas</th>
              {tab === 'absensi' ? (
                <>
                  <th className="text-left px-3 py-2">Status</th>
                </>
              ) : (
                <>
                  <th className="text-left px-3 py-2">Tambah Nilai</th>
                  <th className="text-left px-3 py-2">Rata Bulan Ini</th>
                  <th className="text-left px-3 py-2">Rata Semester</th>
                </>
              )}
              <th className="text-left px-3 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-100">
            {studentsByClass.map((s) => {
              const attVal = (records.attendance?.[selectedDate] || {})[s.id] || '';
              const mk = monthKey(selectedDate);
              const sk = semesterKey(selectedDate);
              const rMonthly = gradeAgg.monthly?.[mk]?.[s.id];
              const rSemester = gradeAgg.semester?.[sk]?.[s.id];
              return (
                <tr key={s.id}>
                  <td className="px-3 py-2">
                    {editId === s.id ? (
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} className="px-2 py-1 border rounded-md border-emerald-200" />
                    ) : (
                      <span className="font-medium text-emerald-900">{s.name}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {editId === s.id ? (
                      <select value={editClass} onChange={(e) => setEditClass(e.target.value)} className="px-2 py-1 border rounded-md border-emerald-200">
                        <option value="">-</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-emerald-900/90">{s.className}</span>
                    )}
                  </td>

                  {tab === 'absensi' ? (
                    <td className="px-3 py-2">
                      <select value={attVal} onChange={(e) => setAttendance(s.id, e.target.value)} className="px-2 py-1 border rounded-md border-emerald-200">
                        <option value="">-</option>
                        <option value="H">Hadir</option>
                        <option value="A">Alpa</option>
                        <option value="S">Sakit/Izin</option>
                      </select>
                    </td>
                  ) : (
                    <>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <button onClick={() => addGrade(s.id)} className="px-3 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
                            Simpan Nilai
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2">{rMonthly ? rMonthly.toFixed(2) : '-'}</td>
                      <td className="px-3 py-2">{rSemester ? rSemester.toFixed(2) : '-'}</td>
                    </>
                  )}

                  <td className="px-3 py-2">
                    {editId === s.id ? (
                      <button onClick={saveEdit} className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
                        <Save size={16} /> Simpan
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEdit(s)} className="px-3 py-1 rounded-md text-emerald-900 hover:bg-emerald-100 inline-flex items-center gap-2">
                          <Edit size={16} /> Edit
                        </button>
                        <button onClick={() => removeStudent(s.id)} className="px-3 py-1 rounded-md text-red-700 hover:bg-red-50 inline-flex items-center gap-2">
                          <Trash2 size={16} /> Hapus
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PRINT AREA FOR PDF */}
      <div className="hidden print:block">
        <h2 className="text-xl font-semibold mb-2">Rekap Absensi & Nilai</h2>
        <p className="mb-4 text-sm">Tanggal: {selectedDate}</p>
        <table className="w-full border">
          <thead>
            <tr>
              <th className="text-left px-2 py-1 border">Nama</th>
              <th className="text-left px-2 py-1 border">Kelas</th>
              <th className="text-left px-2 py-1 border">Absensi</th>
              <th className="text-left px-2 py-1 border">Rata Bulan</th>
              <th className="text-left px-2 py-1 border">Rata Semester</th>
            </tr>
          </thead>
          <tbody>
            {studentsByClass.map((s) => {
              const mk = monthKey(selectedDate);
              const sk = semesterKey(selectedDate);
              const rMonthly = gradeAgg.monthly?.[mk]?.[s.id];
              const rSemester = gradeAgg.semester?.[sk]?.[s.id];
              const attVal = (records.attendance?.[selectedDate] || {})[s.id] || '';
              return (
                <tr key={`print-${s.id}`}>
                  <td className="px-2 py-1 border">{s.name}</td>
                  <td className="px-2 py-1 border">{s.className}</td>
                  <td className="px-2 py-1 border">{attVal}</td>
                  <td className="px-2 py-1 border">{rMonthly ? rMonthly.toFixed(2) : '-'}</td>
                  <td className="px-2 py-1 border">{rSemester ? rSemester.toFixed(2) : '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
