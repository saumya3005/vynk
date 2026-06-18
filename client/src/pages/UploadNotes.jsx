import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UploadCloud } from 'lucide-react';

const UploadNotes = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', subject: '', semester: '', branch: '', college: '', tags: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Notes uploaded:', formData);
    navigate('/notes');
  };

  return (
    <div className="min-h-screen pt-24 px-4 md:px-6 max-w-2xl mx-auto pb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
        <h1 className="text-3xl font-bold text-vynk-charcoal mb-8">Upload Notes</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="border-2 border-dashed border-vynk-charcoal/20 rounded-xl p-8 text-center bg-white/30 hover:bg-white/50 transition-colors cursor-pointer mb-4">
            <UploadCloud size={40} className="mx-auto text-vynk-charcoal/40 mb-3" />
            <p className="font-medium text-vynk-charcoal">Click to browse or drag PDF here</p>
            <p className="text-xs text-vynk-charcoal/50 mt-1">Max file size: 10MB</p>
          </div>

          <input type="text" placeholder="Title" className="glass-input" required onChange={e => setFormData({...formData, title: e.target.value})} />
          
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Subject" className="glass-input" required onChange={e => setFormData({...formData, subject: e.target.value})} />
            <input type="text" placeholder="Semester (e.g. Sem 5)" className="glass-input" required onChange={e => setFormData({...formData, semester: e.target.value})} />
          </div>

          <button type="submit" className="btn-primary mt-4 flex justify-center">Upload Document</button>
        </form>
      </motion.div>
    </div>
  );
};

export default UploadNotes;
