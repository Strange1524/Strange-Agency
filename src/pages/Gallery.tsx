import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play } from 'lucide-react';

interface GalleryItem {
  id: number;
  url: string;
  type: 'image' | 'video';
  title: string;
  description: string;
}

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error(err));
  }, []);

  // Helper to extract YouTube ID
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-blue-900 mb-4">School Gallery</h1>
          <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
        </motion.div>

        {items.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No gallery items available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer group relative"
                onClick={() => setSelectedItem(item)}
              >
                {item.type === 'image' ? (
                  <img 
                    src={item.url} 
                    alt={item.title || 'Gallery image'} 
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 relative flex items-center justify-center">
                    {getYoutubeId(item.url) ? (
                      <img 
                        src={`https://img.youtube.com/vi/${getYoutubeId(item.url)}/hqdefault.jpg`}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover opacity-80"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-900 opacity-80"></div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white pl-1 shadow-lg">
                        <Play size={24} />
                      </div>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-blue-900 bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-end">
                  <div className="p-4 w-full transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white font-bold truncate">{item.title}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <button 
              className="absolute top-4 right-4 text-white hover:text-orange-500"
              onClick={() => setSelectedItem(null)}
            >
              <X size={32} />
            </button>
            <div 
              className="max-w-5xl w-full max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedItem.type === 'image' ? (
                <img 
                  src={selectedItem.url} 
                  alt={selectedItem.title} 
                  className="w-full max-h-[70vh] object-contain"
                />
              ) : (
                <div className="w-full aspect-video">
                  {getYoutubeId(selectedItem.url) ? (
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/${getYoutubeId(selectedItem.url)}?autoplay=1`} 
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                      <a href={selectedItem.url} target="_blank" rel="noopener noreferrer" className="text-orange-500 underline">Open Video Link</a>
                    </div>
                  )}
                </div>
              )}
              <div className="bg-white p-6 rounded-b-xl mt-4">
                <h3 className="text-2xl font-bold text-blue-900 mb-2">{selectedItem.title}</h3>
                <p className="text-gray-600">{selectedItem.description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
