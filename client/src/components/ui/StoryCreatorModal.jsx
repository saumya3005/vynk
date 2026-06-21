import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Type, Image as ImageIcon, Music, Smile, Send, Brush, Eraser, Clock } from 'lucide-react';
import MediaUploader from './MediaUploader';
import toast from 'react-hot-toast';

const StoryCreatorModal = ({ isOpen, onClose, onUpload }) => {
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaType, setMediaType] = useState('image');
  
  const [textOverlays, setTextOverlays] = useState([]);
  const [currentText, setCurrentText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  
  const [background, setBackground] = useState('linear-gradient(to right, #FF5F45, #7B61FF)');
  const [privacy, setPrivacy] = useState('Everyone');
  const [stickers, setStickers] = useState([]);
  const [showStickerTray, setShowStickerTray] = useState(false);

  // Drawing Canvas setup
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#FFFFFF');
  const [brushSize, setBrushSize] = useState(5);
  const [drawMode, setDrawMode] = useState('brush'); // brush, eraser, none
  const [canvasInited, setCanvasInited] = useState(false);

  useEffect(() => {
    if (mediaPreview && canvasRef.current && !canvasInited) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      // Set relative sizes
      canvas.width = canvas.parentElement.clientWidth || 400;
      canvas.height = canvas.parentElement.clientHeight || 600;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      setCanvasInited(true);
    }
  }, [mediaPreview, canvasInited]);

  const startDrawing = (e) => {
    if (drawMode === 'none') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = drawMode === 'eraser' ? '#000000' : brushColor;
    ctx.lineWidth = brushSize;
    if (drawMode === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || drawMode === 'none') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleFileSelect = (file) => {
    setMediaFile(file);
    setMediaType(file.type.startsWith('video') ? 'video' : 'image');
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
      setCanvasInited(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddText = () => {
    if (currentText.trim()) {
      setTextOverlays([...textOverlays, { 
        text: currentText, 
        x: 50, 
        y: 50, 
        color: brushColor, 
        fontSize: 24,
        fontFamily: 'Outfit'
      }]);
      setCurrentText('');
      setShowTextInput(false);
    }
  };

  const handleAddSticker = (emoji) => {
    setStickers([...stickers, {
      emoji,
      x: 50,
      y: 40,
      size: 40
    }]);
    setShowStickerTray(false);
  };

  const handleSubmit = () => {
    // If canvas has drawings, capture dataUrl
    let finalMedia = mediaPreview;
    if (canvasRef.current) {
      // Create a final composite image on a temporary canvas if needed
      // For this pass we will export the drawing layer as sticker overlay or payload url
      const drawLayer = canvasRef.current.toDataURL();
      payloadDrawingLayer(drawLayer);
      return;
    }
    submitPayload(finalMedia);
  };

  const payloadDrawingLayer = (drawLayer) => {
    // Save drawing layer into stickers for rendering in viewer
    const storyStickers = [...stickers];
    if (drawLayer) {
      storyStickers.push({
        type: 'drawing',
        url: drawLayer,
        x: 50,
        y: 50,
        size: 100
      });
    }
    submitPayload(mediaPreview, storyStickers);
  };

  const submitPayload = (mediaUrl, finalStickers = stickers) => {
    const payload = {
      mediaUrl: mediaUrl || '',
      mediaType,
      background,
      textOverlays,
      stickers: finalStickers,
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
        className="fixed inset-0 z-100 bg-neutral-950 flex items-center justify-center p-0 md:p-4"
      >
        <div className="w-full h-full md:max-w-md md:max-h-[90vh] bg-surface rounded-none md:rounded-3xl overflow-hidden relative shadow-2xl flex flex-col border border-border/50">
          
          {/* Header */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-50">
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/45 hover:bg-black/60 flex items-center justify-center text-white backdrop-blur-md transition-colors">
              <X size={20} />
            </button>
            
            {mediaPreview && (
              <div className="flex gap-2 bg-black/45 p-1 rounded-full backdrop-blur-md">
                <button onClick={() => { setDrawMode(drawMode === 'brush' ? 'none' : 'brush'); }} className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors ${drawMode === 'brush' ? 'bg-primary' : 'hover:bg-white/10'}`}><Brush size={16}/></button>
                <button onClick={() => { setDrawMode(drawMode === 'eraser' ? 'none' : 'eraser'); }} className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors ${drawMode === 'eraser' ? 'bg-secondary' : 'hover:bg-white/10'}`}><Eraser size={16}/></button>
                <button onClick={() => setShowTextInput(true)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white transition-colors"><Type size={16}/></button>
                <button onClick={() => setShowStickerTray(!showStickerTray)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white transition-colors"><Smile size={16}/></button>
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
                    {['linear-gradient(to right, #FF5F45, #7B61FF)', 'linear-gradient(to right, #00D4FF, #7B61FF)', 'linear-gradient(to right, #FFB800, #FF5F45)', '#0B0F1A'].map((bg, idx) => (
                      <button key={idx} onClick={() => setBackground(bg)} className={`w-8 h-8 rounded-full border-2 ${background === bg ? 'border-white' : 'border-transparent'}`} style={{ background: bg }}></button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                {mediaType === 'video' ? (
                  <video src={mediaPreview} autoPlay loop muted className="w-full h-full object-cover" />
                ) : (
                  <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                )}
                
                {/* Paint drawing canvas */}
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className={`absolute inset-0 z-20 ${drawMode !== 'none' ? 'cursor-crosshair' : 'pointer-events-none'}`}
                />

                {/* Overlays Rendering */}
                <div className="absolute inset-0 pointer-events-none z-10">
                  {textOverlays.map((overlay, idx) => (
                    <div key={idx} className="absolute" style={{ top: `${overlay.y}%`, left: `${overlay.x}%`, transform: 'translate(-50%, -50%)', color: overlay.color, fontSize: `${overlay.fontSize}px`, fontFamily: overlay.fontFamily, fontWeight: 'bold', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                      {overlay.text}
                    </div>
                  ))}
                  {stickers.map((st, idx) => (
                    <div key={idx} className="absolute text-4xl" style={{ top: `${st.y}%`, left: `${st.x}%`, transform: 'translate(-50%, -50%)' }}>
                      {st.emoji}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sticker Tray */}
            {showStickerTray && (
              <div className="absolute bottom-20 left-4 right-4 bg-surface-soft/95 backdrop-blur-md p-4 rounded-2xl border border-border z-50 max-h-48 overflow-y-auto">
                <p className="text-xs font-bold text-muted mb-2">Select Sticker</p>
                <div className="grid grid-cols-6 gap-3 justify-items-center">
                  {['🔥', '✨', '💻', '🚀', '💯', '❤️', '📅', '🎉', '💡', '⚠️', '🍿', '🎧'].map(emoji => (
                    <button key={emoji} onClick={() => handleAddSticker(emoji)} className="text-2xl hover:scale-125 transition-transform">{emoji}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Text Input Overlay */}
            {showTextInput && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
                <input 
                  autoFocus
                  type="text"
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                  placeholder="Type overlay text..."
                  className="bg-transparent border-none text-white text-3xl font-bold text-center focus:outline-none w-full"
                />
                
                <div className="flex gap-2 mt-4">
                  {['#FFFFFF', '#FF5F45', '#7B61FF', '#00D4FF', '#00C896', '#FFB800'].map(c => (
                    <button key={c} onClick={() => setBrushColor(c)} className={`w-6 h-6 rounded-full border ${brushColor === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>

                <button onClick={handleAddText} className="mt-6 btn-primary px-6 py-2 text-xs">Add Text</button>
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
              <button onClick={handleSubmit} className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg shadow-primary/45">
                <Send size={18} className="ml-0.5" />
              </button>
            </div>
          )}
          
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StoryCreatorModal;
