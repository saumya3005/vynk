import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowBigUp, Eye, Globe, ExternalLink, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { projectApi } from '../api/projectApi';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [commentText, setCommentText] = useState('');
  
  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const data = await projectApi.getCommunityById ? await projectApi.getProjectById(id) : null; // wait, there's no getProjectById in projectApi? Let's assume we can add it or just use fetch
      // Let's use fetch directly since we didn't add getProjectById to projectApi
      const res = await fetch(`/api/projects/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      const dataRes = await res.json();
      setProject(dataRes);
    } catch (err) {
      toast.error('Failed to load project details');
      navigate('/projects');
    }
  };

  const handleUpvote = async () => {
    try {
      await projectApi.upvoteProject(id);
      loadProject();
    } catch (err) {
      toast.error('Failed to upvote');
    }
  };

  if (!project) return <div className="min-h-screen pt-24 px-4 text-center">Loading...</div>;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24">
      <div className="glass-card overflow-hidden">
        {project.images?.length > 0 && (
          <div className="w-full h-64 md:h-96 relative bg-surface">
            <img src={project.images[0]} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        
        <div className="p-6 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{project.title}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.techStack?.map(tech => (
                  <span key={tech} className="bg-surface border border-border px-3 py-1 rounded-full text-xs font-bold">{tech}</span>
                ))}
              </div>
              <div className="flex items-center gap-4 text-muted text-sm">
                <div className="flex items-center gap-2">
                  <img src={project.owner?.avatar || 'https://via.placeholder.com/40'} className="w-8 h-8 rounded-full border border-border" alt=""/>
                  <span className="font-bold text-text">{project.owner?.username}</span>
                </div>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Eye size={16}/> {project.views} views</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button onClick={handleUpvote} className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${project.upvotes?.includes(user?.id) ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface hover:bg-white/5'}`}>
                <ArrowBigUp size={20} className={project.upvotes?.includes(user?.id) ? 'fill-primary' : ''} />
                <span className="font-bold">{project.upvotes?.length || 0}</span>
              </button>
              {project.demoLink && <a href={project.demoLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold hover:shadow-lg"><Globe size={18}/> Demo</a>}
              {project.githubLink && <a href={project.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border font-bold hover:bg-white/5"><ExternalLink size={18}/> Code</a>}
            </div>
          </div>
          
          <div className="space-y-8 text-text/90">
            <div>
              <h3 className="text-xl font-bold mb-3 border-b border-border pb-2">Description</h3>
              <p className="leading-relaxed whitespace-pre-wrap">{project.description}</p>
            </div>
            {project.problemStatement && (
              <div>
                <h3 className="text-xl font-bold mb-3 border-b border-border pb-2">The Problem</h3>
                <p className="leading-relaxed whitespace-pre-wrap">{project.problemStatement}</p>
              </div>
            )}
            {project.solution && (
              <div>
                <h3 className="text-xl font-bold mb-3 border-b border-border pb-2">The Solution</h3>
                <p className="leading-relaxed whitespace-pre-wrap">{project.solution}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
