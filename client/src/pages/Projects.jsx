import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Globe, ExternalLink, Heart, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { projectApi } from '../api/projectApi';
import toast from 'react-hot-toast';

const ProjectCard = ({ project, onUpdate }) => {
  const [isLiked, setIsLiked] = useState(false); // Can be linked to AuthContext to check if liked
  const [likesCount, setLikesCount] = useState(project.likes?.length || 0);
  const navigate = useNavigate();

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const updatedLikes = await projectApi.likeProject(project._id);
      setIsLiked(!isLiked);
      setLikesCount(updatedLikes.length);
    } catch (err) {
      toast.error('Failed to like project');
    }
  };

  const handleView = () => {
    projectApi.viewProject(project._id).catch(() => {});
    navigate(`/projects/${project._id}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleView}
      className="glass-card overflow-hidden group cursor-pointer flex flex-col h-full"
    >
      {/* Cover Image */}
      <div className="relative h-48 w-full overflow-hidden bg-vynk-bg-2">
        {project.images?.[0] ? (
          <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-tr from-vynk-primary to-vynk-secondary text-white font-bold text-xl">
            {project.title}
          </div>
        )}
        
        {project.collaborationOpen && (
          <div className="absolute top-4 right-4 bg-vynk-accent/90 backdrop-blur-sm text-green-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            Collab Open
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
          <div className="flex gap-2">
            {project.demoLink && (
              <a href={project.demoLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center backdrop-blur-md transition-colors"><Globe size={16}/></a>
            )}
            {project.githubLink && (
              <a href={project.githubLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center backdrop-blur-md transition-colors"><ExternalLink size={16}/></a>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-vynk-text group-hover:text-vynk-primary transition-colors mb-2 line-clamp-1">{project.title}</h3>
        <p className="text-sm text-vynk-muted line-clamp-2 mb-4 flex-1">{project.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {project.techStack?.map(tag => (
            <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-vynk-bg-2 border border-vynk-border px-2 py-1 rounded-md text-vynk-text/70">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-vynk-border/50">
          <div className="flex items-center gap-2">
            <img src={project.owner?.avatar || 'https://via.placeholder.com/40'} alt="Owner" className="w-6 h-6 rounded-full object-cover border border-vynk-border" />
            <span className="text-xs font-bold text-vynk-text">{project.owner?.username}</span>
          </div>
          
          <div className="flex items-center gap-3 text-xs font-semibold text-vynk-muted">
            <span className="flex items-center gap-1"><Eye size={14} /> {project.views || 0}</span>
            <button onClick={handleLike} className="flex items-center gap-1 group-hover:text-vynk-primary transition-colors hover:text-vynk-primary">
              <Heart size={14} className={isLiked ? 'fill-vynk-primary text-vynk-primary' : ''} /> {likesCount}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Projects = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await projectApi.getProjects();
      setProjects(data);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = activeTab === 'All' 
    ? projects 
    : projects.filter(p => activeTab === 'Open for Collab' ? p.collaborationOpen : p.category === activeTab);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header Banner */}
      <div className="w-full bg-linear-to-tr from-vynk-primary to-vynk-secondary rounded-3xl p-8 md:p-12 text-white mb-10 shadow-xl shadow-vynk-primary/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl mix-blend-overlay"></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md">Project Showcase</h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 font-medium">Discover top tier projects built by the Vynk community, find collaborators, and showcase your own startup or portfolio pieces.</p>
          <Link to="/projects/create" className="btn-secondary text-vynk-primary px-6 py-3 bg-white hover:bg-white hover:-translate-y-1">
            <Plus size={20} /> Publish Project
          </Link>
        </div>
        <div className="absolute right-[-10%] top-[-20%] w-64 h-64 bg-white/20 rounded-full blur-[80px]"></div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {['All', 'Web', 'Mobile', 'AI/ML', 'Blockchain', 'Open for Collab'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab ? 'bg-vynk-text text-white shadow-md' : 'bg-white border border-vynk-border text-vynk-muted hover:text-vynk-text'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-vynk-muted" size={18} />
            <input type="text" placeholder="Search projects..." className="glass-input w-full pl-10" />
          </div>
          <button className="glass-input px-4 flex items-center justify-center text-vynk-muted hover:text-vynk-text shrink-0">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-vynk-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 text-vynk-muted">
          <p className="text-xl font-bold">No projects found</p>
          <p className="text-sm">Be the first to publish a project in this category!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
