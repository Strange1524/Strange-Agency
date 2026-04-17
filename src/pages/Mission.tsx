import { motion } from 'motion/react';
import { Target, Heart, Star, Shield } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export default function Mission() {
  const { settings } = useSettings();

  return (
    <div className="py-16 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-blue-900 mb-4">Our Mission</h1>
          <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-50 p-8 md:p-12 rounded-2xl shadow-sm mb-12">
            <p className="text-2xl text-blue-900 leading-relaxed text-center font-medium italic">
              "{settings?.mission || 'To provide a conducive learning environment that fosters academic excellence, moral integrity, and the holistic development of every child, preparing them to be responsible global citizens.'}"
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center">
                  <Target size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">Educational Values</h3>
                <p className="text-gray-600">We believe in instilling a lifelong love for learning, critical thinking, and intellectual curiosity in our students.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                  <Star size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">Commitment to Excellence</h3>
                <p className="text-gray-600">We strive for the highest standards in teaching, learning, and administrative practices.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-12 h-12 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center">
                  <Shield size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">Moral Integrity</h3>
                <p className="text-gray-600">Character education is at the core of our curriculum, emphasizing honesty, respect, and responsibility.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <Heart size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">Inclusive Community</h3>
                <p className="text-gray-600">We foster a welcoming and supportive environment where every student feels valued and respected.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
