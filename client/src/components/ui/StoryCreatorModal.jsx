import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Type, Image as ImageIcon, Music, Smile, Send } from 'lucide-react';
import MediaUploader from './MediaUploader';

const StoryCreatorModal = ({ isOpen, onClose, onUpload }) => {
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaType, setMediaType] = useState('image');
  
  const [textOverlays, setTextOverlays] = useState([]);
  const [currentText, setCurrentText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  
  const [background, setBackground] = useState('linear-gradient(to right, #FF5A3D, #7C3AED)');
  const [privacy, setPrivacy] = useState('Everyone');

  const handleFileSelect = (file) => {
    setMediaFile(file);
    setMediaType(file.type.startsWith('video') ? 'video' : 'image');
    const reader = new FileReader();
    reader.onloadend = () => setMediaPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAddText = () => {
    if (currentText.trim()) {
      setTextOverlays([...textOverlays, { 
        text: currentText, 
        x: 50, 
        y: 50, 
        color: '#FFFFFF', 
        fontSize: 24,
        fontFamily: 'Inter'
      }]);
      setCurrentText('');
      setShowTextInput(false);
    }
  };

  const handleSubmit = () => {
    // We only support uploading the file right now, but we send the metadata
    const payload = {
      mediaUrl: mediaPreview, // In real app, upload to Cloudinary first
      mediaType,
      background,
      textOverlays,
      stickers: [],
      privacy,
      caption: ''
    };
    onUpload(payload);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-100 bg-black flex items-center justify-center p-0 md:p-4"
      >
        <div className="w-full h-full md:max-w-md md:max-h-[90vh] bg-ink rounded-none md:rounded-3xl overflow-hidden relative shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-50">
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white backdrop-blur-md transition-colors">
              <X size={24} />
            </button>
            
            {mediaPreview && (
              <div className="flex gap-2">
                <button onClick={() => setShowTextInput(true)} className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white backdrop-blur-md transition-colors"><Type size={20}/></button>
                <button className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white backdrop-blur-md transition-colors"><Smile size={20}/></button>
                <button className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white backdrop-blur-md transition-colors"><Music size={20}/></button>
              </div>
            )}
          </div>

          {/* Main Area */}
          <div className="flex-1 relative flex items-center justify-center" style={{ background: !mediaPreview ? background : '#000' }}>
            
            {!mediaPreview ? (
              <div className="flex flex-col items-center gap-6 p-6 w-full max-w-sm">
                <div className="text-white text-center mb-4">
                  <h2 className="text-2xl font-bold mb-2">Create Story</h2>
                  <p className="text-white/60 text-sm">Upload a photo or video to get started</p>
                </div>
                <MediaUploader onFileSelect={handleFileSelect} accept="image/*,video/*" label="Upload Media" />
                
                <div className="mt-8">
                  <p className="text-white/60 text-xs uppercase tracking-wider mb-2 text-center">Background Color</p>
                  <div className="flex gap-2 justify-center">
                    {['linear-gradient(to right, #FF5A3D, #7C3AED)', 'linear-gradient(to right, #00C2A8, #0088A8)', 'linear-gradient(to right, #F59E0B, #D97706)', '#141414'].map((bg, idx) => (
                      <button key={idx} onClick={() => setBackground(bg)} className={`w-8 h-8 rounded-full border-2 ${background === bg ? 'border-white' : 'border-transparent'}`} style={{ background: bg }}></button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {mediaType === 'video' ? (
                  <video src={mediaPreview} autoPlay loop muted className="w-full h-full object-cover" />
                ) : (
                  <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                )}
                
                {/* Overlays Rendering */}
                {textOverlays.map((overlay, idx) => (
                  <div key={idx} className="absolute" style={{ top: `${overlay.y}%`, left: `${overlay.x}%`, transform: 'translate(-50%, -50%)', color: overlay.color, fontSize: `${overlay.fontSize}px`, fontFamily: overlay.fontFamily, fontWeight: 'bold', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                    {overlay.text}
                  </div>
                ))}
              </>
            )}

            {/* Text Input Overlay */}
            {showTextInput && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
                <input 
                  autoFocus
                  type="text"
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                  placeholder="Type something..."
                  className="bg-transparent border-none text-white text-3xl font-bold text-center focus:outline-none w-full"
                />
                <button onClick={handleAddText} className="mt-6 btn-primary px-6 py-2">Done</button>
              </div>
            )}
          </div>

          {/* Footer Area */}
          {mediaPreview && (
            <div className="absolute bottom-0 left-0 w-full p-4 flex justify-between items-center bg-linear-to-t from-black/80 to-transparent z-40">
              <div className="flex bg-black/40 rounded-full p-1 backdrop-blur-md border border-white/10">
                {['Everyone', 'Close Friends'].map(p => (
                  <button key={p} onClick={() => setPrivacy(p)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${privacy === p ? 'bg-white text-black' : 'text-white hover:bg-white/20'}`}>
                    {p}
                  </button>
                ))}
              </div>
              <button onClick={handleSubmit} className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg shadow-primary/40">
                <Send size={20} className="ml-1" />
              </button>
            </div>
          )}
          
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StoryCreatorModal;
