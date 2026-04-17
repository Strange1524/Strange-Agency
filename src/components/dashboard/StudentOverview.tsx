import React, { useState, useEffect } from 'react';
import { BookOpen, User, Loader2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentOverview({ user }: { user: any }) {
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [infoRes, subjectsRes] = await Promise.all([
          fetch('/api/student/info', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/subjects', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (infoRes.ok) {
          const infoData = await infoRes.json();
          setStudentInfo(infoData);
        }
        
        if (subjectsRes.ok) {
          const subjectsData = await subjectsRes.json();
          setSubjects(subjectsData);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-blue-900" size={32} /></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 flex flex-col justify-between">
          <div>
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Welcome</h3>
            <p className="text-2xl font-bold text-gray-800 capitalize">{user.name}</p>
            <p className="text-gray-600 mt-2">Student ID: {user.username}</p>
            {studentInfo?.student && (
              <p className="text-gray-600">Class: {studentInfo.student.class}</p>
            )}
          </div>
          <div className="mt-6">
            <Link to="/results" className="inline-flex items-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors">
              <FileText size={20} /> View My Results
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Form Teacher</h3>
          {studentInfo?.teacher ? (
            <>
              <p className="text-2xl font-bold text-gray-800 capitalize">{studentInfo.teacher.name}</p>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <User size={16} /> {studentInfo.teacher.username}
              </p>
            </>
          ) : (
            <p className="text-gray-500 italic mt-2">No form teacher assigned yet.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <BookOpen className="text-blue-900" size={24} />
          <h3 className="text-xl font-bold text-gray-800">Subjects Offered</h3>
        </div>
        <div className="p-6">
          {subjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <div key={subject.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                  <span className="font-medium text-gray-800">{subject.name}</span>
                  <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded">{subject.code}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No subjects available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
