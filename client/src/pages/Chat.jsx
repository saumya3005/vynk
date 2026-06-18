import { useState, useEffect, useContext, useRef } from 'react';
import { Send, Search, Video, Phone, MessageCircle, X, Paperclip } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { messageApi } from '../api/messageApi';
import { userApi } from '../api/userApi';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import MediaUploader from '../components/ui/MediaUploader';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const messagesEndRef = useRef(null);

  const [users, setUsers] = useState([]);
  const [activeChatUserId, setActiveChatUserId] = useState(null);

  const activeChatUser = users.find(u => u._id === activeChatUserId) || null;

  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, active
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const startCall = async () => {
    setIsVideoCallOpen(true);
    setCallStatus('calling');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      
      // Notify via socket
      if (socket) {
        socket.emit('callUser', { userToCall: activeChatUserId, signalData: 'signal', from: user.id });
      }
      
      // Simulate answering for demo
      setTimeout(() => setCallStatus('active'), 2000);
    } catch (err) {
      toast.error('Could not access camera/microphone');
      endCall();
    }
  };

  const endCall = () => {
    setIsVideoCallOpen(false);
    setCallStatus('idle');
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
  };

  useEffect(() => {
    const newSocket = io('http://localhost:5001');
    setSocket(newSocket);

    if (user?.id) {
      newSocket.emit('join', user.id);
    }

    newSocket.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => newSocket.close();
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      fetchMessages();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch users the current user follows or all users if following is empty
        const me = await userApi.getMe();
        if (me.following && me.following.length > 0) {
          const followings = await Promise.all(me.following.map(id => userApi.getUser(id)));
          setUsers(followings);
          if (followings.length > 0) setActiveChatUserId(followings[0]._id);
        } else {
          // Fallback: just fetch some users if API supports it, or leave empty
          setUsers([]);
        }
      } catch (err) {
        console.error('Failed to fetch chat users');
      }
    };
    if (user?.id) fetchUsers();
  }, [user]);

  const fetchMessages = async () => {
    if (!activeChatUserId) return;
    try {
      const data = await messageApi.getMessages(activeChatUserId);
      setMessages(data);
    } catch (err) {
      console.error('No messages found or error fetching');
    }
  };

  const handleSend = async () => {
    if ((!msg.trim() && !selectedFile) || !activeChatUserId) return;

    try {
      const data = new FormData();
      data.append('sender', user?.id);
      data.append('receiverId', activeChatUserId);
      if (msg.trim()) data.append('text', msg);
      if (selectedFile) data.append('file', selectedFile);

      // Optimistic UI update (text only)
      const tempMsg = { 
        _id: Date.now(), 
        sender: user?.id, 
        receiverId: activeChatUserId, 
        text: msg,
        createdAt: new Date().toISOString() 
      };
      setMessages(prev => [...prev, tempMsg]);
      setMsg('');
      setSelectedFile(null);
      setShowUploader(false);

      // Send to backend via REST
      const savedMsg = await messageApi.sendMessage(data);
      
      // Send to Socket.io for real-time delivery
      if (socket) {
        socket.emit('sendMessage', savedMsg);
      }
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 max-w-6xl mx-auto pb-4">
      <div className="glass-card flex h-[80vh] overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-vynk-charcoal/10 bg-white/30 flex flex-col">
          <div className="p-4 border-b border-vynk-charcoal/10">
            <h2 className="font-bold text-xl mb-4 text-vynk-text">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-vynk-charcoal/40" size={18} />
              <input type="text" placeholder="Search..." className="glass-input w-full pl-10 py-2 text-sm bg-white/50" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {users.map(u => (
              <div 
                key={u._id} 
                onClick={() => setActiveChatUserId(u._id)}
                className={`p-3 rounded-xl cursor-pointer flex gap-3 items-center border ${activeChatUserId === u._id ? 'bg-vynk-primary/10 border-vynk-primary/50' : 'bg-white/50 border-transparent hover:bg-white/80'} transition-colors mb-2`}
              >
                <div className="w-10 h-10 rounded-full bg-vynk-mint relative overflow-hidden shrink-0">
                  {u.avatar ? <img src={u.avatar} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-vynk-primary text-white">{u.username?.[0]?.toUpperCase()}</div>}
                  {u.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-bold text-sm text-vynk-text truncate">{u.username}</h4>
                  <p className="text-xs text-vynk-muted truncate">{u.role || 'Member'}</p>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="p-4 text-center text-sm text-vynk-muted">
                Follow users to start chatting!
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white/10">
          {activeChatUser ? (
            <>
              <div className="p-4 border-b border-vynk-charcoal/10 bg-white/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-vynk-mint overflow-hidden shrink-0">
                  {activeChatUser.avatar ? <img src={activeChatUser.avatar} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-vynk-primary text-white">{activeChatUser.username?.[0]?.toUpperCase()}</div>}
                </div>
                <div>
                  <h3 className="font-bold text-vynk-text">{activeChatUser.username}</h3>
                  <p className="text-xs text-green-600 font-medium">{activeChatUser.isOnline ? 'Online' : 'Offline'}</p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <button onClick={startCall} className="p-2 rounded-full hover:bg-vynk-bg-2 text-vynk-primary transition-colors">
                    <Video size={20} />
                  </button>
                  <button onClick={startCall} className="p-2 rounded-full hover:bg-vynk-bg-2 text-vynk-secondary transition-colors">
                    <Phone size={20} />
                  </button>
                </div>
              </div>
          
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-vynk-muted text-sm">
                Say hi to start the conversation!
              </div>
            ) : (
              messages.map(m => (
                <div 
                  key={m._id} 
                  className={`p-3 rounded-2xl max-w-[70%] ${m.sender === user?.id ? 'self-end bg-linear-to-r from-vynk-primary to-vynk-accent text-white rounded-tr-sm' : 'self-start bg-white/80 text-vynk-text rounded-tl-sm shadow-sm'}`}
                >
                  {m.mediaUrl && (
                    <div className="mb-2 rounded-lg overflow-hidden max-h-48">
                      {m.mediaType === 'video' ? (
                        <video src={m.mediaUrl} controls className="w-full h-full object-cover" />
                      ) : (
                        <img src={m.mediaUrl} alt="attachment" className="w-full h-full object-cover" />
                      )}
                    </div>
                  )}
                  {m.text && <p className="text-sm">{m.text}</p>}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-vynk-charcoal/10 bg-white/20 flex flex-col gap-2">
            {showUploader && (
              <div className="w-full mb-2">
                <MediaUploader onFileSelect={setSelectedFile} accept="image/*,video/*" label="Attach File" />
              </div>
            )}
            <div className="flex gap-2 w-full">
              <button onClick={() => setShowUploader(!showUploader)} className="p-3 bg-white/50 rounded-xl text-vynk-charcoal hover:bg-white/80 transition-colors">
                <Paperclip size={18} />
              </button>
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="flex-1 glass-input py-2 bg-white/50" 
                value={msg} 
                onChange={e => setMsg(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
              />
              <button onClick={handleSend} disabled={!msg.trim() && !selectedFile} className="btn-primary p-3 rounded-xl disabled:opacity-50"><Send size={18} /></button>
            </div>
          </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-vynk-muted bg-white/5">
              <MessageCircle size={48} className="mb-4 opacity-20" />
              <p className="font-bold text-lg text-vynk-text/50">Your Messages</p>
              <p className="text-sm text-vynk-muted">Select a user to start chatting</p>
            </div>
          )}
        </div>
      </div>

      {isVideoCallOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="glass-card bg-vynk-bg p-6 rounded-3xl w-full max-w-3xl relative">
            <button onClick={endCall} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white z-10 transition-colors">
              <X size={24} />
            </button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">{callStatus === 'calling' ? `Calling ${activeChatUser?.username}...` : `In call with ${activeChatUser?.username}`}</h2>
              <p className="text-vynk-muted">{callStatus === 'calling' ? 'Waiting for answer...' : '00:15'}</p>
            </div>
            <div className="flex gap-4 h-96">
              <div className="flex-1 bg-black rounded-2xl overflow-hidden relative border border-white/10">
                 <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                 {callStatus === 'calling' && <div className="absolute inset-0 flex items-center justify-center text-white/50">Connecting...</div>}
                 <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded text-white text-sm">{activeChatUser?.username}</div>
              </div>
              <div className="w-1/3 bg-black rounded-2xl overflow-hidden relative border border-white/10 shadow-lg">
                 <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]"></video>
                 <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded text-white text-sm">You</div>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-8">
               <button onClick={endCall} className="btn-primary bg-red-500 hover:bg-red-600 text-white rounded-full px-8 py-3 shadow-lg shadow-red-500/20">End Call</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
