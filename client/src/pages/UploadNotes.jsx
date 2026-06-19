import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import MediaUploader from '../components/ui/MediaUploader';
import { noteApi } from '../api/noteApi';
import toast from 'react-hot-toast';

const UploadNotes = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', subject: '', semester: '', branch: '', college: '', tags: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return toast.error('Please select a file');
    
    setIsSubmitting(true);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const payload = {
          ...formData,
          fileUrl: reader.result,
          fileName: selectedFile.name,
          fileType: selectedFile.type || 'application/octet-stream'
        };

        await noteApi.uploadNote(payload);
        toast.success('Note uploaded successfully!');
        navigate('/notes');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to upload note');
      } finally {
        setIsSubmitting(false);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="min-h-screen pt-24 px-4 md:px-6 max-w-2xl mx-auto pb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
        <h1 className="text-3xl font-bold text-charcoal mb-8">Upload Notes</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="mb-4">
             <MediaUploader onFileSelect={setSelectedFile} accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,image/*" label="Upload Document" />
          </div>

          <input type="text" placeholder="Title" className="glass-input" required onChange={e => setFormData({...formData, title: e.target.value})} />
          
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Subject" className="glass-input" required onChange={e => setFormData({...formData, subject: e.target.value})} />
            <input type="text" placeholder="Semester (e.g. Sem 5)" className="glass-input" required onChange={e => setFormData({...formData, semester: e.target.value})} />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary mt-4 flex justify-center">
             {isSubmitting ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default UploadNotes;
