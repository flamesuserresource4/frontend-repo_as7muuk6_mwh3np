import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Save } from 'lucide-react';

export default function Classes({ classes, onAdd, onUpdate, onDelete }) {
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const addClass = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName('');
  };

  const startEdit = (cls) => {
    setEditingId(cls.id);
    setEditingName(cls.name);
  };

  const saveEdit = () => {
    const trimmed = editingName.trim();
    if (!trimmed) return;
    onUpdate(editingId, trimmed);
    setEditingId(null);
    setEditingName('');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-emerald-900 mb-4">Manajemen Kelas</h2>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama kelas baru (mis. VII A)"
          className="flex-1 px-4 py-2 rounded-md border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <button onClick={addClass} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
          <Plus size={18} /> Tambah Kelas
        </button>
      </div>

      <div className="space-y-2">
        {classes.length === 0 && (
          <p className="text-emerald-700">Belum ada kelas. Tambahkan kelas terlebih dahulu.</p>
        )}
        {classes.map((cls) => (
          <div key={cls.id} className="flex items-center justify-between bg-white border border-emerald-100 rounded-lg p-3">
            {editingId === cls.id ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-md border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button onClick={saveEdit} className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
                  <Save size={16} /> Simpan
                </button>
              </div>
            ) : (
              <div className="flex-1 font-medium text-emerald-900">{cls.name}</div>
            )}

            {editingId !== cls.id && (
              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(cls)} className="inline-flex items-center gap-1 px-3 py-2 text-emerald-900 hover:bg-emerald-100 rounded-md">
                  <Pencil size={16} /> Edit
                </button>
                <button onClick={() => onDelete(cls.id)} className="inline-flex items-center gap-1 px-3 py-2 text-red-700 hover:bg-red-50 rounded-md">
                  <Trash2 size={16} /> Hapus
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
