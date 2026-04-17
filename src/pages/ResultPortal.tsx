import React, { useState } from 'react';
import { Search, Printer, FileText } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export default function ResultPortal() {
  const { settings } = useSettings();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [term, setTerm] = useState('First Term');
  const [session, setSession] = useState('2025/2026');
  
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);
  const [showPrintHint, setShowPrintHint] = useState(false);

  React.useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === 'student') {
        setIsStudentLoggedIn(true);
        setStudentId(user.username);
        // We can optionally auto-fetch if we know the class, but we'll let them select term/session
      }
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);

    try {
      let token = localStorage.getItem('token');

      if (!isStudentLoggedIn) {
        if (!password) {
          setError('Please enter your password to view results.');
          setLoading(false);
          return;
        }

        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: studentId, password })
        });

        if (!loginRes.ok) {
          setError('Invalid Student ID or Password.');
          setLoading(false);
          return;
        }

        const loginData = await loginRes.json();
        token = loginData.token;
        
        // Optionally save to localStorage so they stay logged in
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('user', JSON.stringify(loginData.user));
        setIsStudentLoggedIn(true);
      }
      
      const res = await fetch(`/api/results?studentId=${studentId}&term=${term}&session=${session}&studentClass=${studentClass}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (res.status === 401 || res.status === 403) {
        setError('Please login as a student or parent to view results.');
        setLoading(false);
        return;
      }

      const data = await res.json();
      
      if (data.length === 0) {
        setError('No results found for the provided details.');
      } else {
        setResults(data);
      }
    } catch (err) {
      setError('An error occurred while fetching results.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
    setShowPrintHint(true);
    setTimeout(() => setShowPrintHint(false), 8000);
  };

  // Calculate summary
  const totalScore = results ? results.reduce((sum, r) => sum + (r.total || r.score), 0) : 0;
  const averageStr = results && results.length > 0 ? (totalScore / results.length).toFixed(2) : '0';
  const average = parseFloat(averageStr);
  
  let finalGrade = 'F';
  let finalInterpretation = 'Fail';
  if (average >= 70) { finalGrade = 'A'; finalInterpretation = 'Excellent'; }
  else if (average >= 60) { finalGrade = 'B'; finalInterpretation = 'Very Good'; }
  else if (average >= 50) { finalGrade = 'C'; finalInterpretation = 'Good'; }
  else if (average >= 40) { finalGrade = 'D'; finalInterpretation = 'Pass'; }

  const getInterpretation = (grade: string) => {
    switch (grade) {
      case 'A': return 'Excellent';
      case 'B': return 'Very Good';
      case 'C': return 'Good';
      case 'D': return 'Pass';
      default: return 'Fail';
    }
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen print:py-0 print:min-h-0 print:bg-white">
      <style type="text/css" media="print">
        {`
          @page { size: A4; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
        `}
      </style>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 print:px-0 print:max-w-none">
        
        <div className="text-center mb-10 print:hidden">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Student Result Portal</h1>
          <p className="text-gray-600">Enter your details to check your academic performance</p>
        </div>

        {!results && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-orange-500 max-w-2xl mx-auto print:hidden">
            <form onSubmit={handleSearch} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-md text-sm text-center">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                  <input type="text" required value={studentId} onChange={e => setStudentId(e.target.value)} disabled={isStudentLoggedIn} className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${isStudentLoggedIn ? 'bg-gray-100' : ''}`} placeholder="e.g. CAK/2025/001" />
                </div>
                {!isStudentLoggedIn && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Enter your password" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <input type="text" value={studentClass} onChange={e => setStudentClass(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. JSS 1 (Optional)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                  <select required value={term} onChange={e => setTerm(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    <option value="First Term">First Term</option>
                    <option value="Second Term">Second Term</option>
                    <option value="Third Term">Third Term</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Session</label>
                  <input type="text" required value={session} onChange={e => setSession(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. 2025/2026" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white py-3 px-4 rounded-md hover:bg-blue-800 transition-colors font-medium flex items-center justify-center gap-2">
                {loading ? 'Searching...' : <><Search size={20} /> Check Result</>}
              </button>
            </form>
          </div>
        )}

        {results && results.length > 0 && (
          <div className="bg-white p-8 rounded-xl shadow-lg print:shadow-none print:p-0 print:m-0 print:w-full print:bg-white print:text-black" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            {/* Result Header */}
            <div className="text-center border-b-2 border-blue-900 pb-6 mb-6 print:pb-2 print:mb-2 print:border-black">
              <div className="flex flex-col items-center mb-4 print:hidden">
                <div className="flex justify-center">
                  <button onClick={handlePrint} className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center gap-2">
                    <Printer size={20} /> Print Result
                  </button>
                  <button onClick={() => setResults(null)} className="ml-4 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
                    New Search
                  </button>
                </div>
                {showPrintHint && (
                  <div className="mt-3 text-sm text-orange-700 bg-orange-50 p-3 rounded-md max-w-md border border-orange-200">
                    If the print dialog didn't open, it's because the app is running inside a preview window. <strong>Please open the app in a new tab</strong> (using the arrow icon in the top right of the screen) to print, or press Ctrl+P / Cmd+P.
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-center gap-4 mb-2">
                {settings?.logoUrl ? (
                  <img src={settings.logoUrl} alt="City Academy Logo" className="h-20 w-auto object-contain print:h-16" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-16 h-16 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-2xl print:bg-black print:h-12 print:w-12 print:text-xl">
                    CA
                  </div>
                )}
                <div>
                  <h2 className="text-3xl font-bold text-blue-900 uppercase print:text-black print:text-2xl">City Academy Kaduna</h2>
                  <p className="text-sm text-gray-600 print:text-black print:text-xs">Plot 11 Swimming Pool Road, Kabala Doki, Kaduna State</p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-orange-500 mt-4 uppercase print:text-black print:text-lg print:mt-2">Student Terminal Report</h3>
            </div>

            {/* Student Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-blue-50 p-4 rounded-lg print:bg-transparent print:border print:mb-4 print:p-2 print:gap-2">
              <div>
                <span className="block text-xs text-gray-500 uppercase font-semibold">Student Name</span>
                <span className="font-bold text-gray-900">{results[0].studentName}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 uppercase font-semibold">Student ID</span>
                <span className="font-bold text-gray-900">{results[0].studentIdStr}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 uppercase font-semibold">Class</span>
                <span className="font-bold text-gray-900">{results[0].studentClass}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 uppercase font-semibold">Term / Session</span>
                <span className="font-bold text-gray-900">{results[0].term} - {results[0].session}</span>
              </div>
            </div>

            {/* Grades Table */}
            <div className="overflow-x-auto mb-8 print:mb-4">
              <table className="w-full border-collapse border border-gray-400 print:border-black print:text-xs">
                <thead>
                  <tr className="bg-blue-900 text-white print:bg-gray-200 print:text-black">
                    <th className="border border-gray-400 print:border-black px-4 py-2 print:px-2 print:py-1 text-left">Subject</th>
                    <th className="border border-gray-400 print:border-black px-4 py-2 print:px-2 print:py-1 text-center w-20">1st CA</th>
                    <th className="border border-gray-400 print:border-black px-4 py-2 print:px-2 print:py-1 text-center w-20">2nd CA</th>
                    <th className="border border-gray-400 print:border-black px-4 py-2 print:px-2 print:py-1 text-center w-20">Exams</th>
                    <th className="border border-gray-400 print:border-black px-4 py-2 print:px-2 print:py-1 text-center w-24">Total</th>
                    <th className="border border-gray-400 print:border-black px-4 py-2 print:px-2 print:py-1 text-center w-24">Grade</th>
                    <th className="border border-gray-400 print:border-black px-4 py-2 print:px-2 print:py-1 text-center w-32">Interpretation</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50 print:bg-white'}>
                      <td className="border border-gray-400 print:border-black px-4 py-2 print:px-2 print:py-1 font-medium">{r.subjectName}</td>
                      <td className="border border-gray-400 print:border-black px-4 py-2 print:px-2 print:py-1 text-center">{r.firstCA || '-'}</td>
                      <td className="border border-gray-400 print:border-black px-4 py-2 print:px-2 print:py-1 text-center">{r.secondCA || '-'}</td>
                      <td className="border border-gray-400 print:border-black px-4 py-2 print:px-2 print:py-1 text-center">{r.exams || '-'}</td>
                      <td className="border border-gray-400 print:border-black px-4 py-2 print:px-2 print:py-1 text-center font-bold">{r.total || r.score}</td>
                      <td className="border border-gray-400 print:border-black px-4 py-2 print:px-2 print:py-1 text-center font-bold">{r.grade}</td>
                      <td className="border border-gray-400 print:border-black px-4 py-2 print:px-2 print:py-1 text-center text-sm print:text-xs">{getInterpretation(r.grade)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 p-6 rounded-lg border border-gray-200 print:p-2 print:border-black">
              <div className="mb-4 md:mb-0">
                <h4 className="font-bold text-blue-900 mb-2">Grading System:</h4>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>A: 70-100 (Excellent)</span>
                  <span>B: 60-69 (Very Good)</span>
                  <span>C: 50-59 (Good)</span>
                  <span>D: 40-49 (Pass)</span>
                  <span>F: 0-39 (Fail)</span>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="text-center">
                  <span className="block text-sm text-gray-500 uppercase">Total Score</span>
                  <span className="text-2xl font-bold text-blue-900">{totalScore}</span>
                </div>
                <div className="text-center">
                  <span className="block text-sm text-gray-500 uppercase">Average</span>
                  <span className="text-2xl font-bold text-orange-500">{average}%</span>
                </div>
                <div className="text-center">
                  <span className="block text-sm text-gray-500 uppercase">Final Grade</span>
                  <span className="text-2xl font-bold text-blue-900">{finalGrade}</span>
                  <span className="block text-xs text-gray-500">{finalInterpretation}</span>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200 flex justify-between print:mt-6 print:pt-4 print:border-black">
              <div className="text-center w-48">
                <div className="border-b border-gray-400 print:border-black h-8 mb-2"></div>
                <span className="text-sm text-gray-600 print:text-black">Form Teacher's Signature</span>
              </div>
              <div className="text-center w-48">
                <div className="border-b border-gray-400 print:border-black h-8 mb-2"></div>
                <span className="text-sm text-gray-600 print:text-black">Principal's Signature</span>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
