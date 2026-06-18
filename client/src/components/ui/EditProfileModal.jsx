import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { userApi } from '../../api/userApi';
import toast from 'react-hot-toast';

const EditProfileModal = ({ profileData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: profileData.username || '',
    bio: profileData.bio || '',
    location: profileData.location || '',
    role: profileData.role || 'Student',
    github: profileData.github || '',
    linkedin: profileData.linkedin || '',
    portfolio: profileData.portfolio || '',
    resume: profileData.resume || '',
    coverImage: profileData.coverImage || '',
    avatar: profileData.avatar || '',
  });

  const [skills, setSkills] = useState(profileData.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updatedData = { ...formData, skills };
      const res = await userApi.updateProfile(updatedData);
      toast.success('Profile updated successfully');
      onSave(res);
      onClose();
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-2xl max-h-[90vh] flex flex-col bg-white overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 border-b border-vynk-border">
          <h2 className="text-xl font-bold text-vynk-text">Edit Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-vynk-bg-2 rounded-full text-vynk-muted hover:text-vynk-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="edit-profile-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-vynk-text/80">Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} className="glass-input bg-vynk-bg-2" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-vynk-text/80">Role</label>
                <select name="role" value={formData.role} onChange={handleChange} className="glass-input bg-vynk-bg-2">
                  <option value="Student">Student</option>
                  <option value="Developer">Developer</option>
                  <option value="Recruiter">Recruiter</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Creator">Content Creator</option>
                  <option value="Professional">Professional</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-vynk-text/80">Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="glass-input bg-vynk-bg-2 resize-none" placeholder="Tell us about yourself..." />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-vynk-text/80">Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className="glass-input bg-vynk-bg-2" placeholder="City, Country" />
            </div>

            {/* Links */}
            <h3 className="font-bold text-vynk-text mt-4">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-vynk-text/80">GitHub URL</label>
                <input type="url" name="github" value={formData.github} onChange={handleChange} className="glass-input bg-vynk-bg-2" placeholder="https://github.com/..." />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-vynk-text/80">LinkedIn URL</label>
                <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} className="glass-input bg-vynk-bg-2" placeholder="https://linkedin.com/in/..." />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-vynk-text/80">Portfolio URL</label>
                <input type="url" name="portfolio" value={formData.portfolio} onChange={handleChange} className="glass-input bg-vynk-bg-2" placeholder="https://..." />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-vynk-text/80">Resume URL</label>
                <input type="url" name="resume" value={formData.resume} onChange={handleChange} className="glass-input bg-vynk-bg-2" placeholder="https://..." />
              </div>
            </div>

            {/* Media */}
            <h3 className="font-bold text-vynk-text mt-4">Media URLs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-vynk-text/80">Avatar URL</label>
                <input type="url" name="avatar" value={formData.avatar} onChange={handleChange} className="glass-input bg-vynk-bg-2" placeholder="https://..." />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-vynk-text/80">Cover Image URL</label>
                <input type="url" name="coverImage" value={formData.coverImage} onChange={handleChange} className="glass-input bg-vynk-bg-2" placeholder="https://..." />
              </div>
            </div>

            {/* Skills */}
            <h3 className="font-bold text-vynk-text mt-4">Skills</h3>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newSkill} 
                  onChange={e => setNewSkill(e.target.value)} 
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  className="glass-input bg-vynk-bg-2 flex-1" 
                  placeholder="Add a skill (e.g. React)" 
                />
                <button type="button" onClick={handleAddSkill} className="btn-secondary px-4"><Plus size={18} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <span key={skill} className="flex items-center gap-1 px-3 py-1 bg-white border border-vynk-border rounded-lg text-xs font-bold shadow-sm">
                    {skill}
                    <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-red-500 hover:text-red-700 ml-1"><Trash2 size={12} /></button>
                  </span>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-vynk-border flex justify-end gap-3 bg-vynk-bg-1">
          <button onClick={onClose} disabled={isLoading} className="btn-secondary">Cancel</button>
          <button type="submit" form="edit-profile-form" disabled={isLoading} className="btn-primary flex items-center gap-2">
            <Save size={18} /> {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EditProfileModal;
