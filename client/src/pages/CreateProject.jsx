import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { projectApi } from '../api/projectApi';
import toast from 'react-hot-toast';

const CreateProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', description: '', problemStatement: '', solution: '',
    techStack: '', githubLink: '', demoLink: '', category: 'Web App',
    collabOpen: false
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const fileArray = selectedFiles ? Array.from(selectedFiles) : [];
      const base64Images = await Promise.all(
        fileArray.map(file => new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        }))
      );

      const payload = {
        title: formData.title,
        description: formData.description,
        problemStatement: formData.problemStatement,
        solution: formData.solution,
        techStack: formData.techStack.split(',').map(s => s.trim()).filter(Boolean),
        githubLink: formData.githubLink,
        demoLink: formData.demoLink,
        category: formData.category,
        collaborationOpen: formData.collabOpen,
        images: base64Images
      };

      await projectApi.createProject(payload);
      toast.success('Project created successfully!');
      navigate('/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 md:px-6 max-w-3xl mx-auto pb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
        <h1 className="text-3xl font-bold text-text mb-2">Create a New Project</h1>
        <p className="text-muted mb-8">Share your work with the community and find collaborators.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text">Project Title *</label>
            <input type="text" className="glass-input" required 
              onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text">Short Description *</label>
            <textarea className="glass-input resize-y" rows="3" required
              onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text">GitHub Link</label>
              <input type="url" className="glass-input" 
                onChange={e => setFormData({...formData, githubLink: e.target.value})} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text">Live Demo Link</label>
              <input type="url" className="glass-input" 
                onChange={e => setFormData({...formData, demoLink: e.target.value})} />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text">Tech Stack (comma separated)</label>
            <input type="text" placeholder="React, Node.js, MongoDB" className="glass-input" 
              onChange={e => setFormData({...formData, techStack: e.target.value})} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text">Project Screenshots (Max 5)</label>
            <input type="file" multiple accept="image/*" className="glass-input p-2" 
              onChange={e => setSelectedFiles(e.target.files)} />
          </div>

          <label className="flex items-center gap-3 p-4 bg-surface-soft border border-border rounded-xl cursor-pointer hover:bg-surface-soft/80 transition-colors">
            <input type="checkbox" className="w-5 h-5 text-primary rounded focus:ring-primary border-border" 
              onChange={e => setFormData({...formData, collabOpen: e.target.checked})} />
            <span className="font-medium text-text">I am looking for collaborators for this project</span>
          </label>

          <button type="submit" disabled={isLoading} className="btn-primary mt-4 flex justify-center items-center gap-2">
            <Save size={20} /> {isLoading ? 'Publishing...' : 'Publish Project'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateProject;
