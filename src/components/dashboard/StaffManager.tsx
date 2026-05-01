import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Key } from 'lucide-react';

export default function StaffManager() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [assignedClass, setAssignedClass] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editAssignedClass, setEditAssignedClass] = useState('');

  const fetchTeachers = () => {
    fetch('/api/teachers', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setTeachers(data));
  };

  const fetchClasses = () => {
    fetch('/api/classes', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setClasses(data));
  };

  const handlePasswordReset = async (userId: number) => {
    const newPassword = prompt('Enter new password for this staff member (min 6 characters):');
    if (!newPassword || newPassword.length < 6) {
      alert('Password reset cancelled or invalid. Minimum 6 characters required.');
      return;
    }

    try {
      const res = await fetch(`/api/users/${userId}/force-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ password: newPassword })
      });
      if (res.ok) {
        alert('Password reset successfully!');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to reset password');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to reset password');
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchClasses();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/teachers', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ username, name, password, assignedClass })
    });
    setUsername('');
    setName('');
    setPassword('');
    setAssignedClass('');
    fetchTeachers();
  };

  const handleEdit = async (id: number) => {
    await fetch(`/api/teachers/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ name: editName, assignedClass: editAssignedClass })
    });
    setEditingId(null);
    fetchTeachers();
  };

  const startEdit = (teacher: any) => {
    setEditingId(teacher.id);
    setEditName(teacher.name);
    setEditAssignedClass(teacher.assignedClass || '');
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/teachers/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    fetchTeachers();
  };

  const handleUpdateClass = async (id: number, newClass: string) => {
    await fetch(`/api/teachers/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ assignedClass: newClass })
    });
    fetchTeachers();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Staff (Teachers)</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <h3 className="text-lg font-semibold mb-4">Add New Teacher</h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Class</label>
            <select value={assignedClass} onChange={e => setAssignedClass(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white">
              <option value="">None</option>
              {classes.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Default: staff123" className="w-full px-3 py-2 border rounded-md" />
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Class</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teachers.map(teacher => (
              <tr key={teacher.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingId === teacher.id ? (
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="border px-2 py-1 rounded" />
                  ) : teacher.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select 
                    value={editingId === teacher.id ? editAssignedClass : (teacher.assignedClass || '')} 
                    onChange={(e) => {
                      if (editingId === teacher.id) {
                        setEditAssignedClass(e.target.value);
                      } else {
                        handleUpdateClass(teacher.id, e.target.value);
                      }
                    }}
                    className="px-2 py-1 border rounded-md bg-white text-sm"
                  >
                    <option value="">None</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handlePasswordReset(teacher.id)} title="Reset Password" className="text-orange-600 hover:text-orange-900 mr-3">
                    <Key size={20} />
                  </button>
                  {editingId === teacher.id ? (
                    <button onClick={() => handleEdit(teacher.id)} className="text-green-600 hover:text-green-900 mr-3">Save</button>
                  ) : (
                    <button onClick={() => startEdit(teacher)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                  )}
                  <button onClick={() => handleDelete(teacher.id)} className="text-red-600 hover:text-red-900">
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
