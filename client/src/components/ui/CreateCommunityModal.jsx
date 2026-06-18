import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Image as ImageIcon } from 'lucide-react';
import { communityApi } from '../../api/communityApi';
import toast from 'react-hot-toast';
import MediaUploader from './MediaUploader';

const CreateCommunityModal = ({ onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Development'
  });
  const [bannerFile, setBannerFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const submitCommunity = async (bannerBase64) => {
      try {
        const payload = {
          ...formData,
          banner: bannerBase64 || ''
        };
        const res = await communityApi.createCommunity(payload);
        toast.success('Community created!');
        onCreated(res);
        onClose();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to create community');
      } finally {
        setIsLoading(false);
      }
    };

    if (bannerFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        submitCommunity(reader.result);
      };
      reader.readAsDataURL(bannerFile);
    } else {
      submitCommunity('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-lg bg-white overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 border-b border-vynk-border">
          <h2 className="text-xl font-bold text-vynk-text">Create Community</h2>
          <button onClick={onClose} className="p-2 hover:bg-vynk-bg-2 rounded-full text-vynk-muted hover:text-vynk-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-vynk-text/80">Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="glass-input bg-vynk-bg-2" required placeholder="e.g. React Developers" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-vynk-text/80">Category</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="glass-input bg-vynk-bg-2">
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="Business">Business</option>
              <option value="Data Science">Data Science</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-vynk-text/80">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="glass-input bg-vynk-bg-2 resize-none" required placeholder="What is this community about?" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-vynk-text/80">Banner Image</label>
            <MediaUploader onFileSelect={setBannerFile} accept="image/*" label="Upload Banner" />
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary mt-2 flex justify-center items-center gap-2">
            <Plus size={18} /> {isLoading ? 'Creating...' : 'Create Community'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateCommunityModal;
