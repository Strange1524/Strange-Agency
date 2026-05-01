import { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Users, BookOpen, FileText, Image, LogOut, LayoutDashboard, UserPlus, UploadCloud, KeyRound, Settings, FileSpreadsheet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import StudentsManager from '../components/dashboard/StudentsManager';
import SubjectsManager from '../components/dashboard/SubjectsManager';
import ResultsManager from '../components/dashboard/ResultsManager';
import GalleryManager from '../components/dashboard/GalleryManager';
import StaffManager from '../components/dashboard/StaffManager';
import ClassesManager from '../components/dashboard/ClassesManager';
import BulkImport from '../components/dashboard/BulkImport';
import TeacherOverview from '../components/dashboard/TeacherOverview';
import StudentOverview from '../components/dashboard/StudentOverview';
import PasswordResets from '../components/dashboard/PasswordResets';
import SiteSettingsManager from '../components/dashboard/SiteSettingsManager';
import Broadsheet from '../components/dashboard/Broadsheet';
import AssignmentsPlatform from '../components/dashboard/AssignmentsPlatform';
import { Bell } from 'lucide-react';

function AdminOverview({ user }: { user: any }) {
  const [visits, setVisits] = useState<any[]>([]);
  
  useEffect(() => {
    fetch('/api/visits', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setVisits(data))
    .catch(() => {});
  }, []);

  const totalVisits = visits.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">System Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Your Role</h3>
          <p className="text-2xl font-bold text-gray-800 capitalize">{user.role}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Total Site Visits</h3>
          <p className="text-2xl font-bold text-gray-800">{totalVisits}</p>
        </div>
      </div>
      
      {visits.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Site Visitors Chat (Last 30 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visits.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} tickFormatter={(val) => val.slice(5)} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Visits" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const isTeacher = user.role === 'teacher' || user.role === 'admin';
  const isStudent = user.role === 'student';

  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={20} />, show: true },
    { path: '/dashboard/staff', label: 'Manage Staff', icon: <UserPlus size={20} />, show: isAdmin },
    { path: '/dashboard/classes', label: 'Manage Classes', icon: <BookOpen size={20} />, show: isAdmin },
    { path: '/dashboard/students', label: 'Manage Students', icon: <Users size={20} />, show: isTeacher },
    { path: '/dashboard/subjects', label: 'Manage Subjects', icon: <BookOpen size={20} />, show: isTeacher },
    { path: '/dashboard/assignments', label: 'Assignments', icon: <Bell size={20} />, show: true },
    { path: '/dashboard/results', label: 'Manage Results', icon: <FileText size={20} />, show: isTeacher },
    { path: '/dashboard/broadsheet', label: 'Broadsheet', icon: <FileSpreadsheet size={20} />, show: isTeacher },
    { path: '/dashboard/gallery', label: 'Manage Gallery', icon: <Image size={20} />, show: isAdmin },
    { path: '/dashboard/bulk-import', label: 'Bulk Import', icon: <UploadCloud size={20} />, show: isTeacher },
    { path: '/dashboard/password-resets', label: 'Password Resets', icon: <KeyRound size={20} />, show: isAdmin },
    { path: '/dashboard/settings', label: 'Site Settings', icon: <Settings size={20} />, show: isAdmin },
    { path: '/results', label: 'My Results', icon: <FileText size={20} />, show: isStudent },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6 border-b border-blue-800">
          <h2 className="text-xl font-bold text-orange-400">Dashboard</h2>
          <p className="text-sm text-gray-300 mt-1">Welcome, {user.name}</p>
          <span className="inline-block px-2 py-1 bg-blue-800 text-xs rounded mt-2 uppercase tracking-wider">{user.role}</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.filter(item => item.show).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-orange-500 text-white' : 'hover:bg-blue-800 text-gray-300 hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-300 hover:bg-red-900 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <Routes>
          <Route path="/" element={
            user.role === 'teacher' ? (
              <TeacherOverview user={user} />
            ) : user.role === 'student' ? (
              <StudentOverview user={user} />
            ) : (
              <AdminOverview user={user} />
            )
          } />
          <Route path="/students" element={<StudentsManager />} />
          <Route path="/staff" element={<StaffManager />} />
          <Route path="/classes" element={<ClassesManager />} />
          <Route path="/subjects" element={<SubjectsManager />} />
          <Route path="/assignments" element={<AssignmentsPlatform user={user} />} />
          <Route path="/results" element={<ResultsManager />} />
          <Route path="/broadsheet" element={<Broadsheet />} />
          <Route path="/gallery" element={<GalleryManager />} />
          <Route path="/bulk-import" element={<BulkImport />} />
          <Route path="/password-resets" element={<PasswordResets />} />
          <Route path="/settings" element={<SiteSettingsManager />} />
        </Routes>
      </div>
    </div>
  );
}
