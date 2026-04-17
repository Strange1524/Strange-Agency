import React, { useState, useEffect } from 'react';
import { Printer, FileSpreadsheet } from 'lucide-react';

export default function Broadsheet() {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [term, setTerm] = useState('First Term');
  const [session, setSession] = useState('2025/2026');
  const [loading, setLoading] = useState(false);
  const [showPrintHint, setShowPrintHint] = useState(false);

  useEffect(() => {
    fetch('/api/classes', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      .then(res => res.json())
      .then(data => setClasses(data));
      
    fetch('/api/subjects', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      .then(res => res.json())
      .then(data => setSubjects(data));
  }, []);

  const handleGenerate = async () => {
    if (!selectedClass) {
      alert('Please select a class');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch students for the class
      const stRes = await fetch('/api/students', { headers: { 'Authorization': `Bearer ${token}` } });
      const allStudents = await stRes.json();
      const classStudents = allStudents.filter((s: any) => s.class === selectedClass);
      setStudents(classStudents);
      
      // Fetch results for the class
      const resRes = await fetch(`/api/results?term=${term}&session=${session}&studentClass=${selectedClass}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const classResults = await resRes.json();
      setResults(classResults);
      
    } catch (error) {
      console.error('Error generating broadsheet', error);
    } finally {
      setLoading(false);
    }
  };

  const getStudentScore = (studentIdStr: string, subjectName: string) => {
    const result = results.find(r => r.studentIdStr === studentIdStr && r.subjectName === subjectName);
    return result ? (result.total || result.score) : '-';
  };

  const getStudentTotal = (studentIdStr: string) => {
    const studentResults = results.filter(r => r.studentIdStr === studentIdStr);
    return studentResults.reduce((sum, r) => sum + (r.total || r.score), 0);
  };

  const getStudentAverage = (studentIdStr: string) => {
    const studentResults = results.filter(r => r.studentIdStr === studentIdStr);
    if (studentResults.length === 0) return 0;
    return (getStudentTotal(studentIdStr) / studentResults.length).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start print:hidden">
        <h2 className="text-2xl font-bold text-gray-800">Result Broadsheet</h2>
        <div className="flex flex-col items-end">
          <button onClick={() => { window.print(); setShowPrintHint(true); setTimeout(() => setShowPrintHint(false), 8000); }} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
            <Printer size={20} /> Print Broadsheet
          </button>
          {showPrintHint && (
            <div className="mt-2 text-sm text-orange-700 bg-orange-50 p-2 rounded-md max-w-xs text-right border border-orange-200">
              If the print dialog didn't open, please open the app in a new tab (top right icon) to print.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Class</option>
              {classes.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
            <select 
              value={term} 
              onChange={(e) => setTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option>First Term</option>
              <option>Second Term</option>
              <option>Third Term</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
            <select 
              value={session} 
              onChange={(e) => setSession(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option>2024/2025</option>
              <option>2025/2026</option>
              <option>2026/2027</option>
            </select>
          </div>
          <div>
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FileSpreadsheet size={20} />
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      {students.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm overflow-x-auto print:shadow-none print:p-0">
          <div className="text-center mb-6 hidden print:block">
            <h2 className="text-2xl font-bold text-blue-900 uppercase">City Academy Kaduna</h2>
            <h3 className="text-lg font-bold text-gray-800">Result Broadsheet - {selectedClass}</h3>
            <p className="text-sm text-gray-600">{term} - {session}</p>
          </div>

          <table className="min-w-full border-collapse border border-gray-300 text-sm print:text-xs">
            <thead>
              <tr className="bg-blue-900 text-white print:bg-gray-200 print:text-black">
                <th className="border border-gray-300 print:border-black px-3 py-2 text-left w-10">S/N</th>
                <th className="border border-gray-300 print:border-black px-3 py-2 text-left w-32">Student ID</th>
                <th className="border border-gray-300 print:border-black px-3 py-2 text-left w-48">Name</th>
                {subjects.map(sub => (
                  <th key={sub.id} className="border border-gray-300 print:border-black px-2 py-2 text-center rotate-180" style={{ writingMode: 'vertical-rl' }}>
                    {sub.name}
                  </th>
                ))}
                <th className="border border-gray-300 print:border-black px-3 py-2 text-center font-bold">Total</th>
                <th className="border border-gray-300 print:border-black px-3 py-2 text-center font-bold">Average</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <tr key={student.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50 print:bg-white'}>
                  <td className="border border-gray-300 print:border-black px-3 py-2 text-center">{idx + 1}</td>
                  <td className="border border-gray-300 print:border-black px-3 py-2 font-medium">{student.studentId}</td>
                  <td className="border border-gray-300 print:border-black px-3 py-2 whitespace-nowrap">{student.name}</td>
                  {subjects.map(sub => (
                    <td key={sub.id} className="border border-gray-300 print:border-black px-2 py-2 text-center">
                      {getStudentScore(student.studentId, sub.name)}
                    </td>
                  ))}
                  <td className="border border-gray-300 print:border-black px-3 py-2 text-center font-bold bg-blue-50 print:bg-white">{getStudentTotal(student.studentId)}</td>
                  <td className="border border-gray-300 print:border-black px-3 py-2 text-center font-bold bg-orange-50 print:bg-white">{getStudentAverage(student.studentId)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
