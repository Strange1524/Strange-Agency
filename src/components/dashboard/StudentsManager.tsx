import React, { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';

export default function StudentsManager() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editClass, setEditClass] = useState('');
  const [editDepartment, setEditDepartment] = useState('');

  const fetchStudents = () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    fetch('/api/students', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => {
      if (user && user.role === 'teacher' && user.assignedClass) {
        setStudents(data.filter((s: any) => s.class === user.assignedClass));
      } else {
        setStudents(data);
      }
    });
  };

  const fetchClasses = () => {
    fetch('/api/classes', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setClasses(data));
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/students', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ studentId, name, studentClass, password, department })
    });
    setStudentId('');
    setName('');
    setStudentClass('');
    setDepartment('');
    setPassword('');
    fetchStudents();
  };

  const handleEdit = async (id: number) => {
    await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ name: editName, studentClass: editClass, department: editDepartment })
    });
    setEditingId(null);
    fetchStudents();
  };

  const startEdit = (student: any) => {
    setEditingId(student.id);
    setEditName(student.name);
    setEditClass(student.class);
    setEditDepartment(student.department || '');
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/students/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    fetchStudents();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Students</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <h3 className="text-lg font-semibold mb-4">Add New Student</h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
            <input type="text" required value={studentId} onChange={e => setStudentId(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select required value={studentClass} onChange={e => {
              setStudentClass(e.target.value);
              if (!e.target.value.toUpperCase().includes('SS')) setDepartment('');
            }} className="w-full px-3 py-2 border rounded-md bg-white">
              <option value="">Select Class</option>
              {classes.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          {studentClass.toUpperCase().includes('SS') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select required value={department} onChange={e => setDepartment(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white">
                <option value="">Select Dept</option>
                <option value="Science">Science</option>
                <option value="Art">Art</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Default: student123" className="w-full px-3 py-2 border rounded-md" />
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map(student => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.studentId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingId === student.id ? (
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="border px-2 py-1 rounded" />
                  ) : student.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingId === student.id ? (
                    <select value={editClass} onChange={e => {
                      setEditClass(e.target.value);
                      if (!e.target.value.toUpperCase().includes('SS')) setEditDepartment('');
                    }} className="border px-2 py-1 rounded">
                      {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  ) : student.class}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingId === student.id && editClass.toUpperCase().includes('SS') ? (
                    <select value={editDepartment} onChange={e => setEditDepartment(e.target.value)} className="border px-2 py-1 rounded">
                      <option value="">Select</option>
                      <option value="Science">Science</option>
                      <option value="Art">Art</option>
                    </select>
                  ) : student.department || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === student.id ? (
                    <button onClick={() => handleEdit(student.id)} className="text-green-600 hover:text-green-900 mr-3">Save</button>
                  ) : (
                    <button onClick={() => startEdit(student)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                  )}
                  <button onClick={() => handleDelete(student.id)} className="text-red-600 hover:text-red-900">
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
