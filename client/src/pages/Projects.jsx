import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Globe, ExternalLink, Heart, MessageCircle } from 'lucide-react';

const MOCK_PROJECTS = [
  {
    id: '1',
    title: 'Vynk Open Source',
    description: 'A next-gen social platform for students and developers.',
    techStack: ['React', 'Node.js', 'MongoDB'],
    owner: 'Alex Developer',
    likes: 156,
    comments: 24,
    collabOpen: true
  },
  {
    id: '2',
    title: 'AI Code Assistant',
    description: 'A CLI tool that helps you write better code using AI.',
    techStack: ['Python', 'OpenAI API', 'Click'],
    owner: 'Sarah Designer',
    likes: 89,
    comments: 12,
    collabOpen: false
  }
];

const Projects = () => {
  return (
    <div className="min-h-screen pt-24 px-4 md:px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-vynk-charcoal">Project Hub</h1>
          <p className="text-vynk-charcoal/60 mt-1">Discover, showcase, and collaborate on amazing projects.</p>
        </div>
        <Link to="/projects/create" className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Create Project
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
        {MOCK_PROJECTS.map((project, idx) => (
          <motion.div 
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{project.title}</h3>
              {project.collabOpen && (
                <span className="px-3 py-1 bg-vynk-mint/20 text-emerald-700 text-xs font-bold rounded-full">
                  Collab Open
                </span>
              )}
            </div>
            
            <p className="text-vynk-charcoal/80 text-sm mb-6 flex-1">{project.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {project.techStack.map(tech => (
                <span key={tech} className="px-2 py-1 bg-white/60 text-xs font-medium rounded-md text-vynk-charcoal/80 border border-white">
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-vynk-charcoal/10">
              <div className="flex gap-4">
                <button className="flex items-center gap-1.5 text-vynk-charcoal/60 hover:text-vynk-coral text-sm font-medium transition-colors">
                  <Heart size={16} /> {project.likes}
                </button>
                <button className="flex items-center gap-1.5 text-vynk-charcoal/60 hover:text-vynk-lavender text-sm font-medium transition-colors">
                  <MessageCircle size={16} /> {project.comments}
                </button>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-vynk-charcoal/60 hover:text-vynk-charcoal hover:bg-white/50 rounded-full transition-colors">
                  <Globe size={18} />
                </button>
                <button className="p-2 text-vynk-charcoal/60 hover:text-vynk-charcoal hover:bg-white/50 rounded-full transition-colors">
                  <ExternalLink size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
