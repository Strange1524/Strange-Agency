import React, { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';

export default function SubjectsManager() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');

  const fetchSubjects = () => {
    fetch('/api/subjects', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setSubjects(data));
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/subjects', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ name, code })
    });
    setName('');
    setCode('');
    fetchSubjects();
  };

  const handleEdit = async (id: number) => {
    await fetch(`/api/subjects/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ name: editName, code: editCode })
    });
    setEditingId(null);
    fetchSubjects();
  };

  const startEdit = (subject: any) => {
    setEditingId(subject.id);
    setEditName(subject.name);
    setEditCode(subject.code);
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/subjects/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    fetchSubjects();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Subjects</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <h3 className="text-lg font-semibold mb-4">Add New Subject</h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
            <input type="text" required value={code} onChange={e => setCode(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
          </div>
          <button type="submit" className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 flex items-center justify-center gap-2">
            <Plus size={20} /> Add
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subjects.map(subject => (
              <tr key={subject.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {editingId === subject.id ? (
                    <input type="text" value={editCode} onChange={e => setEditCode(e.target.value)} className="border px-2 py-1 rounded w-24" />
                  ) : subject.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingId === subject.id ? (
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="border px-2 py-1 rounded" />
                  ) : subject.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === subject.id ? (
                    <button onClick={() => handleEdit(subject.id)} className="text-green-600 hover:text-green-900 mr-3">Save</button>
                  ) : (
                    <button onClick={() => startEdit(subject)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                  )}
                  <button onClick={() => handleDelete(subject.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
