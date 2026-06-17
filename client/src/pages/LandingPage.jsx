import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Code, BookOpen, Briefcase, Globe, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Navbar */}
      <nav className="glass-card m-4 px-6 py-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-vynk-peach to-vynk-lavender"></div>
          <span className="text-2xl font-bold tracking-tight text-vynk-charcoal">Vynk</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link to="/login" className="font-medium hover:text-vynk-coral transition-colors">Sign In</Link>
          <Link to="/register" className="btn-primary py-2 px-4 text-sm">Join Now</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 text-center -mt-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-white backdrop-blur-sm mb-6 text-sm font-medium text-vynk-charcoal/80">
            <span className="w-2 h-2 rounded-full bg-vynk-mint animate-pulse"></span>
            The Future of Social Learning & Collaboration
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-extrabold tracking-tight mb-6 leading-tight">
            Where Ideas <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-vynk-coral via-vynk-peach to-vynk-lavender">
              Meet People.
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-vynk-charcoal/70 mb-10 max-w-2xl font-light">
            Connect with people, showcase your projects, share knowledge, build communities, and grow together in one unified ecosystem.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
            <Link to="/register" className="btn-primary text-lg px-8 py-4 flex items-center gap-2 group">
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="btn-secondary text-lg px-8 py-4">
              Explore Vynk
            </button>
          </motion.div>
        </motion.div>

        {/* Floating Feature Cards */}
        <div className="relative w-full max-w-5xl h-64 mt-16 perspective-1000 hidden md:block">
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute left-10 top-10 glass-card p-4 flex items-center gap-3 w-64"
          >
            <div className="p-3 bg-vynk-lavender/20 rounded-xl text-vynk-lavender"><Code size={24}/></div>
            <div className="text-left">
              <p className="font-bold text-sm">Developer Space</p>
              <p className="text-xs text-vynk-charcoal/60">Showcase your GitHub activity</p>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, -15, 0] }} 
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            className="absolute right-20 top-0 glass-card p-4 flex items-center gap-3 w-64"
          >
            <div className="p-3 bg-vynk-peach/20 rounded-xl text-vynk-peach"><BookOpen size={24}/></div>
            <div className="text-left">
              <p className="font-bold text-sm">Notes Hub</p>
              <p className="text-xs text-vynk-charcoal/60">Share & discover resources</p>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, -8, 0] }} 
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
            className="absolute left-1/3 top-24 glass-card p-4 flex items-center gap-3 w-64"
          >
            <div className="p-3 bg-vynk-mint/20 rounded-xl text-vynk-mint"><Briefcase size={24}/></div>
            <div className="text-left">
              <p className="font-bold text-sm">Recruiter Hub</p>
              <p className="text-xs text-vynk-charcoal/60">Find top talent easily</p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-vynk-peach/30 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-vynk-lavender/30 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>
    </div>
  );
};

export default LandingPage;
