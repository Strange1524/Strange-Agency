import React, { useState, useEffect } from 'react';
import { Trash2, Upload, Video } from 'lucide-react';

export default function GalleryManager() {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadType, setUploadType] = useState<'image' | 'video'>('image');

  const fetchGallery = () => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => setItems(data));
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', title);
    formData.append('description', description);

    await fetch('/api/gallery/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: formData
    });

    setTitle('');
    setDescription('');
    setFile(null);
    fetchGallery();
  };

  const handleVideoAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/gallery/video', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ url: videoUrl, title, description })
    });

    setTitle('');
    setDescription('');
    setVideoUrl('');
    fetchGallery();
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/gallery/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    fetchGallery();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Gallery</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <div className="flex gap-4 mb-6 border-b pb-4">
          <button 
            className={`px-4 py-2 font-medium rounded-md ${uploadType === 'image' ? 'bg-blue-100 text-blue-900' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setUploadType('image')}
          >
            Upload Image
          </button>
          <button 
            className={`px-4 py-2 font-medium rounded-md ${uploadType === 'video' ? 'bg-blue-100 text-blue-900' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setUploadType('video')}
          >
            Add Video URL
          </button>
        </div>

        {uploadType === 'image' ? (
          <form onSubmit={handleImageUpload} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Image</label>
              <input type="file" accept="image/*" required onChange={e => setFile(e.target.files?.[0] || null)} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-md" rows={3}></textarea>
            </div>
            <button type="submit" className="bg-blue-900 text-white px-6 py-2 rounded-md hover:bg-blue-800 flex items-center gap-2">
              <Upload size={20} /> Upload Image
            </button>
          </form>
        ) : (
          <form onSubmit={handleVideoAdd} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video URL</label>
              <input type="url" required value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-md" rows={3}></textarea>
            </div>
            <button type="submit" className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 flex items-center gap-2">
              <Video size={20} /> Add Video
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 relative group">
            {item.type === 'image' ? (
              <img src={item.url} alt={item.title} className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                <Video size={32} className="text-gray-400" />
              </div>
            )}
            <div className="p-4">
              <h4 className="font-bold text-gray-800 truncate">{item.title || 'Untitled'}</h4>
              <span className="text-xs text-gray-500 uppercase">{item.type}</span>
            </div>
            <button 
              onClick={() => handleDelete(item.id)}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
