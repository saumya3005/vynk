import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Hash, MessageSquare, Plus, Settings, Users, Shield, User as UserIcon, Send, ShieldAlert, Check, X } from 'lucide-react';
import { communityApi } from '../api/communityApi';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const CommunityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [community, setCommunity] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [message, setMessage] = useState('');
  const [showMembers, setShowMembers] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [joinMessage, setJoinMessage] = useState('');
  
  useEffect(() => {
    loadCommunity();
  }, [id]);

  const loadCommunity = async () => {
    try {
      const data = await communityApi.getCommunityById(id);
      setCommunity(data);
      if (data.channels?.length > 0 && !activeChannel) {
        setActiveChannel(data.channels[0]);
      }
    } catch (err) {
      toast.error('Failed to load community');
      navigate('/communities');
    }
  };

  if (!community) return <div className="min-h-screen pt-24 px-4 text-center">Loading...</div>;

  const isAdmin = community.admins?.some(a => a._id === user?.id);
  const isMod = isAdmin || community.moderators?.some(m => m._id === user?.id);
  const isMember = isMod || community.members?.some(m => m._id === user?.id);
  
  const handleJoinRequest = async () => {
    try {
      await communityApi.requestJoin(id, joinMessage);
      toast.success('Join request sent!');
      loadCommunity();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
  };

  const handleManageRequest = async (reqId, status) => {
    try {
      await communityApi.manageRequest(id, reqId, status);
      toast.success(`Request ${status}`);
      loadCommunity();
    } catch (err) {
      toast.error('Failed to manage request');
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;
    try {
      await communityApi.createChannel(id, { name: newChannelName, type: 'text' });
      toast.success('Channel created');
      setNewChannelName('');
      loadCommunity();
    } catch (err) {
      toast.error('Failed to create channel');
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    try {
      await communityApi.addPost(id, { content: message });
      setMessage('');
      loadCommunity();
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  if (!isMember) {
    const hasPendingRequest = community.joinRequests?.some(r => r.user === user?.id && r.status === 'pending');
    
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <div className="w-24 h-24 rounded-2xl bg-primary/20 mx-auto mb-4 flex items-center justify-center">
            {community.banner ? <img src={community.banner} alt="" className="w-full h-full object-cover rounded-2xl" /> : <Users size={40} className="text-primary" />}
          </div>
          <h1 className="text-2xl font-bold mb-2">{community.name}</h1>
          <p className="text-muted mb-6">{community.description}</p>
          
          {hasPendingRequest ? (
            <button className="w-full py-3 bg-surface text-muted rounded-xl cursor-not-allowed">Request Pending...</button>
          ) : (
            <>
              <input
                type="text"
                placeholder="Optional: Why do you want to join?"
                value={joinMessage}
                onChange={e => setJoinMessage(e.target.value)}
                className="w-full glass-input py-2 mb-4"
              />
              <button onClick={handleJoinRequest} className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all">
                Request to Join
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col md:flex-row bg-ink text-text overflow-hidden">
      
      {/* Channels Sidebar */}
      <div className="w-full md:w-64 bg-white/5 border-r border-border flex flex-col shrink-0">
        <div className="h-14 border-b border-border flex items-center px-4 justify-between bg-white/5 font-bold shadow-sm">
          <span className="truncate">{community.name}</span>
          {isMod && (
            <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 hover:bg-white/10 rounded-lg text-muted hover:text-text transition-colors">
              <Settings size={18} />
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div>
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">Channels</span>
              {isMod && <button className="text-muted hover:text-text"><Plus size={14} /></button>}
            </div>
            {community.channels?.map(c => (
              <button
                key={c._id}
                onClick={() => setActiveChannel(c)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md mb-0.5 transition-colors ${activeChannel?._id === c._id ? 'bg-white/10 text-text font-medium' : 'text-muted hover:bg-white/5 hover:text-text'}`}
              >
                {c.type === 'text' ? <Hash size={16} className="opacity-70" /> : <MessageSquare size={16} className="opacity-70" />}
                <span className="truncate text-sm">{c.name}</span>
              </button>
            ))}
            {(!community.channels || community.channels.length === 0) && (
              <div className="px-2 text-xs text-muted italic">No channels yet</div>
            )}
          </div>

          {isMod && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2 px-2">Create Channel</p>
              <div className="flex items-center gap-2 px-2">
                <input
                  type="text"
                  placeholder="new-channel"
                  value={newChannelName}
                  onChange={e => setNewChannelName(e.target.value)}
                  className="w-full bg-black/40 border border-border rounded px-2 py-1 text-sm focus:outline-none focus:border-primary"
                />
                <button onClick={handleCreateChannel} className="p-1 bg-primary text-white rounded hover:bg-primary/80"><Plus size={14} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent">
        {showSettings && isMod ? (
          <div className="flex-1 overflow-y-auto p-6 bg-white/5">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings size={20} className="text-primary" /> Community Settings</h2>
            
            <div className="glass-card p-6 mb-6 border border-border">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><ShieldAlert size={18} className="text-warning" /> Join Requests</h3>
              {community.joinRequests?.filter(r => r.status === 'pending').length === 0 ? (
                <p className="text-muted text-sm">No pending requests.</p>
              ) : (
                <div className="space-y-3">
                  {community.joinRequests?.filter(r => r.status === 'pending').map(req => (
                    <div key={req._id} className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                          {req.user?.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{req.user?.username}</p>
                          {req.message && <p className="text-xs text-muted mt-0.5">"{req.message}"</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleManageRequest(req._id, 'approved')} className="p-1.5 bg-success/20 text-success rounded hover:bg-success/30"><Check size={16} /></button>
                        <button onClick={() => handleManageRequest(req._id, 'rejected')} className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"><X size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="h-14 border-b border-border flex items-center px-4 justify-between bg-white/5 shadow-sm shrink-0">
              <div className="flex items-center gap-2 font-bold">
                <Hash size={20} className="text-muted" />
                <span>{activeChannel?.name || 'general'}</span>
              </div>
              <button onClick={() => setShowMembers(!showMembers)} className={`p-1.5 rounded-lg transition-colors ${showMembers ? 'bg-white/10 text-text' : 'text-muted hover:text-text hover:bg-white/5'}`}>
                <Users size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Dummy rendering posts as messages for text channels */}
              {community.posts?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted">
                  <Hash size={48} className="mb-4 opacity-20" />
                  <p className="font-bold text-lg">Welcome to #{activeChannel?.name || 'general'}</p>
                  <p className="text-sm mt-1">This is the start of the channel.</p>
                </div>
              ) : (
                community.posts?.map(post => (
                  <div key={post._id} className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-primary/20 shrink-0 flex items-center justify-center font-bold text-primary mt-1">
                      {post.author?.avatar ? <img src={post.author.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : post.author?.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-bold text-[15px]">{post.author?.username}</span>
                        <span className="text-xs text-muted">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                      </div>
                      <p className="text-[15px] leading-relaxed text-text/90 whitespace-pre-wrap wrap-break-word">{post.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-white/5 border-t border-border shrink-0">
              <div className="relative flex items-end bg-black/40 rounded-xl border border-border focus-within:border-primary/50 transition-colors">
                <button className="p-3 text-muted hover:text-text shrink-0"><Plus size={20} /></button>
                <textarea
                  placeholder={`Message #${activeChannel?.name || 'general'}`}
                  className="flex-1 bg-transparent py-3 text-[15px] outline-none resize-none max-h-32 min-h-11"
                  rows={1}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                />
                <button onClick={handleSendMessage} className={`p-3 shrink-0 transition-colors ${message.trim() ? 'text-primary' : 'text-muted'}`}>
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Members Sidebar */}
      {showMembers && !showSettings && (
        <div className="w-60 bg-white/5 border-l border-border flex flex-col shrink-0">
          <div className="h-14 border-b border-border flex items-center px-4 bg-white/5 shadow-sm font-bold text-sm">
            Members
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {community.admins?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Admins — {community.admins.length}</h4>
                {community.admins.map(admin => (
                  <div key={admin._id} className="flex items-center gap-2 mb-2 group cursor-pointer">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">{admin.avatar ? <img src={admin.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : admin.username?.[0]?.toUpperCase()}</div>
                    </div>
                    <span className="text-sm font-medium group-hover:text-primary transition-colors truncate">{admin.username}</span>
                    <Shield size={12} className="text-primary ml-auto" />
                  </div>
                ))}
              </div>
            )}

            {community.moderators?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Moderators — {community.moderators.length}</h4>
                {community.moderators.map(mod => (
                  <div key={mod._id} className="flex items-center gap-2 mb-2 group cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">{mod.avatar ? <img src={mod.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : mod.username?.[0]?.toUpperCase()}</div>
                    <span className="text-sm font-medium group-hover:text-accent transition-colors truncate">{mod.username}</span>
                    <ShieldAlert size={12} className="text-accent ml-auto" />
                  </div>
                ))}
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Members — {community.members?.length || 0}</h4>
              {community.members?.map(member => (
                <div key={member._id} className="flex items-center gap-2 mb-2 group cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-muted font-bold">{member.avatar ? <img src={member.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : member.username?.[0]?.toUpperCase()}</div>
                  <span className="text-sm font-medium text-muted group-hover:text-text transition-colors truncate">{member.username}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CommunityDetails;
