import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, PhoneCall, Video, VideoOff, Mic, MicOff, X } from 'lucide-react';

const CallModal = ({ socket, user, callee, callType, incomingCall, onClose }) => {
  const [callStatus, setCallStatus] = useState(incomingCall ? 'incoming' : 'calling');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [duration, setDuration] = useState(0);
  const [localStream, setLocalStream] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const timerRef = useRef(null);

  const isVideo = callType === 'video';

  // Get media on mount (for outgoing call or when accepted)
  useEffect(() => {
    if (!incomingCall) {
      startMedia();
    }
    return () => cleanup();
  }, []);

  // Listen for call events
  useEffect(() => {
    if (!socket) return;

    socket.on('callAccepted', ({ signal }) => {
      setCallStatus('active');
      startTimer();
      if (peerRef.current && signal) {
        try { peerRef.current.signal(signal); } catch {}
      }
    });

    socket.on('callRejected', () => {
      setCallStatus('rejected');
      setTimeout(onClose, 2000);
    });

    socket.on('callEnded', () => {
      setCallStatus('ended');
      setTimeout(onClose, 1500);
    });

    return () => {
      socket.off('callAccepted');
      socket.off('callRejected');
      socket.off('callEnded');
    };
  }, [socket]);

  const startMedia = async () => {
    try {
      const constraints = isVideo
        ? { video: true, audio: true }
        : { video: false, audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      // Emit call to other user
      if (!incomingCall && socket && callee) {
        socket.emit('callUser', {
          to: callee._id,
          from: user.id,
          callType,
          signal: null
        });
      }
    } catch (err) {
      console.error('Media error:', err);
      setCallStatus('error');
    }
  };

  const handleAccept = async () => {
    setCallStatus('active');
    await startMedia();
    startTimer();
    if (socket && incomingCall) {
      socket.emit('answerCall', { to: incomingCall.from, signal: null });
    }
  };

  const handleReject = () => {
    if (socket && incomingCall) {
      socket.emit('rejectCall', { to: incomingCall.from });
    }
    cleanup();
    onClose();
  };

  const handleEndCall = () => {
    const targetId = incomingCall ? incomingCall.from : callee?._id;
    if (socket && targetId) {
      socket.emit('endCall', { to: targetId });
    }
    setCallStatus('ended');
    cleanup();
    setTimeout(onClose, 1000);
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
      setIsCameraOff(!isCameraOff);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
  };

  const cleanup = () => {
    clearInterval(timerRef.current);
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
    }
  };

  const formatDuration = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const otherUser = incomingCall?.fromUser || callee;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 z-100 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          className="w-full max-w-lg bg-gray-900 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 text-center relative">
            <button onClick={handleEndCall} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
              <X size={18} />
            </button>

            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 bg-primary/30 border-2 border-primary">
              {otherUser?.avatar
                ? <img src={otherUser.avatar} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">{otherUser?.username?.[0]?.toUpperCase()}</div>
              }
            </div>

            <h3 className="text-white font-bold text-lg">{otherUser?.username || 'User'}</h3>

            <p className="text-white/60 text-sm mt-1">
              {callStatus === 'calling' && 'Calling...'}
              {callStatus === 'incoming' && `Incoming ${isVideo ? 'Video' : 'Voice'} Call`}
              {callStatus === 'active' && `${formatDuration(duration)}`}
              {callStatus === 'rejected' && 'Call Rejected'}
              {callStatus === 'ended' && 'Call Ended'}
              {callStatus === 'error' && 'Could not access media'}
            </p>
          </div>

          {/* Video area */}
          {isVideo && callStatus === 'active' && (
            <div className="relative mx-4 mb-4 rounded-2xl overflow-hidden bg-black h-52">
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-2 right-2 w-20 h-24 rounded-xl overflow-hidden bg-gray-800 border border-white/20">
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
              </div>
            </div>
          )}
          {isVideo && callStatus !== 'active' && (
            <div className="mx-4 mb-4 rounded-2xl bg-black/40 h-32 flex items-center justify-center">
              <Video size={32} className="text-white/20" />
            </div>
          )}

          {/* Action buttons */}
          <div className="p-6 flex justify-center gap-6">
            {callStatus === 'incoming' ? (
              <>
                <button onClick={handleReject} className="flex flex-col items-center gap-1">
                  <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors">
                    <PhoneOff size={24} className="text-white" />
                  </div>
                  <span className="text-white/60 text-xs">Decline</span>
                </button>
                <button onClick={handleAccept} className="flex flex-col items-center gap-1">
                  <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors">
                    {isVideo ? <Video size={24} className="text-white" /> : <Phone size={24} className="text-white" />}
                  </div>
                  <span className="text-white/60 text-xs">Accept</span>
                </button>
              </>
            ) : callStatus === 'active' ? (
              <>
                <button onClick={toggleMute} className="flex flex-col items-center gap-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500/80' : 'bg-white/20'}`}>
                    {isMuted ? <MicOff size={20} className="text-white" /> : <Mic size={20} className="text-white" />}
                  </div>
                  <span className="text-white/60 text-xs">{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>

                {isVideo && (
                  <button onClick={toggleCamera} className="flex flex-col items-center gap-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isCameraOff ? 'bg-red-500/80' : 'bg-white/20'}`}>
                      {isCameraOff ? <VideoOff size={20} className="text-white" /> : <Video size={20} className="text-white" />}
                    </div>
                    <span className="text-white/60 text-xs">{isCameraOff ? 'Start' : 'Stop'} Cam</span>
                  </button>
                )}

                <button onClick={handleEndCall} className="flex flex-col items-center gap-1">
                  <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors">
                    <PhoneOff size={24} className="text-white" />
                  </div>
                  <span className="text-white/60 text-xs">End</span>
                </button>
              </>
            ) : (
              <button onClick={onClose} className="px-8 py-3 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition-colors">
                Close
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CallModal;
