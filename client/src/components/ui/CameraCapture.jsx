import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, RefreshCcw, Check, VideoOff } from 'lucide-react';

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [photoData, setPhotoData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Camera access denied or unavailable.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
      setPhotoData(dataUrl);
      stopCamera();
    }
  };

  const retake = () => {
    setPhotoData(null);
    startCamera();
  };

  const handleConfirm = () => {
    onCapture(photoData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-200 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-lg bg-neutral-900 rounded-3xl overflow-hidden relative shadow-2xl border border-white/10"
      >
        {/* Header */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 bg-linear-to-b from-black/60 to-transparent">
          <h3 className="text-white font-bold tracking-wide">Camera</h3>
          <button onClick={() => { stopCamera(); onClose(); }} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/40 transition">
            <X size={18} />
          </button>
        </div>

        {/* Viewfinder */}
        <div className="w-full aspect-3/4 sm:aspect-video bg-black relative flex items-center justify-center">
          {error ? (
            <div className="flex flex-col items-center text-white/50 gap-4">
              <VideoOff size={48} />
              <p className="text-sm">{error}</p>
            </div>
          ) : photoData ? (
            <img src={photoData} alt="Captured" className="w-full h-full object-cover" />
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="p-6 bg-neutral-900 flex justify-center items-center gap-8">
          {photoData ? (
            <>
              <button onClick={retake} className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"><RefreshCcw size={20} /></div>
                <span className="text-xs font-bold">Retake</span>
              </button>
              <button onClick={handleConfirm} className="flex flex-col items-center gap-2 text-vynk-primary hover:text-white transition">
                <div className="w-16 h-16 rounded-full bg-vynk-primary flex items-center justify-center text-white shadow-lg shadow-vynk-primary/40"><Check size={32} /></div>
                <span className="text-xs font-bold">Use Photo</span>
              </button>
            </>
          ) : (
            <button onClick={capturePhoto} disabled={!!error} className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center group disabled:opacity-50">
              <div className="w-14 h-14 bg-white rounded-full group-hover:scale-95 transition-transform"></div>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CameraCapture;
