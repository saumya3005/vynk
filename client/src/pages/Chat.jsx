import { useState, useEffect, useContext, useRef } from 'react';
import { Send, Search, MessageCircle, X, Paperclip, Smile, Image as ImageIcon, Video, FileText, Trash2, Reply, ChevronLeft, Phone, Mic, Square } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { messageApi } from '../api/messageApi';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import CallModal from '../components/chat/CallModal';

const STICKERS = ['😂', '🔥', '❤️', '🎉', '👏', '😎', '🚀', '✨', '🥳', '😭', '💯', '🙏', '👀', '🤯', '💪', '🫡'];
const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '😡', '👍'];

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [chatUsers, setChatUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChatUserId, setActiveChatUserId] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // UI panels
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [reactingTo, setReactingTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  const [activeCall, setActiveCall] = useState(null);

  // File preview
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState('');

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const activeChatUser = chatUsers.find(u => u._id === activeChatUserId) || searchResults.find(u => u._id === activeChatUserId) || null;

  // Socket setup
  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    if (user?.id) {
      newSocket.emit('join', user.id);
    }

    newSocket.on('receiveMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('onlineUsers', (userIds) => {
      setOnlineUsers(new Set(userIds));
    });

    newSocket.on('userOnline', (userId) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    newSocket.on('userOffline', (userId) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    newSocket.on('typing', ({ userId }) => {
      setTypingUsers(prev => new Set([...prev, userId]));
    });

    newSocket.on('stopTyping', ({ userId }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    newSocket.on('messageDeleted', ({ messageId }) => {
      setMessages(prev => prev.filter(m => m._id !== messageId));
    });

    newSocket.on('messagesSeen', ({ senderId, receiverId }) => {
      setMessages(prev => prev.map(m => {
        if ((m.sender === senderId || m.sender?._id === senderId) && (m.receiverId === receiverId || m.receiverId?._id === receiverId)) {
          return { ...m, seen: true };
        }
        return m;
      }));
    });

    newSocket.on('incomingCall', (data) => {
      setActiveCall({ incoming: data, type: data.callType });
    });

    return () => newSocket.close();
  }, [user]);

  // Load chat users
  useEffect(() => {
    if (user?.id) loadChatUsers();
  }, [user]);

  // Load messages when active user changes
  useEffect(() => {
    if (activeChatUserId) {
      fetchMessages();
      setShowMobileSidebar(false);
    }
  }, [activeChatUserId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Search debounce
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const results = await messageApi.searchUsers(searchQuery);
        setSearchResults(results);
      } catch (e) { console.error(e); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadChatUsers = async () => {
    try {
      const users = await messageApi.getActiveUsers();
      setChatUsers(users);
    } catch (err) {
      console.error('Failed to load chat users');
    }
  };

  const fetchMessages = async () => {
    if (!activeChatUserId) return;
    try {
      const data = await messageApi.getMessages(activeChatUserId);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages');
    }
  };

  const markMessagesAsSeen = async () => {
    if (!activeChatUserId) return;
    try {
      // Find unread messages received from activeChatUserId
      const unreadIds = messages.filter(m => (m.sender === activeChatUserId || m.sender?._id === activeChatUserId) && !m.seen).map(m => m._id);
      for (const id of unreadIds) {
        await messageApi.markSeen(id);
      }
      if (socket) {
        socket.emit('markSeen', { senderId: activeChatUserId, receiverId: user.id });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Auto mark seen when new message arrives and chat is active
  useEffect(() => {
    if (messages.length > 0 && activeChatUserId) {
      const lastMsg = messages[messages.length - 1];
      if ((lastMsg.sender === activeChatUserId || lastMsg.sender?._id === activeChatUserId) && !lastMsg.seen) {
        markMessagesAsSeen();
      }
    }
  }, [messages, activeChatUserId]);

  // Typing indicator
  let typingTimeout = useRef(null);
  const handleTyping = () => {
    if (socket && activeChatUserId) {
      socket.emit('typing', { userId: user.id, receiverId: activeChatUserId });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit('stopTyping', { userId: user.id, receiverId: activeChatUserId });
      }, 2000);
    }
  };

  const handleSend = async () => {
    if (!msg.trim() && !previewFile) return;
    if (!activeChatUserId) return;

    try {
      let mediaUrl = '';
      let mediaType = 'text';
      let fileName = '';
      let fileSize = 0;

      if (previewFile) {
        mediaUrl = previewUrl;
        mediaType = previewType;
        fileName = previewFile.name;
        fileSize = previewFile.size;
      }

      const payload = {
        receiverId: activeChatUserId,
        text: msg.trim(),
        mediaUrl,
        mediaType: previewFile ? mediaType : 'text',
        fileName,
        fileSize,
        replyTo: replyingTo?._id || null
      };

      const savedMsg = await messageApi.sendMessage(payload);
      setMessages(prev => [...prev, savedMsg]);
      setMsg('');
      setPreviewFile(null);
      setPreviewUrl('');
      setReplyingTo(null);
      setShowAttachMenu(false);

      if (socket) {
        socket.emit('sendMessage', { ...savedMsg, receiverId: activeChatUserId });
        socket.emit('stopTyping', { userId: user.id, receiverId: activeChatUserId });
      }

      loadChatUsers(); // refresh sidebar order
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    }
  };

  const handleSendSticker = async (sticker) => {
    if (!activeChatUserId) return;
    try {
      const payload = { receiverId: activeChatUserId, text: '', sticker, mediaType: 'sticker' };
      const savedMsg = await messageApi.sendMessage(payload);
      setMessages(prev => [...prev, savedMsg]);
      setShowStickerPicker(false);
      if (socket) socket.emit('sendMessage', { ...savedMsg, receiverId: activeChatUserId });
      loadChatUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send sticker');
    }
  };

  const handleFileSelect = (accept) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
    setShowAttachMenu(false);
  };

  const handleFileChosen = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewFile(file);
    const type = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'file';
    setPreviewType(type);

    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      const updated = await messageApi.addReaction(messageId, emoji);
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, reactions: updated.reactions } : m));
      setReactingTo(null);
    } catch (err) {
      toast.error('Failed to add reaction');
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      await messageApi.deleteMessage(id);
      setMessages(prev => prev.filter(m => m._id !== id));
      if (socket) socket.emit('deleteMessage', { messageId: id, receiverId: activeChatUserId });
      toast.success('Message deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const displayUsers = searchQuery.trim() ? searchResults : chatUsers;

  const formatTime = (date) => {
    try {
      const d = new Date(date);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  const getLastMessagePreview = (u) => {
    if (!u.lastMessage) return '';
    if (u.lastMessage.sticker) return u.lastMessage.sticker;
    if (u.lastMessage.mediaType === 'audio') return '🎤 Voice note';
    if (u.lastMessage.mediaUrl) return '📎 Attachment';
    return u.lastMessage.text?.substring(0, 30) || '';
  };

  // Voice Note Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
          setPreviewType('audio');
          setPreviewFile(new File([audioBlob], 'voice_note.webm', { type: 'audio/webm' }));
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => setRecordingDuration(prev => prev + 1), 1000);
    } catch (err) {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
      setPreviewFile(null);
      setPreviewUrl('');
      setPreviewType('');
      audioChunksRef.current = [];
    }
  };

  const formatRecordingTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChosen} />

      <div className="glass-card flex flex-1 overflow-hidden rounded-2xl">
        {/* Sidebar */}
        <div className={`${showMobileSidebar ? 'flex' : 'hidden md:flex'} w-full md:w-80 lg:w-96 border-r border-border flex-col bg-white/40`}>
          <div className="p-4 border-b border-border">
            <h2 className="font-bold text-xl mb-3 text-text">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-muted" size={16} />
              <input
                type="text"
                placeholder="Search users..."
                className="glass-input w-full pl-9 py-2 text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearching(true)}
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="absolute right-3 top-2.5 text-muted hover:text-text">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {displayUsers.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted">
                {searchQuery ? 'No users found' : 'Search for users to start chatting'}
              </div>
            ) : (
              displayUsers.map(u => (
                <button
                  key={u._id}
                  onClick={() => setActiveChatUserId(u._id)}
                  className={`w-full p-3 flex gap-3 items-center transition-colors text-left ${activeChatUserId === u._id ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-white/60 border-l-4 border-l-transparent'}`}
                >
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-primary/20">
                      {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-primary font-bold">{u.username?.[0]?.toUpperCase()}</div>}
                    </div>
                    {onlineUsers.has(u._id) && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-sm text-text truncate">{u.username}</h4>
                      {u.lastMessage && <span className="text-[10px] text-muted shrink-0">{formatTime(u.lastMessage.createdAt)}</span>}
                    </div>
                    <p className="text-xs text-muted truncate">{getLastMessagePreview(u) || u.role || 'Member'}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${!showMobileSidebar ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-linear-to-b from-white/5 to-white/20`}>
          {activeChatUser ? (
            <>
              {/* Header */}
              <div className="p-3 border-b border-border bg-white/40 flex items-center gap-3">
                <button onClick={() => setShowMobileSidebar(true)} className="md:hidden p-1 text-muted hover:text-text">
                  <ChevronLeft size={22} />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/20">
                    {activeChatUser.avatar ? <img src={activeChatUser.avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-primary font-bold">{activeChatUser.username?.[0]?.toUpperCase()}</div>}
                  </div>
                  {onlineUsers.has(activeChatUserId) && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text">{activeChatUser.username}</h3>
                  <p className="text-[11px] font-medium text-muted">
                    {typingUsers.has(activeChatUserId) ? (
                      <span className="text-primary animate-pulse">typing...</span>
                    ) : onlineUsers.has(activeChatUserId) ? (
                      <span className="text-green-600">Online</span>
                    ) : 'Offline'}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <button onClick={() => setActiveCall({ type: 'voice' })} className="p-2 rounded-full hover:bg-white/80 text-muted transition-colors">
                    <Phone size={18} />
                  </button>
                  <button onClick={() => setActiveCall({ type: 'video' })} className="p-2 rounded-full hover:bg-white/80 text-muted transition-colors">
                    <Video size={20} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2">
                {messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-muted text-sm">
                    Say hi to start the conversation! 👋
                  </div>
                ) : (
                  messages.map(m => {
                    const isMine = m.sender === user?.id || m.sender?._id === user?.id;
                    return (
                      <div key={m._id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} group relative`}>
                        {/* Reply reference */}
                        {m.replyTo && (
                          <div className={`text-[10px] px-3 py-1 rounded-lg mb-0.5 max-w-[60%] truncate ${isMine ? 'bg-white/30 text-muted' : 'bg-primary/10 text-muted'}`}>
                            ↩ {m.replyTo.text || 'Attachment'}
                          </div>
                        )}

                        <div className={`relative max-w-[75%] ${isMine ? 'ml-auto' : 'mr-auto'}`}>
                          {/* Message bubble */}
                          <div className={`px-3.5 py-2 rounded-2xl ${isMine ? 'bg-linear-to-r from-primary to-accent text-white rounded-tr-sm' : 'bg-white shadow-sm text-text rounded-tl-sm'}`}>
                            {/* Sticker */}
                            {m.sticker && <div className="text-4xl py-1">{m.sticker}</div>}

                            {/* Media */}
                            {m.mediaUrl && m.mediaType === 'image' && (
                              <img src={m.mediaUrl} alt="" className="rounded-lg max-h-48 mb-1" />
                            )}
                            {m.mediaUrl && m.mediaType === 'video' && (
                              <video src={m.mediaUrl} controls className="rounded-lg max-h-48 mb-1 max-w-full" />
                            )}
                            {m.mediaUrl && m.mediaType === 'audio' && (
                              <audio src={m.mediaUrl} controls className="mb-1 w-64 max-w-full" />
                            )}
                            {m.mediaUrl && m.mediaType === 'file' && (
                              <div className="flex items-center gap-2 p-2 bg-white/20 rounded-lg mb-1">
                                <FileText size={18} />
                                <div className="text-xs">
                                  <p className="font-semibold truncate max-w-32">{m.fileName || 'File'}</p>
                                  {m.fileSize > 0 && <p className="opacity-70">{(m.fileSize / 1024).toFixed(1)} KB</p>}
                                </div>
                              </div>
                            )}

                            {/* Text */}
                            {m.text && <p className="text-sm leading-relaxed wrap-break-word">{m.text}</p>}

                            {/* Time + status */}
                            <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : ''}`}>
                              <span className={`text-[10px] ${isMine ? 'text-white/60' : 'text-muted'}`}>{formatTime(m.createdAt)}</span>
                              {isMine && (
                                <span className={`text-[10px] ${m.seen ? 'text-blue-200' : 'text-white/40'}`}>
                                  {m.seen ? '✓✓' : m.delivered ? '✓✓' : '✓'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Reactions */}
                          {m.reactions?.length > 0 && (
                            <div className={`flex gap-0.5 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                              {m.reactions.map((r, i) => (
                                <span key={i} className="text-xs bg-white shadow-sm rounded-full px-1.5 py-0.5 border border-border">{r.emoji}</span>
                              ))}
                            </div>
                          )}

                          {/* Hover actions */}
                          <div className={`absolute top-0 ${isMine ? '-left-20' : '-right-20'} hidden group-hover:flex items-center gap-1`}>
                            <button onClick={() => setReactingTo(reactingTo === m._id ? null : m._id)} className="p-1 rounded-full hover:bg-white/80 text-muted text-xs">😊</button>
                            <button onClick={() => setReplyingTo(m)} className="p-1 rounded-full hover:bg-white/80 text-muted"><Reply size={12} /></button>
                            {isMine && <button onClick={() => handleDeleteMessage(m._id)} className="p-1 rounded-full hover:bg-red-50 text-red-400"><Trash2 size={12} /></button>}
                          </div>

                          {/* Reaction picker */}
                          <AnimatePresence>
                            {reactingTo === m._id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                className={`absolute ${isMine ? '-left-2' : '-right-2'} -top-10 bg-white rounded-full shadow-xl border border-border px-2 py-1 flex gap-1 z-10`}
                              >
                                {REACTION_EMOJIS.map(emoji => (
                                  <button key={emoji} onClick={() => handleReaction(m._id, emoji)} className="text-lg hover:scale-125 transition-transform">{emoji}</button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply bar */}
              {replyingTo && (
                <div className="px-4 py-2 bg-primary/5 border-t border-border flex items-center gap-2">
                  <Reply size={14} className="text-primary" />
                  <p className="text-xs text-muted flex-1 truncate">Replying to: {replyingTo.text || 'Attachment'}</p>
                  <button onClick={() => setReplyingTo(null)} className="text-muted hover:text-text"><X size={14} /></button>
                </div>
              )}

              {/* File preview */}
              {previewFile && (
                <div className="px-4 py-2 bg-white/60 border-t border-border flex items-center gap-3">
                  {previewType === 'image' && <img src={previewUrl} alt="" className="w-12 h-12 object-cover rounded-lg" />}
                  {previewType === 'video' && <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center"><Video size={18} className="text-primary" /></div>}
                  {previewType === 'file' && <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center"><FileText size={18} className="text-secondary" /></div>}
                  {previewType === 'audio' && <div className="flex-1 flex items-center gap-3 bg-red-500/10 p-2 rounded-lg"><Mic size={18} className="text-red-500 animate-pulse" /><audio src={previewUrl} controls className="h-8 flex-1" /></div>}
                  <div className="flex-1 overflow-hidden">
                    {previewType !== 'audio' && <p className="text-sm font-semibold text-text truncate">{previewFile.name}</p>}
                    <p className="text-xs text-muted">{(previewFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={() => { setPreviewFile(null); setPreviewUrl(''); setPreviewType(''); }} className="text-muted hover:text-red-500"><X size={16} /></button>
                </div>
              )}

              {/* Input area */}
              <div className="p-3 border-t border-border bg-white/40 flex items-end gap-2 relative">
                {/* Emoji picker */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-xl border border-border p-3 z-20 w-72"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-text">Emojis</span>
                        <button onClick={() => setShowEmojiPicker(false)} className="text-muted"><X size={14} /></button>
                      </div>
                      <div className="grid grid-cols-8 gap-1">
                        {['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','😘','🥰','😗','😙','😚','🙂','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','🥱','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','☹️','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬','😰','😱'].map(e => (
                          <button key={e} onClick={() => { setMsg(prev => prev + e); setShowEmojiPicker(false); }} className="text-xl hover:scale-125 transition-transform p-0.5">{e}</button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Sticker picker */}
                <AnimatePresence>
                  {showStickerPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full left-12 mb-2 bg-white rounded-2xl shadow-xl border border-border p-3 z-20 w-64"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-text">Stickers</span>
                        <button onClick={() => setShowStickerPicker(false)} className="text-muted"><X size={14} /></button>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {STICKERS.map(s => (
                          <button key={s} onClick={() => handleSendSticker(s)} className="text-3xl hover:scale-110 transition-transform bg-surface rounded-xl p-2">{s}</button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Attach menu */}
                <AnimatePresence>
                  {showAttachMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full right-16 mb-2 bg-white rounded-xl shadow-xl border border-border overflow-hidden z-20"
                    >
                      <button onClick={() => handleFileSelect('image/*')} className="flex items-center gap-3 w-full p-3 hover:bg-surface transition-colors text-sm font-medium text-text">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><ImageIcon size={16} className="text-blue-600" /></div> Photo
                      </button>
                      <button onClick={() => handleFileSelect('video/*')} className="flex items-center gap-3 w-full p-3 hover:bg-surface transition-colors text-sm font-medium text-text">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center"><Video size={16} className="text-purple-600" /></div> Video
                      </button>
                      <button onClick={() => handleFileSelect('.pdf,.doc,.docx,.ppt,.pptx,.txt,image/*,video/*')} className="flex items-center gap-3 w-full p-3 hover:bg-surface transition-colors text-sm font-medium text-text">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center"><FileText size={16} className="text-orange-600" /></div> File
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowStickerPicker(false); setShowAttachMenu(false); }} className="p-2.5 rounded-xl hover:bg-white/80 text-muted transition-colors shrink-0">
                  <Smile size={20} />
                </button>
                <button onClick={() => { setShowStickerPicker(!showStickerPicker); setShowEmojiPicker(false); setShowAttachMenu(false); }} className="p-2.5 rounded-xl hover:bg-white/80 text-muted transition-colors shrink-0 text-lg">
                  🎭
                </button>

                {isRecording ? (
                  <div className="flex-1 flex items-center justify-between px-4 py-2 bg-red-50 text-red-500 rounded-xl border border-red-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      <span className="text-sm font-medium">{formatRecordingTime(recordingDuration)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={cancelRecording} className="text-muted hover:text-text"><Trash2 size={16} /></button>
                      <button onClick={stopRecording} className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"><Square size={14} fill="currentColor" /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 glass-input py-2.5 text-sm"
                      value={msg}
                      onChange={e => { setMsg(e.target.value); handleTyping(); }}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    />

                    <button onClick={() => { setShowAttachMenu(!showAttachMenu); setShowEmojiPicker(false); setShowStickerPicker(false); }} className="p-2.5 rounded-xl hover:bg-white/80 text-muted transition-colors shrink-0">
                      <Paperclip size={20} />
                    </button>

                    {msg.trim() || previewFile ? (
                      <button
                        onClick={handleSend}
                        className="p-2.5 bg-linear-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg transition-all shrink-0"
                      >
                        <Send size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={startRecording}
                        className="p-2.5 bg-surface text-muted rounded-xl hover:bg-white/80 hover:text-primary transition-colors shrink-0"
                      >
                        <Mic size={18} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted">
              <MessageCircle size={56} className="mb-4 opacity-15" />
              <p className="font-bold text-xl text-text/40">Your Messages</p>
              <p className="text-sm mt-1">Search for a user and start chatting</p>
            </div>
          )}
        </div>
      </div>

      {activeCall && (
        <CallModal
          socket={socket}
          user={user}
          callee={activeCall.incoming ? null : activeChatUser}
          callType={activeCall.type}
          incomingCall={activeCall.incoming}
          onClose={() => setActiveCall(null)}
        />
      )}
    </div>
  );
};

export default Chat;
