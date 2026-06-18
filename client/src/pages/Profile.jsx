import { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Globe, UserPlus, MessageCircle, Briefcase, Award, Zap, ChevronRight, Edit3 } from 'lucide-react';

const Profile = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const isOwnProfile = !id || user?.id === id || user?._id === id;
  const [activeTab, setActiveTab] = useState('Posts');

  const profileData = {
    username: isOwnProfile ? user?.username || 'Vynk User' : 'TechEnthusiast',
    role: isOwnProfile ? user?.role || 'Full Stack Engineer' : 'Developer',
    bio: 'Passionate about building scalable web apps, learning new tech, and mentoring juniors. Currently exploring Web3 and AI.',
    location: 'Prayagraj, India',
    github: 'github.com/saumya3005',
    portfolio: 'vynk.dev',
    skills: ['React', 'Node.js', 'MongoDB', 'Tailwind', 'TypeScript', 'AWS'],
    stats: { followers: '12.4k', following: 350, xp: 4500, level: 12 },
    completion: 85,
    avatar: isOwnProfile ? user?.avatar : 'https://i.pravatar.cc/150?u=123'
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-24 md:pb-8">
      {/* Cover Banner */}
      <div className="h-48 md:h-64 w-full bg-linear-to-r from-vynk-primary via-vynk-secondary to-vynk-accent relative">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl mix-blend-overlay"></div>
        {isOwnProfile && (
          <button className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-colors">
            <Edit3 size={18} />
          </button>
        )}
      </div>

      <div className="px-4 md:px-8 relative -mt-20">
        <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between mb-8">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <div className="relative group cursor-pointer">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-vynk-bg-1 bg-white shadow-xl overflow-hidden shrink-0">
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-linear-to-tr from-vynk-primary to-vynk-secondary"></div>
                )}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-vynk-text text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-vynk-bg-1 shadow-md whitespace-nowrap flex items-center gap-1">
                <Zap size={12} className="text-yellow-400 fill-yellow-400" /> Level {profileData.stats.level}
              </div>
            </div>

            <div className="text-center md:text-left pb-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-vynk-text mb-1 tracking-tight">
                {profileData.username}
              </h1>
              <p className="text-vynk-primary font-bold text-lg mb-2">{profileData.role}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-semibold text-vynk-muted">
                <span className="flex items-center gap-1"><MapPin size={16} /> {profileData.location}</span>
                <span className="flex items-center gap-1"><Globe size={16} /> <a href="#" className="hover:text-vynk-primary transition-colors">{profileData.portfolio}</a></span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center md:justify-end gap-3 pb-2 w-full md:w-auto">
            {isOwnProfile ? (
              <button className="btn-secondary w-full md:w-auto">Edit Profile</button>
            ) : (
              <>
                <button className="btn-primary w-full md:w-auto"><UserPlus size={18} /> Follow</button>
                <button className="btn-secondary w-full md:w-auto"><MessageCircle size={18} /> Message</button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Stats Card */}
            <div className="glass-card p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center text-center">
                <div>
                  <p className="text-2xl font-bold text-vynk-text">{profileData.stats.followers}</p>
                  <p className="text-xs font-bold text-vynk-muted uppercase tracking-wider">Followers</p>
                </div>
                <div className="w-px h-8 bg-vynk-border"></div>
                <div>
                  <p className="text-2xl font-bold text-vynk-text">{profileData.stats.following}</p>
                  <p className="text-xs font-bold text-vynk-muted uppercase tracking-wider">Following</p>
                </div>
              </div>
              <div className="border-t border-vynk-border pt-4">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-vynk-muted uppercase tracking-wider">XP Progress</span>
                  <span className="text-sm font-bold text-vynk-primary">{profileData.stats.xp} / 5000</span>
                </div>
                <div className="w-full h-2 bg-vynk-border rounded-full overflow-hidden">
                  <div className="h-full bg-vynk-primary rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="glass-card p-6">
              <h3 className="font-bold text-lg mb-3">About</h3>
              <p className="text-vynk-text/80 leading-relaxed text-sm">{profileData.bio}</p>
            </div>

            {/* Skills */}
            <div className="glass-card p-6">
              <h3 className="font-bold text-lg mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1.5 bg-white border border-vynk-border rounded-lg text-xs font-bold text-vynk-text shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className="glass-card p-6">
              <h3 className="font-bold text-lg mb-4">Badges</h3>
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 shadow-sm tooltip" title="Top Contributor"><Award size={24} /></div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm tooltip" title="React Master"><Briefcase size={24} /></div>
                <div className="w-12 h-12 rounded-full bg-vynk-bg-2 border border-dashed border-vynk-muted flex items-center justify-center text-vynk-muted text-xs font-bold">+3</div>
              </div>
            </div>
            
          </div>

          {/* Right Column: Content */}
          <div className="lg:col-span-2">
            
            {isOwnProfile && profileData.completion < 100 && (
              <div className="glass-card p-5 mb-8 border-l-4 border-l-vynk-primary flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-vynk-text mb-1">Profile is {profileData.completion}% complete</h4>
                  <p className="text-sm text-vynk-muted">Add your Github link to reach 100% and earn the "All Star" badge.</p>
                </div>
                <button className="btn-secondary text-sm shrink-0">Complete Now</button>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-6 border-b border-vynk-border mb-6">
              {['Posts', 'Projects', 'Notes', 'Activity'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-bold relative transition-colors ${activeTab === tab ? 'text-vynk-text' : 'text-vynk-muted hover:text-vynk-text'}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-vynk-text rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-vynk-bg-2 rounded-full flex items-center justify-center mb-4 text-vynk-muted">
                <MessageCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-vynk-text mb-2">No {activeTab.toLowerCase()} yet</h3>
              <p className="text-vynk-muted mb-6">When {profileData.username} creates {activeTab.toLowerCase()}, they will appear here.</p>
              {isOwnProfile && <button className="btn-primary">Create {activeTab.slice(0, -1)}</button>}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;