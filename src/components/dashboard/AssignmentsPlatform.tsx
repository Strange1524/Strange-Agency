import React, { useState, useEffect, useRef } from 'react';
import { Paperclip, Plus, Download, Trash2, Bell } from 'lucide-react';

export default function AssignmentsPlatform({ user }: { user: any }) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedClass, setAssignedClass] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAssignments();
    if (user.role !== 'student') {
      fetchClasses();
    }
  }, []);

  const fetchAssignments = async () => {
    const res = await fetch('/api/assignments', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setAssignments(await res.json());
  };

  const fetchClasses = async () => {
    const res = await fetch('/api/classes', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setClasses(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedClass && user.role !== 'admin') {
      // If teacher has assignedClass in their profile, we could default to it, but they should select it or it defaults to their class
      if (!user.assignedClass) {
        alert("You are not assigned to a class. Contact admin.");
        return;
      }
    }
    
    const targetClass = assignedClass || user.assignedClass;
    if (!targetClass) {
      alert("Please select a class.");
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('assignedClass', targetClass);
    if (file) {
      formData.append('attachment', file);
    }

    const res = await fetch('/api/assignments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData
    });

    if (res.ok) {
      alert("Assignment sent to students!");
      setTitle('');
      setDescription('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchAssignments();
    } else {
      const d = await res.json();
      alert("Error: " + d.error);
    }
  };

  const isTeacherOrAdmin = user.role === 'teacher' || user.role === 'admin';

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Assignments & Notifications</h2>

      {isTeacherOrAdmin && (
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <h3 className="text-lg font-bold mb-4">Send New Assignment / Notification</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="e.g. Math Homework" />
              </div>
              {user.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select required value={assignedClass} onChange={e => setAssignedClass(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message / Instructions</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-md" rows={4} placeholder="Type your message here..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (Optional)</label>
              <input type="file" ref={fileInputRef} onChange={e => setFile(e.target.files?.[0] || null)} className="w-full" />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
              <Plus size={20} /> Publish Assignment
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {assignments.length === 0 ? (
          <p className="text-gray-500">No assignments found.</p>
        ) : (
          assignments.map(a => (
            <div key={a.id} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{a.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">Class: {a.assignedClass} • {new Date(a.createdAt).toLocaleString()}</p>
                </div>
                {user.role === 'admin' && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Admin View</span>}
              </div>
              <div className="text-gray-700 whitespace-pre-wrap">{a.description}</div>
              {a.attachmentUrl && (
                <div className="mt-4">
                  <a href={a.attachmentUrl} target="_blank" download className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-md">
                    <Paperclip size={18} /> Download Attachment
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
