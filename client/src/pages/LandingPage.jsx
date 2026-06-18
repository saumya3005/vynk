import { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Briefcase, Building, Layers, ArrowRight, Code, BookOpen, Star } from 'lucide-react';

const AnimatedCounter = ({ end, label, icon: Icon, suffix = '+' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="glass-card p-6 flex flex-col items-center justify-center text-center group hover:scale-105 transition-transform duration-300"
    >
      <div className="w-12 h-12 rounded-2xl bg-white/50 flex items-center justify-center mb-4 text-vynk-coral shadow-sm group-hover:bg-vynk-peach/20 transition-colors">
        <Icon size={24} />
      </div>
      <h3 className="text-4xl font-extrabold text-vynk-charcoal tracking-tight">
        {count.toLocaleString()}{suffix}
      </h3>
      <p className="text-vynk-charcoal/60 font-medium mt-1 uppercase tracking-wider text-sm">{label}</p>
    </motion.div>
  );
};

const FloatingCard = ({ delay, className, children }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: [0, -15, 0], opacity: 1 }}
    transition={{
      y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay },
      opacity: { duration: 1, delay }
    }}
    className={`absolute hidden lg:flex glass-card p-4 items-center gap-3 shadow-xl ${className}`}
  >
    {children}
  </motion.div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen overflow-hidden relative">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-vynk-lavender/30 blur-[120px] -z-10 mix-blend-multiply pointer-events-none animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-vynk-peach/30 blur-[120px] -z-10 mix-blend-multiply pointer-events-none animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-vynk-mint/30 blur-[120px] -z-10 mix-blend-multiply pointer-events-none animate-blob animation-delay-4000"></div>

      {/* Navbar (Landing Specific) */}
      <nav className="relative z-50 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-tr from-vynk-coral to-vynk-lavender shadow-md"></div>
          <span className="text-2xl font-bold tracking-tight text-vynk-charcoal">Vynk</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="btn-secondary hidden md:block">Sign In</Link>
          <Link to="/register" className="btn-primary">Join Vynk</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 relative z-10">
        
        {/* Floating Elements (Desktop Only) */}
        <FloatingCard delay={0} className="top-10 right-[10%]">
          <div className="w-10 h-10 rounded-full bg-vynk-mint/20 text-emerald-600 flex items-center justify-center"><Code size={20}/></div>
          <div>
            <p className="text-sm font-bold">New Pull Request</p>
            <p className="text-xs text-vynk-charcoal/60">AI Code Assistant</p>
          </div>
        </FloatingCard>

        <FloatingCard delay={1.5} className="top-40 left-[5%]">
          <div className="w-10 h-10 rounded-full bg-vynk-lavender/20 text-purple-600 flex items-center justify-center"><Briefcase size={20}/></div>
          <div>
            <p className="text-sm font-bold">Google Recruiter</p>
            <p className="text-xs text-vynk-charcoal/60">Viewed your profile</p>
          </div>
        </FloatingCard>

        <FloatingCard delay={2.5} className="bottom-20 right-[15%]">
          <div className="w-10 h-10 rounded-full bg-vynk-peach/20 text-vynk-coral flex items-center justify-center"><BookOpen size={20}/></div>
          <div>
            <p className="text-sm font-bold">Machine Learning Notes</p>
            <p className="text-xs flex items-center gap-1 text-yellow-600"><Star size={12} fill="currentColor"/> 4.9 Rating</p>
          </div>
        </FloatingCard>


        {/* Hero Content */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mt-10 md:mt-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="px-4 py-2 rounded-full bg-white/60 border border-white text-vynk-coral font-bold text-sm tracking-wide shadow-sm mb-6 inline-block">
              VYNK 2.0 IS LIVE 🚀
            </span>
            <h1 className="text-6xl md:text-8xl font-extrabold text-vynk-charcoal tracking-tight leading-[1.1] mb-8 drop-shadow-sm">
              Connect. Build.<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-vynk-coral via-vynk-peach to-vynk-lavender">
                Learn. Grow.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-vynk-charcoal/70 leading-relaxed font-medium mb-12 max-w-2xl mx-auto">
              One digital ecosystem for students, developers, creators, teachers, recruiters and startups.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2">
                Start Building Free <ArrowRight size={20} />
              </Link>
              <Link to="/explore" className="btn-secondary text-lg px-8 py-4 flex items-center justify-center">
                Explore Platform
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Live Statistics */}
        <div className="mt-32">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center text-2xl font-bold mb-12 text-vynk-charcoal/80"
          >
            Trusted by a growing ecosystem
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <AnimatedCounter end={12000} label="Students" icon={Users} />
            <AnimatedCounter end={3200} label="Projects" icon={Code} />
            <AnimatedCounter end={900} label="Recruiters" icon={Briefcase} />
            <AnimatedCounter end={450} label="Communities" icon={Layers} />
          </div>
        </div>

      </main>
    </div>
  );
};

export default LandingPage;
