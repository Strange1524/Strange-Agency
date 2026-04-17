import React, { useEffect, useState } from 'react';
import { Users, BookOpen, GraduationCap } from 'lucide-react';

export default function TeacherOverview({ user }: { user: any }) {
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    // Fetch students
    fetch('/api/students', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => {
      // Filter students by teacher's assigned class
      if (user.assignedClass) {
        setStudents(data.filter((s: any) => s.class === user.assignedClass));
      } else {
        setStudents(data);
      }
    });

    // Fetch subjects
    fetch('/api/subjects', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setSubjects(data));
  }, [user.assignedClass]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Teacher Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Assigned Class</h3>
              <p className="text-2xl font-bold text-gray-800">{user.assignedClass || 'None'}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
              <GraduationCap size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">My Students</h3>
              <p className="text-2xl font-bold text-gray-800">{students.length}</p>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-500">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Total Subjects</h3>
              <p className="text-2xl font-bold text-gray-800">{subjects.length}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-500">
              <BookOpen size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">Students in {user.assignedClass || 'Your Class'}</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {students.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map(student => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.studentId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-gray-500">No students found for your assigned class.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">Subjects Offered</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {subjects.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subjects.map(subject => (
                    <tr key={subject.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-gray-500">No subjects available.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
