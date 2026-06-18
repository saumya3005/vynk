import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';

const CreateProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', description: '', problemStatement: '', solution: '',
    techStack: '', githubLink: '', demoLink: '', category: 'Web App',
    collabOpen: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: API Integration
    console.log('Project created:', formData);
    navigate('/projects');
  };

  return (
    <div className="min-h-screen pt-24 px-4 md:px-6 max-w-3xl mx-auto pb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
        <h1 className="text-3xl font-bold text-vynk-charcoal mb-2">Create a New Project</h1>
        <p className="text-vynk-charcoal/60 mb-8">Share your work with the community and find collaborators.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-vynk-charcoal/80">Project Title *</label>
            <input type="text" className="glass-input" required 
              onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-vynk-charcoal/80">Short Description *</label>
            <textarea className="glass-input resize-y" rows="3" required
              onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-vynk-charcoal/80">GitHub Link</label>
              <input type="url" className="glass-input" 
                onChange={e => setFormData({...formData, githubLink: e.target.value})} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-vynk-charcoal/80">Live Demo Link</label>
              <input type="url" className="glass-input" 
                onChange={e => setFormData({...formData, demoLink: e.target.value})} />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-vynk-charcoal/80">Tech Stack (comma separated)</label>
            <input type="text" placeholder="React, Node.js, MongoDB" className="glass-input" 
              onChange={e => setFormData({...formData, techStack: e.target.value})} />
          </div>

          <label className="flex items-center gap-3 p-4 bg-white/40 border border-white rounded-xl cursor-pointer hover:bg-white/60 transition-colors">
            <input type="checkbox" className="w-5 h-5 text-vynk-coral rounded focus:ring-vynk-coral border-gray-300" 
              onChange={e => setFormData({...formData, collabOpen: e.target.checked})} />
            <span className="font-medium text-vynk-charcoal">I am looking for collaborators for this project</span>
          </label>

          <button type="submit" className="btn-primary mt-4 flex justify-center items-center gap-2">
            <Save size={20} /> Publish Project
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateProject;
