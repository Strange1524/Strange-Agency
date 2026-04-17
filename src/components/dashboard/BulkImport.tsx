import React, { useRef, useState } from 'react';
import { Download, FileSpreadsheet, Upload, Loader2 } from 'lucide-react';

export default function BulkImport() {
  const [uploading, setUploading] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  React.useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserRole(user.role);
    }
  }, []);

  const templates = [
    {
      id: 'students',
      name: 'Students Template',
      filename: 'students_template.csv',
      content: 'studentId,name,class,password\nCAK/2025/001,John Doe,JSS 1,student123\nCAK/2025/002,Jane Doe,JSS 2,student123',
      description: 'Use this template to upload multiple students at once.'
    },
    {
      id: 'staff',
      name: 'Staff/Teachers Template',
      filename: 'staff_template.csv',
      content: 'username,name,password,assignedClass\nteacher01,Mr. Smith,staff123,JSS 1\nteacher02,Mrs. Johnson,staff123,JSS 2',
      description: 'Use this template to upload multiple teachers/staff members and assign them to classes.'
    },
    {
      id: 'parents',
      name: 'Parents Template',
      filename: 'parents_template.csv',
      content: 'username,name,password,studentId\nparent01,Mr. Doe,parent123,CAK/2025/001\nparent02,Mrs. Doe,parent123,CAK/2025/002',
      description: 'Use this template to upload parents and link them to students.'
    },
    {
      id: 'subjects',
      name: 'Subjects Template',
      filename: 'subjects_template.csv',
      content: 'code,name\nMTH101,Mathematics\nENG101,English Language',
      description: 'Use this template to upload multiple subjects.'
    },
    {
      id: 'results',
      name: 'Results Template',
      filename: 'results_template.csv',
      content: 'studentId,subjectCode,term,session,firstCA,secondCA,exams\nCAK/2025/001,MTH101,First Term,2025/2026,15,15,60',
      description: 'Use this template to upload multiple student results at once.'
    }
  ];

  const downloadTemplate = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadClick = (id: string) => {
    fileInputRefs.current[id]?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(id);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', id);

    try {
      const res = await fetch('/api/bulk-import', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Successfully imported ${data.count} records.`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert('An error occurred during upload.');
    } finally {
      setUploading(null);
      if (e.target) e.target.value = ''; // Reset input
    }
  };

  const visibleTemplates = templates.filter(t => {
    if (userRole === 'admin') return true;
    if (userRole === 'teacher' && t.id === 'results') return true;
    return false;
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Bulk Import Data</h2>
      <p className="text-gray-600 mb-8">
        Download the CSV templates below to format your data correctly, then upload the completed file to perform a bulk import. 
        Ensure you keep the header row exactly as it is.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleTemplates.map((template) => (
          <div key={template.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{template.name}</h3>
                <p className="text-sm text-gray-500">{template.filename}</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-6 flex-grow">{template.description}</p>
            
            <div className="flex gap-3 mt-auto">
              <button
                onClick={() => downloadTemplate(template.filename, template.content)}
                className="flex-1 bg-blue-50 text-blue-900 py-2 rounded-md hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
              >
                <Download size={16} /> Template
              </button>
              
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                ref={el => fileInputRefs.current[template.id] = el}
                onChange={(e) => handleFileChange(e, template.id)}
              />
              
              <button
                onClick={() => handleUploadClick(template.id)}
                disabled={uploading === template.id}
                className="flex-1 bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-70"
              >
                {uploading === template.id ? (
                  <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                ) : (
                  <><Upload size={16} /> Upload CSV</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
