import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, Users, Trophy, ArrowRight } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export default function Home() {
  const { settings } = useSettings();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://picsum.photos/seed/school/1920/1080" 
            alt="School Campus" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-yellow-400">
              Welcome to City Academy Kaduna
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Nurturing Excellence, Shaping the Future.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/results" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-md font-semibold text-lg transition-colors flex items-center gap-2">
                Check Results <ArrowRight size={20} />
              </Link>
              <Link to="/contact" className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-3 rounded-md font-semibold text-lg transition-colors">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">About Our Academy</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-12">
              {settings?.about || 'City Academy is dedicated to providing high-quality education to students from diverse backgrounds. Our experienced faculty and state-of-the-art facilities ensure that every student has the opportunity to succeed.'}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-gray-50 p-8 rounded-xl shadow-sm border border-gray-100 text-center"
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-blue-900">Academic Excellence</h3>
              <p className="text-gray-600">We provide a rigorous and comprehensive curriculum designed to challenge and inspire our students.</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-gray-50 p-8 rounded-xl shadow-sm border border-gray-100 text-center"
            >
              <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-blue-900">Dedicated Staff</h3>
              <p className="text-gray-600">Our experienced teachers are committed to nurturing the unique potential of every child.</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-gray-50 p-8 rounded-xl shadow-sm border border-gray-100 text-center"
            >
              <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-blue-900">Holistic Development</h3>
              <p className="text-gray-600">We focus on character building, sports, and extracurricular activities alongside academics.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Latest Updates */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Latest Updates</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md border-l-4 border-orange-500">
            <h3 className="text-xl font-bold text-blue-900 mb-2">Term Results Available</h3>
            <p className="text-gray-600 mb-4">The results for the current academic term have been published. Students and parents can now access them through the Result Portal.</p>
            <Link to="/results" className="text-orange-500 font-semibold hover:text-orange-600 flex items-center gap-1">
              Go to Portal <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
