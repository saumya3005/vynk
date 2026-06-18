import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreVertical, Music } from 'lucide-react';

const MOCK_REELS = [
  {
    id: 1,
    user: 'dev_sarah',
    caption: 'Building glassmorphism components with Tailwind CSS ✨ #coding #webdev',
    likes: '12.4k',
    comments: '428',
    videoUrl: 'https://cdn.pixabay.com/video/2021/08/11/84545-587428867_tiny.mp4',
    isLiked: false
  },
  {
    id: 2,
    user: 'code_josh',
    caption: 'My weekend setup 💻☕ #desksetup #developer',
    likes: '8.1k',
    comments: '102',
    videoUrl: 'https://cdn.pixabay.com/video/2019/11/14/29168-373678033_tiny.mp4',
    isLiked: true
  }
];

const ReelCard = ({ reel }) => {
  const [isLiked, setIsLiked] = useState(reel.isLiked);

  return (
    <div className="w-full max-w-sm h-[80vh] md:h-150 bg-black rounded-3xl overflow-hidden relative shadow-2xl snap-center shrink-0 border border-vynk-border/20">
      
      {/* Video Placeholder (Actual video element) */}
      <video 
        src={reel.videoUrl} 
        autoPlay 
        loop 
        muted 
        playsInline
        className="w-full h-full object-cover opacity-80"
      />

      {/* Right Actions */}
      <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6 z-10">
        <button onClick={() => setIsLiked(!isLiked)} className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-black/60 transition-colors">
            <motion.div whileTap={{ scale: 0.8 }}>
              <Heart size={24} className={isLiked ? 'fill-vynk-primary text-vynk-primary' : ''} />
            </motion.div>
          </div>
          <span className="text-white text-xs font-bold shadow-black drop-shadow-md">{reel.likes}</span>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-black/60 transition-colors">
            <MessageCircle size={24} />
          </div>
          <span className="text-white text-xs font-bold shadow-black drop-shadow-md">{reel.comments}</span>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-black/60 transition-colors">
            <Share2 size={24} />
          </div>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-black/60 transition-colors">
            <MoreVertical size={24} />
          </div>
        </button>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-linear-to-t from-black/80 via-black/40 to-transparent z-10 pt-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-vynk-secondary to-vynk-accent border border-white/20"></div>
          <span className="text-white font-bold">{reel.user}</span>
          <button className="px-3 py-1 text-xs font-bold text-white border border-white/40 rounded-full hover:bg-white/20 transition-colors">Follow</button>
        </div>
        <p className="text-white/90 text-sm mb-2">{reel.caption}</p>
        <div className="flex items-center gap-2 text-white/70 text-xs bg-white/10 w-max px-3 py-1.5 rounded-full backdrop-blur-sm">
          <Music size={12} className="animate-pulse" />
          <span>Original Audio - {reel.user}</span>
        </div>
      </div>
    </div>
  );
};

const Reels = () => {
  return (
    <div className="w-full h-[calc(100vh-80px)] md:h-screen flex flex-col items-center overflow-y-auto snap-y snap-mandatory scrollbar-hide py-4 gap-8">
      {MOCK_REELS.map(reel => (
        <ReelCard key={reel.id} reel={reel} />
      ))}
      {MOCK_REELS.map(reel => (
        <ReelCard key={`dup-${reel.id}`} reel={{...reel, id: reel.id + 10}} />
      ))}
    </div>
  );
};

export default Reels;
