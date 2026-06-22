import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import {
  MapPin, Globe, UserPlus, UserCheck, MessageCircle, Briefcase,
  Award, Zap, Edit3, Camera, Image as ImageIcon, Clock, Lock,
  Settings, Share2, Grid3X3, PlayCircle, FileText, Tag, Bookmark,
  MoreHorizontal, Users, Heart, Star
} from 'lucide-react';
import { userApi } from '../api/userApi';
import toast from 'react-hot-toast';
import CameraCapture from '../components/ui/CameraCapture';
import EditProfileModal from '../components/ui/EditProfileModal';
import api from '../api/axios';

const StatBox = ({ value, label, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-0.5 hover:opacity-75 transition-opacity group">
    <p className="text-xl font-black text-text group-hover:text-primary transition-colors">{value}</p>
    <p className="text-xs text-muted font-semibold uppercase tracking-wider">{label}</p>
  </button>
);

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, login } = useContext(AuthContext);

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
  const [isPending, setIsPending] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(null); // 'followers' | 'following' | null
  const [followersData, setFollowersData] = useState([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchProfile(); }, [id]);

  const fetchProfile = async () => {
    if (id === 'undefined' || id === 'null') return;
    setIsLoading(true);
    try {
      let data;
      if (!id) {
        data = await userApi.getMe();
      } else {
        data = await userApi.getUser(id);
      }
      setProfileData(data);
      const myId = currentUser?.id || currentUser?._id;
      if (id && myId) {
        if (data.followers) {
          setIsFollowing(data.followers.some(f => f === myId || f?._id === myId || f?.toString() === myId));
        }
        if (data.pendingFollowers) {
          setIsPending(data.pendingFollowers.some(f => f === myId || f?._id === myId || f?.toString() === myId));
        }
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      toast.error(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    if (!profileData) return;
    setPostsLoading(true);
    try {
      const userId = profileData._id;
      const res = await api.get(`/posts?author=${userId}&limit=20`);
      setUserPosts(res.data?.posts || res.data || []);
    } catch {
      setUserPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    if (profileData && activeTab === 'Posts') {
      fetchUserPosts();
    }
  }, [profileData, activeTab]);

  const fetchFollowers = async (type) => {
    setShowFollowersModal(type);
    setFollowersLoading(true);
    try {
      const userId = profileData?._id || currentUser?.id;
      const res = type === 'followers'
        ? await userApi.getFollowers(userId)
        : await userApi.getFollowing(userId);
      setFollowersData(res || []);
    } catch {
      setFollowersData([]);
    } finally {
      setFollowersLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profileData) return;
    try {
      const res = await userApi.followUser(profileData._id);
      if (res.status === 'pending') {
        setIsPending(true);
        setIsFollowing(false);
        toast.success('Follow request sent');
      } else {
        setIsFollowing(res.isFollowing);
        setIsPending(false);
        setProfileData(prev => ({
          ...prev,
          followers: res.isFollowing
            ? [...(prev.followers || []), currentUser.id]
            : (prev.followers || []).filter(uid => uid !== currentUser.id)
        }));
        toast.success(res.isFollowing ? 'Followed!' : 'Unfollowed');
      }
    } catch {
      toast.error('Failed to follow/unfollow');
    }
  };

  const handleAvatarCapture = async (base64) => {
    try {
      const res = await fetch(base64);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append('avatar', blob, 'avatar-capture.jpg');
      const response = await userApi.updateAvatar(formData);
      setProfileData(prev => ({ ...prev, avatar: response.avatar }));
      login({ ...currentUser, avatar: response.avatar }, localStorage.getItem('token'));
      toast.success('Avatar updated!');
    } catch { toast.error('Failed to update avatar'); }
  };

  const handleAvatarFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await userApi.updateAvatar(formData);
      setProfileData(prev => ({ ...prev, avatar: response.avatar }));
      login({ ...currentUser, avatar: response.avatar }, localStorage.getItem('token'));
      toast.success('Avatar updated!');
    } catch { toast.error('Failed to upload avatar'); }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => toast.success('Profile link copied!'));
  };

  if (isLoading) {
    return (
      <div className="w-full animate-pulse">
        <div className="h-48 bg-surface-soft rounded-2xl mb-4" />
        <div className="flex gap-4 px-4">
          <div className="w-24 h-24 rounded-full bg-surface-soft -mt-12 border-4 border-bg" />
          <div className="flex-1 pt-2 space-y-2">
            <div className="h-5 bg-surface-soft rounded w-32" />
            <div className="h-3 bg-surface-soft rounded w-20" />
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center py-20">
        <p className="text-muted text-lg">Profile not found</p>
        <button onClick={() => navigate('/feed')} className="btn-primary mt-4">Go Home</button>
      </div>
    );
  }

  const stats = {
    followers: profileData.followers?.length || 0,
    following: profileData.following?.length || 0,
    xp: profileData.xp || 0,
    level: Math.floor((profileData.xp || 0) / 100)
  };

  const TABS = [
    { label: 'Posts', icon: Grid3X3 },
    { label: 'Reels', icon: PlayCircle },
    { label: 'Projects', icon: Briefcase },
    { label: 'Notes', icon: FileText },
    ...(isOwnProfile ? [{ label: 'Saved', icon: Bookmark }] : [])
  ];

  const isPrivateLocked = profileData.settings?.privacy?.isPrivate && !isOwnProfile && !isFollowing;

  return (
    <div className="w-full max-w-3xl mx-auto pb-24 md:pb-8">
      {/* Cover Banner */}
      <div className="h-44 md:h-56 w-full relative rounded-2xl overflow-hidden bg-linear-to-r from-primary/60 via-secondary/50 to-accent/40 mb-0">
        {profileData.coverImage && <img src={profileData.coverImage} alt="Cover" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-bg/40" />
        {isOwnProfile && (
          <button className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition-colors">
            <Camera size={16} />
          </button>
        )}
      </div>

      {/* Avatar + Info Row */}
      <div className="px-4 md:px-6">
        <div className="flex items-end justify-between -mt-12 mb-4">
          {/* Avatar */}
          <div className="relative group">
            <div
              onClick={() => isOwnProfile && setShowCamera(true)}
              className={`w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-bg bg-surface shadow-xl overflow-hidden shrink-0 relative ${isOwnProfile ? 'cursor-pointer' : ''}`}
            >
              {profileData.avatar
                ? <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-linear-to-tr from-primary to-secondary flex items-center justify-center text-white text-3xl font-black">{profileData.username?.[0]?.toUpperCase()}</div>
              }
              {isOwnProfile && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1.5">
                  <button onClick={e => { e.stopPropagation(); setShowCamera(true); }} className="bg-white/20 p-1.5 rounded-full hover:bg-white/40"><Camera size={16} className="text-white" /></button>
                  <button onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }} className="bg-white/20 p-1.5 rounded-full hover:bg-white/40"><ImageIcon size={16} className="text-white" /></button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarFileUpload} />
                </div>
              )}
            </div>
            {/* Level badge */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-surface border border-border text-text text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap shadow-md">
              <Zap size={10} className="text-yellow-400 fill-yellow-400" /> Lv {stats.level}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pb-1">
            {isOwnProfile ? (
              <>
                <button onClick={() => setShowEditModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface-soft hover:bg-surface text-text font-bold text-sm transition-all">
                  <Edit3 size={15} /> Edit
                </button>
                <button onClick={handleShare} className="p-2 rounded-full border border-border bg-surface-soft hover:bg-surface text-text transition-all">
                  <Share2 size={16} />
                </button>
                <button onClick={() => navigate('/settings')} className="p-2 rounded-full border border-border bg-surface-soft hover:bg-surface text-text transition-all">
                  <Settings size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleFollow}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm transition-all ${
                    isFollowing
                      ? 'bg-surface-soft text-text border border-border hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                      : isPending
                        ? 'bg-surface-soft text-muted border border-border'
                        : 'bg-primary text-white shadow-lg shadow-primary/25 hover:-translate-y-0.5'
                  }`}
                >
                  {isFollowing ? <><UserCheck size={15} /> Following</> : isPending ? <><Clock size={15} /> Requested</> : <><UserPlus size={15} /> Follow</>}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface-soft hover:bg-surface text-text font-bold text-sm transition-all">
                  <MessageCircle size={15} /> Message
                </button>
                <button className="p-2 rounded-full border border-border bg-surface-soft hover:bg-surface text-text transition-all">
                  <MoreHorizontal size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Name & Info */}
        <div className="mb-4">
          <h1 className="text-2xl font-black text-text tracking-tight">{profileData.username}</h1>
          <p className="text-sm text-primary font-bold mt-0.5">{profileData.role || 'Member'}</p>
          {profileData.bio && <p className="text-sm text-text/80 mt-2 leading-relaxed">{profileData.bio}</p>}
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted font-semibold">
            {profileData.location && <span className="flex items-center gap-1"><MapPin size={13} /> {profileData.location}</span>}
            {profileData.portfolio && (
              <a href={profileData.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-accent hover:underline">
                <Globe size={13} /> Portfolio
              </a>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-6 py-4 border-t border-b border-border mb-4">
          <StatBox value={userPosts.length || '—'} label="Posts" onClick={() => setActiveTab('Posts')} />
          <StatBox value={stats.followers} label="Followers" onClick={() => fetchFollowers('followers')} />
          <StatBox value={stats.following} label="Following" onClick={() => fetchFollowers('following')} />
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-soft border border-border">
            <Zap size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-black text-text">{stats.xp} XP</span>
          </div>
        </div>

        {/* Tabs */}
        {!isPrivateLocked && (
          <>
            <div className="flex border-b border-border mb-1">
              {TABS.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => setActiveTab(label)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-bold transition-colors relative ${
                    activeTab === label ? 'text-text' : 'text-muted hover:text-text'
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden sm:block">{label}</span>
                  {activeTab === label && (
                    <motion.div layoutId="profile-tab-indicator" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === 'Posts' && (
                  postsLoading ? (
                    <div className="grid grid-cols-3 gap-0.5 mt-1">
                      {Array(9).fill(0).map((_, i) => (
                        <div key={i} className="aspect-square bg-surface-soft animate-pulse" />
                      ))}
                    </div>
                  ) : userPosts.length > 0 ? (
                    <div className="grid grid-cols-3 gap-0.5 mt-1">
                      {userPosts.map(post => (
                        <div key={post._id} className="aspect-square relative group overflow-hidden cursor-pointer bg-surface-soft">
                          {post.media?.[0] ? (
                            <img src={post.media[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-surface-soft">
                              <p className="text-[10px] text-muted text-center px-2 leading-tight line-clamp-3">{post.content}</p>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-xs font-bold">
                            <span className="flex items-center gap-1"><Heart size={14} /> {post.likes?.length || 0}</span>
                            <span className="flex items-center gap-1"><MessageCircle size={14} /> {post.comments?.length || 0}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center">
                      <Grid3X3 size={40} className="text-muted mx-auto mb-3 opacity-40" />
                      <p className="font-bold text-text mb-1">No posts yet</p>
                      <p className="text-sm text-muted mb-4">
                        {isOwnProfile ? 'Share your first post with the world!' : `${profileData.username} hasn't posted yet.`}
                      </p>
                      {isOwnProfile && <button onClick={() => navigate('/feed')} className="btn-primary text-sm">Create Post</button>}
                    </div>
                  )
                )}

                {activeTab === 'Reels' && (
                  <div className="py-16 text-center">
                    <PlayCircle size={40} className="text-muted mx-auto mb-3 opacity-40" />
                    <p className="font-bold text-text mb-1">No reels yet</p>
                    {isOwnProfile && <button onClick={() => navigate('/reels')} className="btn-primary text-sm mt-4">Upload Reel</button>}
                  </div>
                )}

                {activeTab === 'Projects' && (
                  <div className="py-16 text-center">
                    <Briefcase size={40} className="text-muted mx-auto mb-3 opacity-40" />
                    <p className="font-bold text-text mb-1">No projects yet</p>
                    {isOwnProfile && <button onClick={() => navigate('/projects/create')} className="btn-primary text-sm mt-4">Create Project</button>}
                  </div>
                )}

                {activeTab === 'Notes' && (
                  <div className="py-16 text-center">
                    <FileText size={40} className="text-muted mx-auto mb-3 opacity-40" />
                    <p className="font-bold text-text mb-1">No notes yet</p>
                    {isOwnProfile && <button onClick={() => navigate('/notes/upload')} className="btn-primary text-sm mt-4">Upload Note</button>}
                  </div>
                )}

                {activeTab === 'Saved' && isOwnProfile && (
                  <div className="py-16 text-center">
                    <Bookmark size={40} className="text-muted mx-auto mb-3 opacity-40" />
                    <p className="font-bold text-text mb-1">Saved items appear here</p>
                    <p className="text-sm text-muted">Like and save posts, projects, and notes to see them here.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}

        {/* Private Account Lock */}
        {isPrivateLocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-16 text-center"
          >
            <div className="w-16 h-16 rounded-full border-2 border-border flex items-center justify-center mx-auto mb-4 bg-surface-soft">
              <Lock size={28} className="text-muted" />
            </div>
            <h3 className="font-black text-lg text-text mb-1">This account is private</h3>
            <p className="text-sm text-muted max-w-xs mx-auto">Follow this account to see their posts, reels, projects, and notes.</p>
          </motion.div>
        )}
      </div>

      {/* Modals */}
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
          onUpdate={(updated) => {
            setProfileData(updated);
            login({ ...currentUser, ...updated }, localStorage.getItem('token'));
          }}
        />
      )}

      {/* Followers/Following Modal */}
      <AnimatePresence>
        {showFollowersModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFollowersModal(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="fixed bottom-0 left-0 w-full max-w-md mx-auto right-0 bg-surface border border-border rounded-t-3xl z-50 max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="font-black text-text capitalize">{showFollowersModal}</h3>
                <button onClick={() => setShowFollowersModal(null)} className="text-muted hover:text-text transition-colors text-sm font-bold">Done</button>
              </div>
              <div className="overflow-y-auto custom-scrollbar flex-1 p-4 space-y-3">
                {followersLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-surface-soft" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-surface-soft rounded w-24" />
                        <div className="h-2 bg-surface-soft rounded w-16" />
                      </div>
                    </div>
                  ))
                ) : followersData.length > 0 ? (
                  followersData.map(u => (
                    <div key={u._id} className="flex items-center gap-3">
                      <div
                        onClick={() => { setShowFollowersModal(null); navigate(`/profile/${u._id}`); }}
                        className="w-10 h-10 rounded-full overflow-hidden bg-surface-soft cursor-pointer shrink-0"
                      >
                        {u.avatar
                          ? <img src={u.avatar} alt={u.username} className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-linear-to-tr from-primary to-secondary flex items-center justify-center text-white text-sm font-black">{u.username?.[0]?.toUpperCase()}</div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-text truncate cursor-pointer hover:text-primary transition-colors" onClick={() => { setShowFollowersModal(null); navigate(`/profile/${u._id}`); }}>{u.username}</p>
                        <p className="text-xs text-muted truncate">{u.role || 'Member'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <Users size={32} className="text-muted mx-auto mb-2 opacity-40" />
                    <p className="text-sm text-muted font-semibold">No {showFollowersModal} yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;