import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Users, User, UsersRound, ArrowLeft } from 'lucide-react';

export default function Login({ forceRole }: { forceRole?: string }) {
  const [role, setRole] = useState<string | null>(forceRole || null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (forceRole) {
      setRole(forceRole);
    } else if (location.state?.role) {
      setRole(location.state.role);
    }
  }, [location, forceRole]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMsg('');

    try {
      const res = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      const data = await res.json();

      if (res.ok) {
        setMsg(data.message);
        setIsResetting(false);
      } else {
        setError(data.error || 'Failed to request reset');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  if (!role) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-blue-900">Select Login Portal</h2>
            <p className="mt-2 text-gray-600">Choose your account type to continue</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <button onClick={() => setRole('admin')} className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all border-t-4 border-blue-900 flex flex-col items-center gap-4 group">
              <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Admin</h3>
            </button>
            <button onClick={() => setRole('teacher')} className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all border-t-4 border-orange-500 flex flex-col items-center gap-4 group">
              <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Staff</h3>
            </button>
            <button onClick={() => setRole('student')} className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all border-t-4 border-yellow-400 flex flex-col items-center gap-4 group">
              <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <User size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Student</h3>
            </button>
            <button onClick={() => setRole('parent')} className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all border-t-4 border-green-500 flex flex-col items-center gap-4 group">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <UsersRound size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Parent</h3>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-lg border-t-4 border-blue-900 relative">
        {!forceRole && (
          <button onClick={() => { setRole(null); setIsResetting(false); setError(''); setMsg(''); }} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm">
            <ArrowLeft size={16} /> Back
          </button>
        )}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 capitalize">
            {isResetting ? 'Reset Password' : `${role} Login`}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isResetting ? 'Enter your username to request a password reset' : 'Enter your credentials to access your portal'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={isResetting ? handleResetRequest : handleLogin}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}
          {msg && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm text-center">
              {msg}
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {role === 'student' ? 'Student ID' : 'Username'}
              </label>
              <input
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={role === 'student' ? "e.g. CAK/2025/001" : "Username"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            {!isResetting && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            {!isResetting ? (
              <button type="button" onClick={() => setIsResetting(true)} className="text-sm text-blue-600 hover:text-blue-500">
                Forgot your password?
              </button>
            ) : (
              <button type="button" onClick={() => setIsResetting(false)} className="text-sm text-blue-600 hover:text-blue-500">
                Back to login
              </button>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {isResetting ? 'Request Reset' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
