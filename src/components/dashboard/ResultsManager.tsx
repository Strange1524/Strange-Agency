import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export default function ResultsManager() {
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  
  const [subjectId, setSubjectId] = useState('');
  const [term, setTerm] = useState('First Term');
  const [session, setSession] = useState('2025/2026');
  const [selectedClass, setSelectedClass] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userAssignedClass, setUserAssignedClass] = useState('');
  
  const [resultsData, setResultsData] = useState<{[key: number]: any}>({});

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (user) {
      setUserRole(user.role);
      setUserAssignedClass(user.assignedClass || '');
      if (user.role === 'teacher' && user.assignedClass) {
        setSelectedClass(user.assignedClass);
      }
    }

    fetch('/api/students', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      .then(res => res.json())
      .then(data => {
        let filteredStudents = data;
        const targetClass = user?.role === 'teacher' ? user.assignedClass : selectedClass;
        
        if (targetClass) {
          filteredStudents = data.filter((s: any) => s.class === targetClass);
        }
        setStudents(filteredStudents);
        
        // Initialize results data state
        const initialData: any = {};
        filteredStudents.forEach((s: any) => {
          initialData[s.id] = { firstCA: '', secondCA: '', exams: '', teacherComments: '' };
        });
        setResultsData(initialData);
      });
      
    fetch('/api/subjects', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      .then(res => res.json())
      .then(data => setSubjects(data));

    fetch('/api/classes', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      .then(res => res.json())
      .then(data => setClasses(data));
  }, [selectedClass]);

  const handleInputChange = (studentId: number, field: string, value: string) => {
    setResultsData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const calculateTotal = (studentId: number) => {
    const data = resultsData[studentId];
    if (!data) return 0;
    const firstCA = parseFloat(data.firstCA) || 0;
    const secondCA = parseFloat(data.secondCA) || 0;
    const exams = parseFloat(data.exams) || 0;
    return firstCA + secondCA + exams;
  };

  const handleSaveAll = async () => {
    if (!subjectId) {
      alert('Please select a subject first.');
      return;
    }

    const payload = students.map(s => ({
      studentId: s.id,
      subjectId,
      term,
      session,
      firstCA: resultsData[s.id]?.firstCA || 0,
      secondCA: resultsData[s.id]?.secondCA || 0,
      exams: resultsData[s.id]?.exams || 0,
      teacherComments: resultsData[s.id]?.teacherComments || ''
    }));

    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ results: payload })
      });
      
      if (res.ok) {
        alert('Results saved successfully!');
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert('An error occurred while saving results.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Results (Subject-Based)</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {userRole === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white">
                <option value="">All Classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select required value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full px-3 py-2 border rounded-md">
              <option value="">Select Subject</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
            <select required value={term} onChange={e => setTerm(e.target.value)} className="w-full px-3 py-2 border rounded-md">
              <option value="First Term">First Term</option>
              <option value="Second Term">Second Term</option>
              <option value="Third Term">Third Term</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
            <input type="text" required value={session} onChange={e => setSession(e.target.value)} placeholder="e.g. 2025/2026" className="w-full px-3 py-2 border rounded-md" />
          </div>
        </div>
      </div>

      {subjectId && students.length === 0 && (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md mb-8">
          No students found for the selected class. Please ensure students are assigned to this class.
        </div>
      )}

      {subjectId && students.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-gray-700">Enter Marks for Students</h3>
            <button onClick={handleSaveAll} className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center gap-2 text-sm font-medium">
              <Save size={16} /> Save All Results
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">1st CA</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">2nd CA</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exams</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map(student => {
                  const total = calculateTotal(student.id);
                  return (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.name} <span className="text-gray-500 text-xs block">{student.studentId}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input type="number" min="0" max="100" className="w-16 px-2 py-1 border rounded" value={resultsData[student.id]?.firstCA || ''} onChange={e => handleInputChange(student.id, 'firstCA', e.target.value)} />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input type="number" min="0" max="100" className="w-16 px-2 py-1 border rounded" value={resultsData[student.id]?.secondCA || ''} onChange={e => handleInputChange(student.id, 'secondCA', e.target.value)} />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input type="number" min="0" max="100" className="w-16 px-2 py-1 border rounded" value={resultsData[student.id]?.exams || ''} onChange={e => handleInputChange(student.id, 'exams', e.target.value)} />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
                        {total}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                        {total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input type="text" className="w-full px-2 py-1 border rounded text-sm" placeholder="Optional" value={resultsData[student.id]?.teacherComments || ''} onChange={e => handleInputChange(student.id, 'teacherComments', e.target.value)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
