import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, BookOpen } from 'lucide-react';

export default function ClassesManager() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newClass, setNewClass] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      } else {
        setError('Failed to fetch classes');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newClass })
      });

      if (res.ok) {
        setNewClass('');
        fetchClasses();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add class');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClass = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/classes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: editName })
      });

      if (res.ok) {
        setEditingId(null);
        fetchClasses();
      } else {
        setError('Failed to update class');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  const startEdit = (cls: any) => {
    setEditingId(cls.id);
    setEditName(cls.name);
  };

  const handleDeleteClass = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/classes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        fetchClasses();
      } else {
        setError('Failed to delete class');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-blue-900" size={32} /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Classes</h2>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Add New Class</h3>
        <form onSubmit={handleAddClass} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              required
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              placeholder="Class Name (e.g., JSS 1, SSS 2)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-900 text-white px-6 py-2 rounded-md hover:bg-blue-800 transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
            Add Class
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 font-semibold text-gray-700">ID</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Class Name</th>
              <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  No classes found. Add one above.
                </td>
              </tr>
            ) : (
              classes.map((cls) => (
                <tr key={cls.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-600">#{cls.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-blue-500" />
                      {editingId === cls.id ? (
                        <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="border px-2 py-1 rounded font-normal" />
                      ) : cls.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingId === cls.id ? (
                      <button onClick={() => handleEditClass(cls.id)} className="text-green-600 hover:text-green-900 mr-3">Save</button>
                    ) : (
                      <button onClick={() => startEdit(cls)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    )}
                    <button
                      onClick={() => handleDeleteClass(cls.id)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                      title="Delete Class"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
