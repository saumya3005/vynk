import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Globe, ExternalLink, Heart, Eye, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_PROJECTS = [
  {
    id: 1,
    title: 'Vynk UI Component Library',
    description: 'A comprehensive, accessible, and highly customizable React component library built with Tailwind CSS and Framer Motion.',
    image: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&q=80&w=1000',
    tags: ['React', 'Tailwind CSS', 'Framer Motion'],
    contributors: [
      { id: 1, avatar: 'https://i.pravatar.cc/150?u=1' },
      { id: 2, avatar: 'https://i.pravatar.cc/150?u=2' },
    ],
    views: 1205,
    likes: 342,
    openForCollab: true,
  },
  {
    id: 2,
    title: 'Neural Network Visualizer',
    description: 'Interactive web-based tool to visualize backpropagation and gradient descent in real-time. Built for ML students.',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1000',
    tags: ['Python', 'TensorFlow', 'Three.js'],
    contributors: [
      { id: 3, avatar: 'https://i.pravatar.cc/150?u=3' },
    ],
    views: 890,
    likes: 215,
    openForCollab: false,
  },
  {
    id: 3,
    title: 'OpenCommerce API',
    description: 'Scalable headless e-commerce backend built with Node.js, GraphQL, and Redis caching layer.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1000',
    tags: ['Node.js', 'GraphQL', 'Redis', 'PostgreSQL'],
    contributors: [
      { id: 4, avatar: 'https://i.pravatar.cc/150?u=4' },
      { id: 5, avatar: 'https://i.pravatar.cc/150?u=5' },
      { id: 6, avatar: 'https://i.pravatar.cc/150?u=6' },
    ],
    views: 3450,
    likes: 890,
    openForCollab: true,
  }
];

const ProjectCard = ({ project }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card overflow-hidden group cursor-pointer flex flex-col h-full"
  >
    {/* Cover Image */}
    <div className="relative h-48 w-full overflow-hidden bg-vynk-bg-2">
      <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      {project.openForCollab && (
        <div className="absolute top-4 right-4 bg-vynk-accent/90 backdrop-blur-sm text-green-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
          Collab Open
        </div>
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center backdrop-blur-md transition-colors"><Globe size={16}/></button>
          <button className="w-8 h-8 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center backdrop-blur-md transition-colors"><ExternalLink size={16}/></button>
        </div>
      </div>
    </div>

    {/* Content */}
    <div className="p-5 flex flex-col flex-1">
      <h3 className="text-lg font-bold text-vynk-text group-hover:text-vynk-primary transition-colors mb-2 line-clamp-1">{project.title}</h3>
      <p className="text-sm text-vynk-muted line-clamp-2 mb-4 flex-1">{project.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {project.tags.map(tag => (
          <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-vynk-bg-2 border border-vynk-border px-2 py-1 rounded-md text-vynk-text/70">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-vynk-border/50">
        <div className="flex -space-x-2">
          {project.contributors.slice(0, 3).map((c, i) => (
            <img key={i} src={c.avatar} alt="Contributor" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
          ))}
          {project.contributors.length > 3 && (
            <div className="w-6 h-6 rounded-full border-2 border-white bg-vynk-bg-2 flex items-center justify-center text-[10px] font-bold text-vynk-text">
              +{project.contributors.length - 3}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 text-xs font-semibold text-vynk-muted">
          <span className="flex items-center gap-1"><Eye size={14} /> {project.views}</span>
          <span className="flex items-center gap-1 group-hover:text-vynk-primary transition-colors"><Heart size={14} /> {project.likes}</span>
        </div>
      </div>
    </div>
  </motion.div>
);

const Projects = () => {
  const [activeTab, setActiveTab] = useState('All');

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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_PROJECTS.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
        {/* Duplicate for demo filling */}
        {MOCK_PROJECTS.map(project => (
          <ProjectCard key={`dup-${project.id}`} project={{...project, id: project.id + 10}} />
        ))}
      </div>
    </div>
  );
};

export default Projects;
