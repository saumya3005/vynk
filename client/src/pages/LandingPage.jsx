import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Briefcase, Code, BookOpen, Star, PlayCircle, MessageSquare, Compass, ArrowRight, Sparkles } from 'lucide-react';

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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card p-6 flex flex-col items-center justify-center text-center group"
    >
      <div className="w-14 h-14 rounded-2xl bg-white/60 flex items-center justify-center mb-4 text-primary shadow-sm group-hover:scale-110 transition-transform">
        <Icon size={28} />
      </div>
      <h3 className="text-4xl font-extrabold text-ink tracking-tight">
        {count.toLocaleString()}{suffix}
      </h3>
      <p className="text-muted font-medium mt-1 uppercase tracking-wider text-sm">{label}</p>
    </motion.div>
  );
};

const BentoCard = ({ title, subtitle, icon: Icon, className, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, delay }}
    className={`glass-card p-6 md:p-8 flex flex-col relative overflow-hidden group ${className}`}
  >
    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
      <Icon size={120} />
    </div>
    <div className="w-12 h-12 rounded-xl bg-white/80 shadow-soft flex items-center justify-center text-primary mb-6 relative z-10">
      <Icon size={24} />
    </div>
    <h3 className="text-2xl font-bold text-ink mb-2 relative z-10">{title}</h3>
    <p className="text-muted text-lg relative z-10">{subtitle}</p>
    <div className="mt-auto pt-6 relative z-10">
      {children}
    </div>
  </motion.div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen overflow-hidden relative bg-bg">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px] -z-10 mix-blend-multiply pointer-events-none animate-pulse"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] -z-10 mix-blend-multiply pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] rounded-full bg-accent/10 blur-[120px] -z-10 mix-blend-multiply pointer-events-none animate-pulse" style={{ animationDelay: '4s' }}></div>

      {/* Navbar */}
      <nav className="relative z-50 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-primary to-secondary shadow-md flex items-center justify-center">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-ink">Vynk</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="btn-secondary hidden md:flex">Sign In</Link>
          <Link to="/register" className="btn-primary">Join Vynk</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-32 relative z-10">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-32">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="px-4 py-2 rounded-full glass-panel text-primary font-bold text-sm tracking-wide shadow-sm mb-8 inline-flex items-center gap-2">
              <Sparkles size={16} /> VYNK 1.0 IS LIVE
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-ink tracking-tight leading-[1.1] mb-8">
              Connect. Create.<br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-accent">
                Collaborate.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted leading-relaxed font-medium mb-12 max-w-2xl mx-auto">
              The ultimate digital ecosystem where students, developers, and creators build the future together.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-4">
                Get Started Free <ArrowRight size={20} />
              </Link>
              <Link to="/explore" className="btn-secondary text-lg px-8 py-4">
                Explore Features
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">Everything you need to succeed</h2>
            <p className="text-xl text-muted">A complete suite of tools for the modern creator.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Reels / Stories */}
            <BentoCard 
              title="Social Feed & Reels" 
              subtitle="Share your journey with photos, videos, and short-form reels."
              icon={PlayCircle}
              className="md:col-span-2 bg-linear-to-br from-surface to-surface-soft"
              delay={0.1}
            >
              <div className="flex gap-4">
                <div className="h-32 w-24 rounded-lg bg-white/50 shadow-sm border border-border"></div>
                <div className="h-32 w-24 rounded-lg bg-white/50 shadow-sm border border-border mt-4"></div>
                <div className="h-32 w-24 rounded-lg bg-white/50 shadow-sm border border-border"></div>
              </div>
            </BentoCard>

            {/* Chat */}
            <BentoCard 
              title="Real-time Chat" 
              subtitle="Connect instantly with voice, video, and text."
              icon={MessageSquare}
              className="bg-linear-to-br from-surface to-surface-soft"
              delay={0.2}
            >
              <div className="flex flex-col gap-3">
                <div className="h-10 w-3/4 rounded-full bg-white/60 shadow-sm self-start"></div>
                <div className="h-10 w-2/4 rounded-full bg-primary/10 shadow-sm self-end"></div>
              </div>
            </BentoCard>

            {/* Projects */}
            <BentoCard 
              title="Project Collaboration" 
              subtitle="Showcase your GitHub repos and find teammates."
              icon={Code}
              className="bg-linear-to-br from-surface to-surface-soft"
              delay={0.3}
            >
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-white/60 text-sm font-medium text-ink">React</span>
                <span className="px-3 py-1 rounded-full bg-white/60 text-sm font-medium text-ink">Node.js</span>
                <span className="px-3 py-1 rounded-full bg-white/60 text-sm font-medium text-ink">MongoDB</span>
              </div>
            </BentoCard>

            {/* Notes */}
            <BentoCard 
              title="Student Hub" 
              subtitle="Access and share verified college notes and resources."
              icon={BookOpen}
              className="md:col-span-2 bg-linear-to-br from-surface to-surface-soft"
              delay={0.4}
            >
              <div className="flex items-center gap-4 bg-white/40 p-4 rounded-xl border border-border w-max">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center text-accent"><BookOpen size={20}/></div>
                <div>
                  <div className="font-bold text-ink">Data Structures</div>
                  <div className="text-sm text-muted">PDF • 2.4MB</div>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>

        {/* Live Statistics */}
        <div className="mt-32">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center text-3xl font-bold mb-12 text-ink"
          >
            Trusted by a growing ecosystem
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <AnimatedCounter end={12000} label="Students" icon={Users} />
            <AnimatedCounter end={3200} label="Projects" icon={Code} />
            <AnimatedCounter end={900} label="Recruiters" icon={Briefcase} />
            <AnimatedCounter end={450} label="Communities" icon={Compass} />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-40 text-center">
          <div className="glass-card p-12 max-w-3xl mx-auto bg-linear-to-tr from-surface to-primary/5">
            <h2 className="text-4xl font-bold text-ink mb-6">Ready to join the future?</h2>
            <p className="text-xl text-muted mb-8">Stop jumping between apps. Everything you need is right here.</p>
            <Link to="/register" className="btn-primary text-xl px-10 py-5">
              Create Your Account
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
};

export default LandingPage;
