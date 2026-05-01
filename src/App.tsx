import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Lock, Menu, X, MessageCircle, UserCircle } from 'lucide-react';
import Home from './pages/Home';
import Mission from './pages/Mission';
import Vision from './pages/Vision';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ResultPortal from './pages/ResultPortal';
import ResetPassword from './pages/ResetPassword';

import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useSettings } from './contexts/SettingsContext';

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { settings } = useSettings();

  return (
    <nav className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="City Academy Logo" className="h-10 w-auto object-contain bg-white rounded-full p-1" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-900 font-bold text-xl">
                  CA
                </div>
              )}
              <span className="font-bold text-xl tracking-tight text-orange-400">CITY ACADEMY</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-yellow-400 transition-colors">Home</Link>
            <Link to="/mission" className="hover:text-yellow-400 transition-colors">Mission</Link>
            <Link to="/vision" className="hover:text-yellow-400 transition-colors">Vision</Link>
            <Link to="/gallery" className="hover:text-yellow-400 transition-colors">Gallery</Link>
            <Link to="/contact" className="hover:text-yellow-400 transition-colors">Contact</Link>
            <Link to="/results" className="hover:text-yellow-400 transition-colors font-semibold text-orange-400">Result Portal</Link>
            
            {token ? (
              <Link to="/dashboard" className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-md font-medium transition-colors">
                Dashboard
              </Link>
            ) : (
              <div className="relative group">
                <button className="flex items-center gap-1 hover:text-yellow-400 transition-colors font-medium">
                  <UserCircle size={20} /> Login Portals
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 border border-gray-100">
                  <Link to="/login" state={{ role: 'teacher' }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900">Staff Login</Link>
                  <Link to="/login" state={{ role: 'student' }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900">Student Login</Link>
                  <Link to="/login" state={{ role: 'parent' }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900">Parent Login</Link>
                </div>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-yellow-400">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-800 pb-4 px-4">
          <div className="flex flex-col space-y-3 pt-2">
            <Link to="/" onClick={() => setIsOpen(false)} className="hover:text-yellow-400">Home</Link>
            <Link to="/mission" onClick={() => setIsOpen(false)} className="hover:text-yellow-400">Mission</Link>
            <Link to="/vision" onClick={() => setIsOpen(false)} className="hover:text-yellow-400">Vision</Link>
            <Link to="/gallery" onClick={() => setIsOpen(false)} className="hover:text-yellow-400">Gallery</Link>
            <Link to="/contact" onClick={() => setIsOpen(false)} className="hover:text-yellow-400">Contact</Link>
            <Link to="/results" onClick={() => setIsOpen(false)} className="text-orange-400 font-semibold">Result Portal</Link>
            {token ? (
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-yellow-400">Dashboard</Link>
            ) : (
              <>
                <div className="text-gray-400 text-sm mt-4 mb-2 uppercase tracking-wider font-bold">Login Portals</div>
                <Link to="/login" state={{ role: 'teacher' }} onClick={() => setIsOpen(false)} className="block text-gray-300 hover:text-white pl-2">Staff Login</Link>
                <Link to="/login" state={{ role: 'student' }} onClick={() => setIsOpen(false)} className="block text-gray-300 hover:text-white pl-2">Student Login</Link>
                <Link to="/login" state={{ role: 'parent' }} onClick={() => setIsOpen(false)} className="block text-gray-300 hover:text-white pl-2">Parent Login</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-blue-950 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <h3 className="text-xl font-bold text-orange-400">CITY ACADEMY KADUNA</h3>
          <p className="text-gray-300 text-sm mt-1">Plot 11 Swimming Pool Road, Kabala Doki, Kaduna State, Nigeria.</p>
          <div className="flex space-x-4 mt-4">
            {settings?.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
            )}
            {settings?.twitterUrl && (
              <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
            )}
            {settings?.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
            )}
            {settings?.linkedinUrl && (
              <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} City Academy Kaduna. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function FloatingWhatsApp() {
  const { settings } = useSettings();
  const phone = settings?.phone || '08063251569';
  const waLink = `https://wa.me/234${phone.replace(/^0+/, '')}`;

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 hover:scale-110 transition-all z-50 flex items-center justify-center group"
      title="Chat with our AI Assistant / Support on WhatsApp"
    >
      <MessageCircle size={32} />
      <span className="absolute right-16 bg-white text-gray-800 px-3 py-1 rounded-md shadow-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        AI Assistant / Support
      </span>
    </a>
  );
}

function SiteVisitTracker() {
  useEffect(() => {
    if (!sessionStorage.getItem('visit_logged')) {
      fetch('/api/visits', { method: 'POST' }).catch(() => {});
      sessionStorage.setItem('visit_logged', 'true');
    }
  }, []);
  return null;
}

import { SettingsProvider } from './contexts/SettingsContext';

export default function App() {
  return (
    <SettingsProvider>
      <Router>
        <SiteVisitTracker />
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
          <Navigation />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/mission" element={<Mission />} />
              <Route path="/vision" element={<Vision />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<Login forceRole="admin" />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/dashboard/*" element={<Dashboard />} />
              <Route path="/results" element={<ResultPortal />} />
            </Routes>
          </main>
          <FloatingWhatsApp />
          <Footer />
        </div>
      </Router>
    </SettingsProvider>
  );
}
