import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Globe, UserPlus, UserCheck, MessageCircle, Briefcase, Award, Zap, Edit3, Camera, Image as ImageIcon } from 'lucide-react';
import { userApi } from '../api/userApi';
import toast from 'react-hot-toast';
import CameraCapture from '../components/ui/CameraCapture';
import EditProfileModal from '../components/ui/EditProfileModal';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, login } = useContext(AuthContext);
  
  // Strict check for invalid IDs
  useEffect(() => {
    if (id === 'undefined' || id === 'null') {
      navigate('/profile', { replace: true });
    }
  }, [id, navigate]);

  const actualId = (id === 'undefined' || id === 'null') ? undefined : id;
  const isOwnProfile = !actualId || currentUser?.id === actualId || currentUser?._id === actualId;
  const [activeTab, setActiveTab] = useState('Posts');
  
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    // Skip if id is invalid — redirect will handle it
    if (id === 'undefined' || id === 'null') return;

    setIsLoading(true);
    try {
      let data;
      // If no id in URL, this is /profile — always fetch own profile
      if (!id) {
        data = await userApi.getMe();
      } else {
        data = await userApi.getUser(id);
      }
      setProfileData(data);

      // Check following status for other users
      const myId = currentUser?.id || currentUser?._id;
      if (id && myId && data.followers) {
        setIsFollowing(data.followers.some(f => f === myId || f?._id === myId || f?.toString() === myId));
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      const msg = err.response?.data?.message || 'Failed to load profile';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profileData) return;
    try {
      const res = await userApi.followUser(profileData._id);
      setIsFollowing(res.isFollowing);
      setProfileData(prev => ({
        ...prev,
        followers: res.isFollowing 
          ? [...prev.followers, currentUser.id] 
          : prev.followers.filter(uid => uid !== currentUser.id)
      }));
      toast.success(res.isFollowing ? 'Followed user' : 'Unfollowed user');
    } catch (err) {
      toast.error('Failed to follow/unfollow');
    }
  };

  const handleAvatarCapture = async (base64) => {
    try {
      const formData = new FormData();
      const res = await fetch(base64);
      const blob = await res.blob();
      formData.append('avatar', blob, 'avatar-capture.jpg');

      const response = await userApi.updateAvatar(formData);
      setProfileData(prev => ({ ...prev, avatar: response.avatar }));
      
      const updatedUser = { ...currentUser, avatar: response.avatar };
      login(updatedUser, localStorage.getItem('token'));
      
      toast.success('Avatar updated successfully!');
    } catch (err) {
      toast.error('Failed to update avatar');
    }
  };

  const handleAvatarFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await userApi.updateAvatar(formData);
      setProfileData(prev => ({ ...prev, avatar: response.avatar }));
      
      const updatedUser = { ...currentUser, avatar: response.avatar };
      login(updatedUser, localStorage.getItem('token'));
      
      toast.success('Avatar updated successfully!');
    } catch (err) {
      toast.error('Failed to upload avatar');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profileData) {
    return <div className="text-center py-20 text-text">Profile not found</div>;
  }

  // Safe defaults
  const skills = profileData.skills || ['React', 'Node.js', 'MongoDB', 'Tailwind'];
  const stats = {
    followers: profileData.followers?.length || 0,
    following: profileData.following?.length || 0,
    xp: profileData.xp || 1250,
    level: Math.floor((profileData.xp || 1250) / 100)
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-24 md:pb-8">
      {/* Cover Banner */}
      <div className="h-48 md:h-64 w-full bg-linear-to-r from-primary via-secondary to-accent relative">
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
            <div className="relative group">
              <div 
                onClick={() => isOwnProfile && setShowCamera(true)}
                className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-bg-1 bg-white shadow-xl overflow-hidden shrink-0 relative ${isOwnProfile ? 'cursor-pointer' : ''}`}
              >
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-linear-to-tr from-primary to-secondary flex items-center justify-center text-white text-4xl font-bold">
                    {profileData.username?.[0]?.toUpperCase()}
                  </div>
                )}
                
                {isOwnProfile && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                    <button onClick={() => setShowCamera(true)} className="bg-white/20 p-2 rounded-full hover:bg-white/40 tooltip" title="Camera">
                       <Camera size={20} className="text-white" />
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="bg-white/20 p-2 rounded-full hover:bg-white/40 tooltip" title="Gallery">
                       <ImageIcon size={20} className="text-white" />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarFileUpload} />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-text text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-bg-1 shadow-md whitespace-nowrap flex items-center gap-1">
                <Zap size={12} className="text-yellow-400 fill-yellow-400" /> Level {stats.level}
              </div>
            </div>

            <div className="text-center md:text-left pb-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-text mb-1 tracking-tight">
                {profileData.username}
              </h1>
              <p className="text-primary font-bold text-lg mb-2">{profileData.role || 'Member'}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-semibold text-muted">
                <span className="flex items-center gap-1"><MapPin size={16} /> {profileData.location || 'Earth'}</span>
                {profileData.socialLinks?.portfolio && (
                  <span className="flex items-center gap-1"><Globe size={16} /> <a href={profileData.socialLinks.portfolio} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Portfolio</a></span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center md:justify-end gap-3 pb-2 w-full md:w-auto">
            {isOwnProfile ? (
              <button onClick={() => setShowEditModal(true)} className="btn-secondary w-full md:w-auto">Edit Profile</button>
            ) : (
              <>
                <button onClick={handleFollow} className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all shadow-md active:scale-95 ${isFollowing ? 'bg-surface text-text border border-border' : 'bg-linear-to-r from-primary to-accent text-white'}`}>
                  {isFollowing ? <><UserCheck size={18} /> Following</> : <><UserPlus size={18} /> Follow</>}
                </button>
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
                  <p className="text-2xl font-bold text-text">{stats.followers}</p>
                  <p className="text-xs font-bold text-muted uppercase tracking-wider">Followers</p>
                </div>
                <div className="w-px h-8 bg-border"></div>
                <div>
                  <p className="text-2xl font-bold text-text">{stats.following}</p>
                  <p className="text-xs font-bold text-muted uppercase tracking-wider">Following</p>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-muted uppercase tracking-wider">XP Progress</span>
                  <span className="text-sm font-bold text-primary">{stats.xp % 1000} / 1000</span>
                </div>
                <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(stats.xp % 1000) / 10}%` }}></div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="glass-card p-6">
              <h3 className="font-bold text-lg mb-3">About</h3>
              <p className="text-text/80 leading-relaxed text-sm">
                {profileData.bio || `Hi, I'm ${profileData.username}! I love learning and connecting with people on Vynk.`}
              </p>
            </div>

            {/* Skills */}
            <div className="glass-card p-6">
              <h3 className="font-bold text-lg mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span key={skill} className="px-3 py-1.5 bg-white border border-border rounded-lg text-xs font-bold text-text shadow-sm">
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
              </div>
            </div>
            
          </div>

          {/* Right Column: Content */}
          <div className="lg:col-span-2">
            
            {/* Tabs */}
            <div className="flex gap-6 border-b border-border mb-6">
              {['Posts', 'Projects', 'Notes', 'Activity'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-bold relative transition-colors ${activeTab === tab ? 'text-text' : 'text-muted hover:text-text'}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-text rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-4 text-muted">
                <MessageCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-text mb-2">No {activeTab.toLowerCase()} yet</h3>
              <p className="text-muted mb-6">When {profileData.username} creates {activeTab.toLowerCase()}, they will appear here.</p>
              {isOwnProfile && <button className="btn-primary">Create {activeTab.slice(0, -1)}</button>}
            </div>

          </div>
        </div>
      </div>

      {showCamera && (
        <CameraCapture 
          onCapture={handleAvatarCapture} 
          onClose={() => setShowCamera(false)} 
        />
      )}

      {showEditModal && (
        <EditProfileModal 
          profileData={profileData} 
          onClose={() => setShowEditModal(false)} 
          onSave={(updatedData) => {
            setProfileData({ ...profileData, ...updatedData });
            login({ ...currentUser, ...updatedData }, localStorage.getItem('token'));
          }}
        />
      )}
    </div>
  );
};

export default Profile;