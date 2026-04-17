import { motion } from 'motion/react';
import { Eye, TrendingUp, Award } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export default function Vision() {
  const { settings } = useSettings();

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-blue-900 mb-4">Our Vision</h1>
          <div className="w-24 h-1 bg-yellow-400 mx-auto"></div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-md border-t-4 border-blue-900 mb-12">
            <div className="flex justify-center mb-6">
              <Eye size={48} className="text-blue-900" />
            </div>
            <p className="text-2xl text-gray-800 leading-relaxed text-center font-medium">
              "{settings?.vision || 'To be a premier educational institution in Nigeria, recognized for producing innovative leaders and well-rounded individuals equipped to thrive in a dynamic world.'}"
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
            >
              <TrendingUp size={32} className="text-orange-500 mb-4" />
              <h3 className="text-xl font-bold text-blue-900 mb-3">Future Goals</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <span>Integrate advanced technology in all learning processes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <span>Expand facilities to accommodate diverse vocational training.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <span>Establish partnerships with leading educational bodies globally.</span>
                </li>
              </ul>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
            >
              <Award size={32} className="text-yellow-500 mb-4" />
              <h3 className="text-xl font-bold text-blue-900 mb-3">Student Success Philosophy</h3>
              <p className="text-gray-600 mb-4">
                We believe that every student has unique talents and potential. Our role is to discover, nurture, and guide these abilities.
              </p>
              <p className="text-gray-600">
                Success is not just measured by academic grades, but by the character, resilience, and positive impact our students make in society.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
